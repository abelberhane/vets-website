import '../../../../tests/e2e/commands';

import ApiInitializer from '../../../../api/local-mock-api/e2e/ApiInitializer';
import ValidateVeteran from '../../../../tests/e2e/pages/ValidateVeteran';
import Demographics from '../../../../tests/e2e/pages/Demographics';
import Appointments from '../pages/Appointments';

describe('Check In Experience -- ', () => {
  describe('update skip path -- ', () => {
    beforeEach(function() {
      const {
        initializeFeatureToggle,
        initializeSessionGet,
        initializeSessionPost,
        initializeCheckInDataGet,
        initializeCheckInDataPost,
      } = ApiInitializer;
      initializeFeatureToggle.withCurrentFeatures();
      initializeSessionGet.withSuccessfulNewSession();
      initializeSessionPost.withSuccess();
      initializeCheckInDataGet.withSuccess({
        numberOfCheckInAbledAppointments: 1,
        demographicsNeedsUpdate: true,
        nextOfKinNeedsUpdate: false,
        emergencyContactNeedsUpdate: false,
      });
      initializeCheckInDataPost.withSuccess();

      cy.visitWithUUID();
      ValidateVeteran.validatePageLoaded('Check in at VA');
      ValidateVeteran.validateVeteran();
      ValidateVeteran.attemptToGoToNextPage();
    });
    afterEach(() => {
      cy.window().then(window => {
        window.sessionStorage.clear();
      });
    });
    it('update only demographics path', () => {
      Demographics.validatePageLoaded();
      cy.injectAxeThenAxeCheck();
      Demographics.attemptToGoToNextPage();
      Appointments.validatePageLoaded();
    });
  });
});
