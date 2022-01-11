import '../../../../tests/e2e/commands';

import ApiInitializer from '../../../../api/local-mock-api/e2e/ApiInitializer';
import ValidateVeteran from '../../../../tests/e2e/pages/ValidateVeteran';
import Introduction from '../pages/Introduction';
import NextOfKin from '../../../../tests/e2e/pages/NextOfKin';
import Demographics from '../../../../tests/e2e/pages/Demographics';
import Confirmation from '../pages/Confirmation';

describe('Pre-Check In Experience ', () => {
  let apiData = {};
  beforeEach(function() {
    const {
      initializeFeatureToggle,
      initializeSessionGet,
      initializeSessionPost,
      initializePreCheckInDataGet,
      initializePreCheckInDataPost,
    } = ApiInitializer;
    initializeFeatureToggle.withoutEmergencyContact();
    initializeSessionGet.withSuccessfulNewSession();

    initializeSessionPost.withSuccess();

    apiData = initializePreCheckInDataGet.withSuccess();

    initializePreCheckInDataPost.withSuccess();
  });
  afterEach(() => {
    cy.window().then(window => {
      window.sessionStorage.clear();
    });
  });
  it('Happy Path', () => {
    cy.visitPreCheckInWithUUID();
    // page: Validate
    ValidateVeteran.validatePageLoaded();
    ValidateVeteran.validateVeteran();
    cy.injectAxeThenAxeCheck();
    ValidateVeteran.attemptToGoToNextPage();

    // page: Introduction
    Introduction.validatePageLoaded();
    Introduction.countAppointmentList(apiData.payload.appointments.length);
    cy.injectAxeThenAxeCheck();

    Introduction.attemptToGoToNextPage();

    // page: Demographics
    Demographics.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
    Demographics.attemptToGoToNextPage();

    // page: Next of Kin
    NextOfKin.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
    NextOfKin.attemptToGoToNextPage();

    // page: Confirmation
    Confirmation.validatePageLoaded();
    cy.injectAxeThenAxeCheck();
  });
});
