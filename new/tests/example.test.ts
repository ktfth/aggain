import request from 'supertest';
import app from '../src/index.js';

describe('Example API', () => {
  it('should return example response for GET /api/example', async () => {
    const response = await request(app)
      .get('/api/example')
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('should create example for POST /api/example', async () => {
    const data = { test: 'data' };
    const response = await request(app)
      .post('/api/example')
      .send(data)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(data);
  });
});