import { describe, expect, it } from '@jest/globals';
import {
  validateDatabase,
  validateFramework,
  validatePort,
  validateProjectName,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validateProjectName', () => {
    it('should accept valid project names', () => {
      const validNames = [
        'my-project',
        'project123',
        'awesome-app',
        '@org/package',
      ];

      validNames.forEach(name => {
        expect(() => validateProjectName(name)).not.toThrow();
        expect(validateProjectName(name)).toBe(name);
      });
    });

    it('should reject invalid project names', () => {
      const invalidNames = [
        '',
        'Project',
        'my project',
        '../project',
        'project!',
      ];

      invalidNames.forEach(name => {
        expect(() => validateProjectName(name)).toThrow();
      });
    });
  });

  describe('validatePort', () => {
    it('should accept valid ports', () => {
      const validPorts = [1, 80, 3000, 8080, 65535];

      validPorts.forEach(port => {
        expect(() => validatePort(port)).not.toThrow();
        expect(validatePort(port)).toBe(port);
      });
    });

    it('should reject invalid ports', () => {
      const invalidPorts = [0, -1, 65536, NaN];

      invalidPorts.forEach(port => {
        expect(() => validatePort(port)).toThrow();
      });
    });
  });

  describe('validateFramework', () => {
    it('should accept valid frameworks', () => {
      expect(validateFramework('express')).toBe('express');
      expect(validateFramework('koa')).toBe('koa');
    });

    it('should reject invalid frameworks', () => {
      const invalidFrameworks = ['', 'fastify', 'nest', 'invalid'];

      invalidFrameworks.forEach(framework => {
        expect(() => validateFramework(framework)).toThrow();
      });
    });
  });

  describe('validateDatabase', () => {
    it('should accept valid databases', () => {
      const validDatabases = ['mongodb', 'postgresql', 'mysql'];

      validDatabases.forEach(db => {
        expect(validateDatabase(db)).toBe(db);
      });
    });

    it('should accept undefined database', () => {
      expect(validateDatabase(undefined)).toBeUndefined();
    });

    it('should reject invalid databases', () => {
      const invalidDatabases = ['', 'sqlite', 'oracle', 'invalid'];

      invalidDatabases.forEach(db => {
        expect(() => validateDatabase(db)).toThrow();
      });
    });
  });
}); 