const { runCommand } = require('./utils');
const exec = require('child_process').exec;

exec("find src -name '*.cypress.*.js' | tr '\n' ','", function(_err, stdout) {
  /* eslint-disable no-console */
  console.log('PERCY_PARALLEL_NONCE: ', process.env.PERCY_PARALLEL_NONCE);
  /* eslint-enable no-console */

  // const NUMBER_OF_STEPS = 6;
  const strings = stdout.split(',').sort();
  const divider = Math.ceil(strings.length / 6);
  const tests = strings
    .slice(
      Number(process.env.STEP) * divider,
      (Number(process.env.STEP) + 1) * divider,
    )
    .join(',');

  runCommand(
    `CYPRESS_BASE_URL=http://vets-website:3001 CYPRESS_CI=${
      process.env.CI
    } XDG_CONFIG_HOME=/tmp/cyhome${process.env.STEP} PERCY_TOKEN=${
      process.env.PERCY_TOKEN
    } PERCY_PARALLEL_NONCE=${
      process.env.PERCY_PARALLEL_NONCE
    } PERCY_PARALLEL_TOTAL=6 yarn cy:run --config video=false --spec '${tests}'`,
  );
});
