/**
 * Tests for the centralized logger system
 */

import { logger, createLogger } from '@/lib/logger';

// Mock console methods
const originalConsole = {
  log: console.log,
  debug: console.debug,
  warn: console.warn,
  error: console.error,
};

describe('Logger', () => {
  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.debug = jest.fn();
    console.warn = jest.warn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.debug = originalConsole.debug;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('debug()', () => {
    it('should log debug messages in development', () => {
      logger.debug('Debug message', { data: 'test' });

      if (__DEV__) {
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining('Debug message'),
          { data: 'test' }
        );
      } else {
        expect(console.debug).not.toHaveBeenCalled();
      }
    });
  });

  describe('info()', () => {
    it('should log info messages', () => {
      logger.info('Info message', { userId: '123' });

      if (__DEV__) {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Info message'),
          { userId: '123' }
        );
      }
    });
  });

  describe('warn()', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
        ''
      );
    });
  });

  describe('error()', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred'),
        error,
        ''
      );
    });
  });

  describe('createLogger()', () => {
    it('should create logger with prefix', () => {
      const customLogger = createLogger('TestModule');
      customLogger.info('Test message');

      if (__DEV__) {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('[TestModule]'),
          ''
        );
      }
    });

    it('should support nested prefixes', () => {
      const parentLogger = createLogger('Parent');
      const childLogger = parentLogger.createChild('Child');

      childLogger.info('Nested message');

      if (__DEV__) {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('[Parent:Child]'),
          ''
        );
      }
    });
  });
});
