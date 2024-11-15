module.exports = {
  collectCoverage: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.(test|spec).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
  ],
  coverageReporters: ["text", "html", "json"],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testEnvironment: 'node',
};
