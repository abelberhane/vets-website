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
  // Testing the same page & state as above, so no need to repeat AXE check.
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
  /* eslint-enable va/axe-check-required */

  it('shows specific-date events - C13855', () => {
    cy.get('[data-testclass="event-date-time"]').then($dateParagraphs => {
      const timestamps = helpers.getEventTimestamps($dateParagraphs);
      const randomDate = moment(
        timestamps[Math.floor(Math.random() * timestamps.length)],
      );
      const selectedMM = randomDate.format('MM');
      const selectedDD = randomDate.format('DD');

      cy.get('[name="filterBy"]').select('specific-date');
      cy.get('[name="startDateMonth"]').select(selectedMM);
      cy.get('[name="startDateDay"]').select(selectedDD);
      cy.findByText(/apply filter/i, { selector: 'button' }).click();
      cy.findByTestId('results-query').should('have.text', 'Specific date');
      cy.injectAxeThenAxeCheck();

      cy.get('[data-testclass="event-date-time"]').then(
        $filteredDateParagraphs => {
          const filteredTimestamps = helpers.getEventTimestamps(
            $filteredDateParagraphs,
          );
          const filteredTimestampMin = Math.min(...filteredTimestamps);
          const filteredTimestampMax = Math.max(...filteredTimestamps);

          expect(
            moment(filteredTimestampMin).format('MM') === selectedMM &&
              moment(filteredTimestampMin).format('DD') === selectedDD &&
              moment(filteredTimestampMax).format('MM') === selectedMM &&
              moment(filteredTimestampMax).format('DD') === selectedDD,
            'All event-dates are same as selected-date',
          ).to.be.true;
        },
      );
    });
  });

  it('shows custom-date-range events - C13902', () => {
    cy.get('[data-testclass="event-date-time"]').then($dateParagraphs => {
      const timestamps = helpers.getEventTimestamps($dateParagraphs);
      const randomDates = helpers.getRandomDates(timestamps);
      const selectedStartMM = randomDates[0].format('MM');
      const selectedStartDD = randomDates[0].format('DD');
      const selectedEndMM = randomDates[1].format('MM');
      const selectedEndDD = randomDates[1].format('DD');

      cy.get('[name="filterBy"]').select('custom-date-range');
      cy.get('[name="startDateMonth"]').select(selectedStartMM);
      cy.get('[name="startDateDay"]').select(selectedStartDD);
      cy.get('[name="endDateMonth"]').select(selectedEndMM);
      cy.get('[name="endDateDay"]').select(selectedEndDD);
      cy.findByText(/apply filter/i, { selector: 'button' }).click();
      cy.findByTestId('results-query').should('have.text', 'Custom date range');
      cy.injectAxeThenAxeCheck();

      cy.get('[data-testclass="event-date-time"]').then(
        $filteredDateParagraphs => {
          const filteredTimestamps = helpers.getEventTimestamps(
            $filteredDateParagraphs,
          );
          const filteredTimestampMin = Math.min(...filteredTimestamps);
          const filteredTimestampMax = Math.max(...filteredTimestamps);
          const selectedStartTimestamp = moment
            .tz(
              `${moment().format(
                'YYYY',
              )}-${selectedStartMM}-${selectedStartDD} 00:01`,
              'Pacific/Honolulu',
            )
            .valueOf();
          const selectedEndTimestamp = moment
            .tz(
              `${moment().format(
                'YYYY',
              )}-${selectedEndMM}-${selectedEndDD} 23:59`,
              'America/Puerto_Rico',
            )
            .valueOf();

          expect(
            filteredTimestampMin >= selectedStartTimestamp &&
              filteredTimestampMax <= selectedEndTimestamp,
            'All event timestamps are within selected range',
          ).to.be.true;
        },
      );
    });
  });

  it('shows past events sorted date-descending - C13856', () => {
    cy.get('[name="filterBy"]').select('past');
    cy.findByText(/apply filter/i, { selector: 'button' }).click();
    cy.findByTestId('results-query').should('have.text', 'Past events');
    cy.injectAxeThenAxeCheck();

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
});
