import '../../../../tests/e2e/commands';

import ApiInitializer from '../../../../api/local-mock-api/e2e/ApiInitializer';
import Introduction from '../../../tests/e2e/pages/Introduction';

describe('Pre-Check In Experience ', () => {
  beforeEach(function() {
    const {
      initializeFeatureToggle,
      initializeSessionGet,
      initializePreCheckInDataGet,
    } = ApiInitializer;
    initializeFeatureToggle.withCurrentFeatures();
    initializeSessionGet.withSuccessfulReturningSession();
    initializePreCheckInDataGet.withSuccess();
  });
  afterEach(() => {
    cy.window().then(window => {
      window.sessionStorage.clear();
    });
  });
  it('an existing session redirects to introduction page', () => {
    cy.visitPreCheckInWithUUID();
    Introduction.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
  });
});
