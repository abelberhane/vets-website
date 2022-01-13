/**
 * [TestRail-integrated] Spec for Outreach Events
 * @testrailinfo projectId 8
 * @testrailinfo suiteId 9
 * @testrailinfo groupId 3358
 * @testrailinfo runName OE-e2e-Events
 */

// IMPORTANT: This spec should NOT be run in CI.  Page-under-test is "semi-static," requiring BOTH content-build & vets-website local-servers to be running.

import moment from 'moment-timezone';

import * as helpers from './helpers';

describe('Outreach Events', () => {
  const contentHost = 'localhost:3002';
  const pagePath = '/outreach-and-events/events/';

  before(function() {
    // Can't run in CI because page requires content-build server too.
    if (Cypress.env('CI')) this.skip();
  });

  beforeEach(() => {
    cy.intercept('/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [
          {
            name: 'showEventsV2',
            value: true,
          },
          {
            name: 'show_events_v2',
            value: true,
          },
        ],
      },
    }).as('features');
    cy.visit(`http://${contentHost}${pagePath}`);
    cy.location('pathname').should('eq', pagePath);
  });

  it('loads page with accessible content - C13151', () => {
    cy.findAllByText(/outreach events/i, { selector: 'h1' })
      .first()
      .should('be.visible');
    cy.injectAxeThenAxeCheck();
  });

  /* eslint-disable va/axe-check-required */
  it('shows all upcoming events by default sorted date-ascending - C13152', () => {
    cy.get('[name="filterBy"]').should('have.value', 'upcoming');
    cy.findByTestId('results-query').should('have.text', 'All upcoming');
    cy.get('[data-testclass="event-date-time"]')
      .should('have.length.gt', 0)
      .then($dateParagraphs => {
        const now = moment();
        const timestamps = helpers.getEventTimestamps($dateParagraphs);
        expect(timestamps, 'Events are sorted date-ascending').to.be.ascending;
        expect(
          moment(timestamps[0]).isAfter(now),
          'First sorted event is future',
        ).to.be.true;
      });
  });

  it('shows specific-date events - C13855', () => {
    cy.get('[data-testclass="event-date-time"]').then($dateParagraphs => {
      const timestamps = helpers.getEventTimestamps($dateParagraphs);
      const selectedMM = moment(timestamps[0]).format('MM');
      const selectedDD = moment(timestamps[0]).format('DD');

      cy.get('[name="filterBy"]').select('specific-date');
      cy.get('[name="startDateMonth"]').select(selectedMM);
      cy.get('[name="startDateDay"]').select(selectedDD);
      cy.findByText(/apply filter/i, { selector: 'button' }).click();
      cy.findByTestId('results-query').should('have.text', 'Specific date');
      cy.get('[data-testclass="event-date-time"]').then($dateParagraphs2 => {
        const timestamps2 = helpers.getEventTimestamps($dateParagraphs2);

        timestamps2.forEach(t => {
          expect(
            moment(t).format('MM'),
            'Event month equals selected month',
          ).to.eq(selectedMM);
          expect(moment(t).format('DD'), 'Event day equals selected day').to.eq(
            selectedDD,
          );
        });
      });
    });
  });

  it('shows past events sorted date-descending - C13856', () => {
    cy.get('[name="filterBy"]').select('past');
    cy.findByText(/apply filter/i, { selector: 'button' }).click();
    cy.findByTestId('results-query').should('have.text', 'Past events');
    cy.get('[data-testclass="event-date-time"]')
      .should('have.length.gt', 0)
      .then($dateParagraphs => {
        const now = moment();
        const timestamps = helpers.getEventTimestamps($dateParagraphs);
        expect(timestamps, 'Events are sorted date-descending').to.be
          .descending;
        expect(
          moment(timestamps[0]).isBefore(now),
          'First sorted event is past',
        ).to.be.true;
      });
  });
  /* eslint-enable va/axe-check-required */
});
