// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.ts": [
      "esbuild-jest",
      {
        sourcemap: true,
      },
    ],
  },
  testPathIgnorePatterns: ["/__tests__/_helpers"],
};
