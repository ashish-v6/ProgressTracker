import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/models/**/*.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/config/**/*.ts',
    '!src/dtos/**/*.ts',
    '!src/interfaces/**/*.ts',
    '!src/types/**/*.ts',
    '!src/utils/logger.ts',
    '!src/middlewares/logger.middleware.ts',
    '!src/services/analytics.service.ts',
    '!src/services/dashboard.service.ts',
    '!src/services/progress.service.ts',
    '!src/services/statistics.service.ts',
    '!src/controllers/analytics.controller.ts',
    '!src/controllers/dashboard.controller.ts',
    '!src/controllers/reports.controller.ts',
    '!src/controllers/statistics.controller.ts',
    '!src/controllers/calendar.controller.ts',
    '!src/services/timer.service.ts',
    '!src/controllers/timer.controller.ts',
    '!src/models/timer.model.ts',
    '!src/services/streak.service.ts'
  ]
};

export default config;
