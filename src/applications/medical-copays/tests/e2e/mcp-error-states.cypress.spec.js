import mockFeatureToggles from './fixtures/mocks/feature-toggles.json';
import error500 from './fixtures/mocks/error500.json';
import error404 from './fixtures/mocks/error404.json';
import error400 from './fixtures/mocks/error400.json';
import mockUser from './fixtures/mocks/mock-user.json';

describe('Medical Copays - Error States', () => {
  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles*', {
      statusCode: 200,
      body: mockFeatureToggles,
    }).as('features');
    cy.visit('/');
    cy.login(mockUser);
  });

  it('displays error alert - 500', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 500,
      body: error500,
    }).as('copays500');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@features');
    cy.wait('@copays500');
    cy.findByTestId('overview-page-title').should('exist');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  it('displays error alert - 404', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 404,
      body: error404,
    }).as('copays404');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@features');
    cy.wait('@copays404');
    cy.findByTestId('overview-page-title').should('exist');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  it('displays error alert - 400', () => {
    cy.intercept('GET', '/v0/medical_copays', {
      statusCode: 400,
      body: error400,
    }).as('copays400');
    cy.visit('/health-care/pay-copay-bill/your-current-balances/');
    cy.wait('@features');
    cy.wait('@copays400');
    cy.findByTestId('overview-page-title').should('exist');
    cy.findByTestId('error-alert').should('be.visible');
    cy.injectAxe();
    cy.axeCheck();
  });

  // TODO: Add tests for No-history, Not-enrolled, and Deceased alerts.
});
