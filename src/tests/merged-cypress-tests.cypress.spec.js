/* eslint-disable import/no-absolute-path */

const testt = Object.entries({
  "1": () => require('/Users/dariuszdzien/code/vets-website/src/applications/check-in/day-of/tests/e2e/phase-3-multiple-appointments/happy-path/current.happy.path.cypress.spec.js'),
  "2": () => require('/Users/dariuszdzien/code/vets-website/src/applications/check-in/day-of/tests/e2e/phase-3-multiple-appointments/happy-path/everything.happy.path.cypress.spec.js'),
  "3":() => require('/Users/dariuszdzien/code/vets-website/src/applications/check-in/day-of/tests/e2e/phase-3-multiple-appointments/multiple-appointments/already.checked.in.appointment.cypress.spec.js')
});


describe('Batch 1', () => {
  for (const property in testt) {
    testt[property];
  }
});
