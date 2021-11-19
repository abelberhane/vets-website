const tests = process.env.TESTS;
const splitTests = tests.split(',');

describe('Batch 1', () => {
  for (const test of splitTests) {
    // eslint-disable-next-line import/no-dynamic-require
    require(test);
  }
});
