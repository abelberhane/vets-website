const { runCommandSync } = require('../utils');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { integrationFolder, testFiles } = require('../../config/cypress.json');
const pattern = path.join(__dirname, '../..', integrationFolder, testFiles);
const tests = glob.sync(pattern);

// const tests = JSON.parse(process.env.TESTS);
const step = 1;
const numContainers = 8;
const divider = Math.ceil(tests.length / numContainers);

const batch = tests
  // .map(test =>
  //   test.replace('/home/runner/work/vets-website/vets-website', '../..'),
  // )
  .slice(step * divider, (step + 1) * divider)
  .join(`');})();(function() {require('`);

// runCommandSync(`mkdir -p src/tests/`);
// runCommandSync(`touch src/tests/merged-cypress-tests.cypress.spec.js`);

// const fileText = `describe('Batch ${step}', () => {
//   (function() {require('${batch}');})();
// });`;

// fs.writeFileSync('src/tests/merged-cypress-tests.cypress.spec.js', fileText);

if (batch !== '') {
  const status = runCommandSync(
    `yarn cy:run --browser chrome --headless --reporter cypress-multi-reporters --reporter-options "configFile=config/cypress-reporters.json" --spec 'src/tests/merged-cypress-tests.cypress.spec.js'`,
  );
  process.exit(status);
} else {
  process.exit(0);
}
