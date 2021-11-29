const { runCommandSync } = require('../utils');
const fs = require('fs');

const tests = JSON.parse(process.env.TESTS);
const step = 1;
const numContainers = 8;
const divider = Math.ceil(tests.length / numContainers);

const batch = tests
  .map(test =>
    test.replace('/home/runner/work/vets-website/vets-website', '../..'),
  )
  .slice(step * divider, (step + 1) * divider)
  .join(`'), test:`)
  .split(`, test:`)
  .map(
    test =>
      `'${(Math.random() + 1)
        .toString(36)
        .substring(7)}': () => require('${test}`,
  )
  .join();

runCommandSync(`mkdir -p src/tests/`);
runCommandSync(`touch src/tests/merged-cypress-tests.cypress.spec.js`);

const fileText = `const tests = Object.entries({
  ${batch}'),});

  describe('Batch ${step}', () => {
    for (const element of tests) {
      element[1]();
    }
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
