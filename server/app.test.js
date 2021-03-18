const app = require('./app');
const request = require('supertest');
const { response } = require('express');

beforeAll(() => {
    process.env.NODE_ENV = 'test';
})

describe('GET /api', () => {
    test("200 with async and awaite", async () => {
        expect.hasAssertions();
        const response = await request(app).get("/api");
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Hello from server!");
    });

    test("200 with promise", () => {
        expect.hasAssertions();
        return request(app)
            .get("/api")
            .expect(200)
            .then(response => {
                expect(response.body.message).toEqual("Hello from server!");
            });
    });
});

describe('GET /api/timestamp/:date', () => {
    test("200 with yyyy-mm-dd format", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/2015-12-25")
                .expect(200)
                .then(response => {
                    expect(response.body.unix).toBe(1451001600000);
                    expect(response.body.utc).toBe("Fri, 25 Dec 2015 00:00:00 GMT");
                });
    });

    // 13 digits doesn't necessarily guarantee the time is in milliseconds
    test("200 with epoch in milliseconds", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/1451001600000")
                .expect(200)
                .then(response => {
                    expect(response.body.unix).toBe(1451001600000);
                    expect(response.body.utc).toBe("Fri, 25 Dec 2015 00:00:00 GMT");
                });
    });

    test("400 with epoch in seconds", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/1451001600")
                .expect(400)
                .then(response => {
                    expect(response.body.message).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with incorrect date format", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/20151225")
                .expect(400)
                .then(response => {
                    expect(response.body.message).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with epoch combined with a date", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/14510016000002015-12-25")
                .expect(400)
                .then(response => {
                    expect(response.body.message).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with empty paramater", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/")
                .expect(400)
                .then(response => {
                    expect(response.body.message).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });
});

describe('GET /api/whoami', () => {
    test('200 with await and async', () => {
        const IP_ADDRESS = "67.159.137.111";
        const LANGUAGE = "en-US,en;q=0.5";
        const SOFTWARE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0";

        return request(app)
                .get('/api/whoami')
                .set('X-Forwarded-For', IP_ADDRESS)
                .set('Accept-Language', LANGUAGE) 
                .set('User-Agent', SOFTWARE)
                .expect(200)
                .then(response => {
                    expect(response.body.ipaddress).toBe(IP_ADDRESS);
                    expect(response.body.language).toBe(LANGUAGE);
                    expect(response.body.software).toBe(SOFTWARE);
                });
    });
});