import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import express from 'express';
import { generateComponent } from '../../generators/component';
import request from 'supertest';

// Mock dos módulos
jest.mock('../../generators/component');
jest.mock('../../utils/logger');

describe('Admin Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Importar o router depois de limpar os mocks
    const { adminRouter } = require('../../admin');
    app.use('/admin', adminRouter);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('GET /admin/components/types', () => {
    it('should return all component types', async () => {
      const response = await request(app)
        .get('/admin/components/types')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(5);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('POST /admin/components', () => {
    const mockData = {
      name: 'User',
      type: 'route',
      framework: 'express',
      baseDir: '/test/dir',
      includeTests: true
    };

    it('should create a new component', async () => {
      (generateComponent as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/admin/components')
        .send(mockData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(generateComponent).toHaveBeenCalledWith(mockData);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/admin/components')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(generateComponent).not.toHaveBeenCalled();
    });

    it('should validate component type', async () => {
      const response = await request(app)
        .post('/admin/components')
        .send({ ...mockData, type: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(generateComponent).not.toHaveBeenCalled();
    });

    it('should validate framework', async () => {
      const response = await request(app)
        .post('/admin/components')
        .send({ ...mockData, framework: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(generateComponent).not.toHaveBeenCalled();
    });

    it('should handle generation errors', async () => {
      (generateComponent as jest.Mock).mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .post('/admin/components')
        .send(mockData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /admin/components', () => {
    it('should require baseDir', async () => {
      const response = await request(app)
        .get('/admin/components')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept optional type parameter', async () => {
      const response = await request(app)
        .get('/admin/components')
        .query({ baseDir: '/test/dir', type: 'route' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /admin/templates', () => {
    it('should return available templates', async () => {
      const response = await request(app)
        .get('/admin/templates')
        .expect(200);

      expect(response.body).toHaveProperty('route');
      expect(response.body).toHaveProperty('controller');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('middleware');
      expect(response.body).toHaveProperty('model');
    });
  });
}); 