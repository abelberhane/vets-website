import disableFTUXModals from 'platform/user/tests/disableFTUXModals';
import { rootUrl } from '../../manifest.json';
import mockDependents from './fixtures/mock-dependents.json';
import mockNoAwardDependents from './fixtures/mock-no-dependents-on-award.json';

const DEPENDENTS_ENDPOINT = '/dependents_applications/show';

const testAxe = () => {
  cy.injectAxe();
  cy.axeCheck();
};

const testHappyPath = () => {
  cy.intercept('GET', DEPENDENTS_ENDPOINT, mockDependents).as('mockDependents');
  cy.visit(rootUrl);
  testAxe();
  cy.findByRole('heading', { name: /Your VA Dependents/i }).should('exist');
  cy.findAllByRole('term', { name: /relationship/ }).should('have.length', 4);
  testAxe();
};

const testNoDependentsOnAward = () => {
  cy.intercept('GET', DEPENDENTS_ENDPOINT, mockNoAwardDependents).as(
    'mockNoAwardDependents',
  );
  cy.visit(rootUrl);
  cy.findByRole('heading', {
    name: /There are no dependents associated with your VA benefits/i,
  }).should('exist');
  testAxe();
};

const testEmptyResponse = () => {
  cy.intercept('GET', DEPENDENTS_ENDPOINT, {
    body: {
      data: {
        id: '',
        attributes: {
          persons: [],
        },
      },
    },
  }).as('emptyResponse');
  cy.visit(rootUrl);
  cy.findByRole('heading', {
    name: /We don't have dependents information on file for you/i,
  }).should('exist');
  testAxe();
};

const testServerError = () => {
  cy.intercept(DEPENDENTS_ENDPOINT, {
    body: {
      errors: [
        {
          title: 'Server Error',
          code: '500',
          status: '500',
        },
      ],
    },
    statusCode: 500,
  }).as('serverError');
  cy.visit(rootUrl);
  cy.findByRole('heading', {
    name: /We're sorry. Something went wrong on our end/i,
  }).should('exist');
  testAxe();
};

describe('View VA dependents', () => {
  beforeEach(() => {
    disableFTUXModals();
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'va_view_dependents_access',
            value: true,
          },
        ],
      },
    });
    cy.login();
  });

  it('should display a list of dependents on award and not on award', () => {
    testHappyPath();
    cy.percySnapshot();
  });
  it('should display a message when no dependents are on award', () => {
    testNoDependentsOnAward();
    cy.percySnapshot();
  });
  it('should display an alert when there are no dependents returned', () => {
    testEmptyResponse();
    cy.percySnapshot();
  });
  it('should display an alert when there is a server error', () => {
    testServerError();
    cy.percySnapshot();
  });
});
