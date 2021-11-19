// const splitTests = process.env.CYPRESS_TESTS.split(',');
const testt = process.env;

describe('Batch 1', () => {
  it('Batch 1', () => {
    // cy.task('log', process.env);
    cy.task('log', testt);
  });
  // for (const test of splitTests) {
  //   // eslint-disable-next-line import/no-dynamic-require
  //   require(`${test}`);
  // }
});
