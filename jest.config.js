module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^pose-landmarker$': '<rootDir>/modules/pose-landmarker',
    '^setu-squircle$': '<rootDir>/modules/setu-squircle',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { esModuleInterop: true, allowSyntheticDefaultImports: true, jsx: 'react' } }],
  },
};
