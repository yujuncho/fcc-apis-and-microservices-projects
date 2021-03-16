const app = require('./app');
const request = require('supertest');

beforeAll(() => {
    process.env.NODE_ENV = 'test';
})

describe('GET /api via async and await', () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/api");
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("Hello from server!");
    });
});

describe('GET /api via promises', () => {
    test("It should response the GET method", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(response => {
                expect(response.body.message).toEqual("Hello from server!");
            });
    });
});