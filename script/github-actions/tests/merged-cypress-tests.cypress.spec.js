const tests = process.env.TESTS;
const splitTests = tests.split(',');

describe('Burial claim test', () => {
  for (const test of splitTests) {
    // eslint-disable-next-line import/no-dynamic-require
    require(`../../${test}`);
  }
});
