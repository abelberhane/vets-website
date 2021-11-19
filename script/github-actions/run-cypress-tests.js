const { runCommandSync } = require('../utils');

const tests = JSON.parse(process.env.TESTS);
const step = Number(process.env.STEP);
const numContainers = Number(process.env.NUM_CONTAINERS);
const divider = Math.ceil(tests.length / numContainers);

const batch = tests
  .map(test =>
    test.replace('/home/runner/work/vets-website/vets-website', '../../..'),
  )
  .slice(step * divider, (step + 1) * divider)
  .join(',');

if (batch !== '') {
  const status = runCommandSync(
    `TESTS=${batch} yarn cy:run --browser chrome --headless --reporter cypress-multi-reporters --reporter-options "configFile=config/cypress-reporters.json" --spec 'script/github-actions/tests/merged-cypress-tests.cypress.spec.js'`,
  );
  process.exit(status);
} else {
  process.exit(0);
}
