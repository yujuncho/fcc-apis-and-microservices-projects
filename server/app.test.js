const app = require('./app');
const request = require('supertest');

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
                    expect(response.body.error).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with incorrect date format", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/20151225")
                .expect(400)
                .then(response => {
                    expect(response.body.error).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with epoch combined with a date", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/14510016000002015-12-25")
                .expect(400)
                .then(response => {
                    expect(response.body.error).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });

    test("400 with empty paramater", () => {
        expect.hasAssertions();
        return request(app)
                .get("/api/timestamp/")
                .expect(400)
                .then(response => {
                    expect(response.body.error).toBe('Incorrect date format :/ Please provide an epoch in milliseconds or use the format yyyy-mm-dd');
                });
    });
});

describe('GET /api/whoami', () => {
    test('200 with await and async', () => {
        const LOCALHOST = "127.0.0.1";
        const LOCALHOST_IPV6 = "::ffff:127.0.0.1";
        const LANGUAGE = "en-US,en;q=0.5";
        const SOFTWARE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0";

        return request(app)
                .get('/api/whoami')
                .connect(LOCALHOST)
                .set('Accept-Language', LANGUAGE) 
                .set('User-Agent', SOFTWARE)
                .expect(200)
                .then(response => {
                    expect(response.body.ipaddress).toMatch(new RegExp(`^${LOCALHOST}$|^${LOCALHOST_IPV6}$`));
                    expect(response.body.language).toBe(LANGUAGE);
                    expect(response.body.software).toBe(SOFTWARE);
                });
    });
});

describe('POST /api/shorturl/new', () => {
    test('201 for a new valid URL', async () => {
        expect.hasAssertions();
        let data = {
            url: "https://www.freecodecamp.org",
        };

        /* Promise method
        return request(app)
                .post('/api/shorturl/new')
                .send(data)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201)
                .then(response => {
                    expect(response.body.original_url).toBe(data.url);
                    expect(response.body.short_url).toMatch(/^[\w\d-]{4}$/);
                })
         */
        
        // Async/await method
        const response = await request(app)
                                .post('/api/shorturl/new')
                                .set('Accept', 'application/json')
                                .send(data);
        expect(response.header['content-type']).toMatch(/json/);
        expect(response.status).toBe(201);
        expect(response.body.original_url).toBe(data.url);
        expect(response.body.short_url).toMatch(/^[\w\d-]{4}$/);
    });

    // TODO: Connect to a database
    /*
    test('200 for a valid url which has already been shortened', async () => {
        expect.hasAssertions();
        let data = {
            url: "https://www.freecodecamp.org"
        };

        const firstResponse = await request(app)
                                .post('/api/shorturl/new')
                                .set('Accept', 'application/json')
                                .send(data);
        expect(firstResponse.header['content-type']).toMatch(/json/);
        expect(firstResponse.status).toBe(201);
        expect(firstResponse.body.original_url).toBe(data.url);
        expect(firstResponse.body.short_url).toMatch(/^[A-Za-z\d]{4}$/);

        const secondResponse = await request(app)
                                .post('/api/shorturl/new')
                                .set('Accept', 'application/json')
                                .send(data)
        expect(firstResponse.header['content-type']).toMatch(/json/);
        expect(firstResponse.status).toBe(200);
        expect(secondResponse.body.original_url).toBe(data.url);
        expect(secondResponse.body.short_url).toBe(firstResponse.body.short_url);
    });
    */

    test ('400 for empty url, invalid url, and invalid hostname', async () => {
        const emptyData = {
            url: ""
        };
        const responseToEmpty = await request(app)
                                .post('/api/shorturl/new')
                                .set('Accept', 'application/json')
                                .send(emptyData);
        expect(responseToEmpty.header['content-type']).toMatch(/html/);
        expect(responseToEmpty.status).toBe(400);

        const invalidData = {
            url: "freecodecamp.org"
        };
        const responseToInvalid = await request(app)
                                .post('/api/shorturl/new')
                                .set('Accept', 'application/json')
                                .send(invalidData);
        expect(responseToInvalid.header['content-type']).toMatch(/html/);
        expect(responseToInvalid.status).toBe(400);

        const invalidHostnameData = {
            url: "https://www.freecodecamp-1234567890.org"
        };
        const responseToInvalidHostname = await request(app)
                                            .post('/api/shorturl/new')
                                            .set('Accept', 'application/json')
                                            .send(invalidHostnameData);
        expect(responseToInvalidHostname.header['content-type']).toMatch(/html/);
        expect(responseToInvalidHostname.status).toBe(400);
    });
});
// TODO: Connect to a test database
// TODO: Create a GET test for /api/shorturl/:url