const { runCommandSync } = require('../utils');
const fs = require('fs');

const tests = JSON.parse(process.env.TESTS);
const step = Number(process.env.STEP);
const numContainers = Number(process.env.NUM_CONTAINERS);
const divider = Math.ceil(tests.length / numContainers);

const batch = tests
  .map(test =>
    test.replace('/home/runner/work/vets-website/vets-website', '../..'),
  )
  .slice(step * divider, (step + 1) * divider)
  .join(`');require('`);

runCommandSync(`mkdir -p src/tests/`);
runCommandSync(`touch src/tests/merged-cypress-tests.cypress.spec.js`);

const fileText = `describe('Batch ${step}', () => {
  require('${batch}');
});`;

fs.writeFileSync('src/tests/merged-cypress-tests.cypress.spec.js', fileText);

if (batch !== '') {
  const status = runCommandSync(
    `yarn cy:run --browser chrome --headless --reporter cypress-multi-reporters --reporter-options "configFile=config/cypress-reporters.json" --spec 'src/tests/merged-cypress-tests.cypress.spec.js'`,
  );
  process.exit(status);
} else {
  process.exit(0);
}
