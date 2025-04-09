
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    'setupTests.js',
    'jest.setup.js',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
