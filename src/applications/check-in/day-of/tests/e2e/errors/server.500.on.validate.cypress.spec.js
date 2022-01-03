import '../../../../tests/e2e/commands';

import ApiInitializer from '../../../../api/local-mock-api/e2e/ApiInitializer';
import Error from '../../../../tests/e2e/pages/Error';

describe('Check In Experience -- ', () => {
  beforeEach(function() {
    const { initializeFeatureToggle, initializeSessionGet } = ApiInitializer;
    initializeFeatureToggle.withCurrentFeatures();
    initializeSessionGet.withFailure(500);

    cy.window().then(window => {
      window.sessionStorage.clear();
    });
    cy.visitWithUUID();
  });
  afterEach(() => {
    cy.window().then(window => {
      window.sessionStorage.clear();
    });
  });
  it('C5736 - Validate - 500 api error', () => {
    Error.validateURL();
    Error.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
  });
});
