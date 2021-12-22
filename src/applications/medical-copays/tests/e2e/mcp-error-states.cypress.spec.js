/**
 * [TestRail-integrated] Spec for Medical Copays
 * @testrailinfo projectId 7
 * @testrailinfo suiteId 8
 * @testrailinfo groupId 3240
 * @testrailinfo runName MCP-e2e-ErrorStates
 */
import mockFeatureToggles from './fixtures/mocks/feature-toggles.json';
import mockUser from './fixtures/mocks/mock-user.json';
import error400 from './fixtures/mocks/error400.json';
import error404 from './fixtures/mocks/error404.json';
import error500 from './fixtures/mocks/error500.json';

describe('Medical Copays - Error States', () => {
  beforeEach(() => {
    cy.intercept('/v0/feature_toggles*', mockFeatureToggles).as('features');
    cy.visit('/');
    cy.wait('@features');
    cy.login(mockUser);
  });

  it('displays error alert - 400 - C12812', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 400,
      body: error400,
    }).as('copays400');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@copays400');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  it('displays error alert - 404 - C12813', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 404,
      body: error404,
    }).as('copays404');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@copays404');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  it('displays error alert - 500 - C12814', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 500,
      body: error500,
    }).as('copays500');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@copays500');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  it('displays no-history alert - C12815', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 200,
      body: { data: [] },
    }).as('copaysNoHistory');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@features');
    cy.wait('@copaysNoHistory');
    cy.findByTestId('no-history-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  // TODO: Add no-healthcare alert test (TR Case ID C12816).
});
