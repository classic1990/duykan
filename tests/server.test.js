const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
    describe('GET /api/test', () => {
        it('should return server status', async () => {
            const response = await request(app)
                .get('/api/test')
                .expect(200);
            
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Server is working!');
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/movies', () => {
        it('should return movies list', async () => {
            const response = await request(app)
                .get('/api/movies')
                .expect(200);
            
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/movies/:id', () => {
        it('should return a specific movie', async () => {
            const response = await request(app)
                .get('/api/movies/1')
                .expect(200);
            
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id');
        });

        it('should return 404 for non-existent movie', async () => {
            const response = await request(app)
                .get('/api/movies/999')
                .expect(404);
            
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/movies', () => {
        it('should create a new movie', async () => {
            const movieData = {
                title: 'Test Movie',
                description: 'Test Description',
                year: 2023,
                status: 'active'
            };

            const response = await request(app)
                .post('/api/movies')
                .send(movieData)
                .expect(201);
            
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('title', movieData.title);
        });

        it('should return 400 for missing title', async () => {
            const movieData = {
                description: 'Test Description',
                year: 2023
            };

            const response = await request(app)
                .post('/api/movies')
                .send(movieData)
                .expect(400);
            
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
