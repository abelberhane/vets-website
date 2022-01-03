import '../../../../tests/e2e/commands';

import ApiInitializer from '../../../../api/local-mock-api/e2e/ApiInitializer';
import Error from '../../../../tests/e2e/pages/Error';

describe('Check In Experience', () => {
  beforeEach(function() {
    const { initializeFeatureToggle } = ApiInitializer;
    initializeFeatureToggle.withCurrentFeatures();
  });
  afterEach(() => {
    cy.window().then(window => {
      window.sessionStorage.clear();
    });
  });
  it('C5724 - Token is not valid', () => {
    cy.visitWithUUID('MALFORMED_TOKEN');
    Error.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
  });
});
