const { runCommandSync } = require('../utils');

// const tests = JSON.parse(process.env.TESTS);
// const step = Number(process.env.STEP);
// const numContainers = Number(process.env.NUM_CONTAINERS);
// const divider = Math.ceil(tests.length / numContainers);

// const batch = tests
//   .map(test =>
//     test.replace('/home/runner/work/vets-website/vets-website', '../..'),
//   )
//   .slice(step * divider, (step + 1) * divider)
//   .join(',');

const batch =
  'src/applications/appeals/10182/tests/10182-notice-of-disagreement.cypress.spec.js,src/applications/ask-a-question/tests/cypress/ask-a-question.authed.cypress.spec.js';
if (batch !== '') {
  const status = runCommandSync(
    `CYPRESS_TESTS=${batch} yarn cy:run --browser chrome --headless --reporter cypress-multi-reporters --reporter-options "configFile=config/cypress-reporters.json" --spec 'src/tests/merged-cypress-tests.cypress.spec.js'`,
  );
  process.exit(status);
} else {
  process.exit(0);
}
