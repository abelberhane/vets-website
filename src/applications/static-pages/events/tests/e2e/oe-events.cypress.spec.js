/**
 * [TestRail-integrated] Spec for Outreach Events
 * @testrailinfo projectId 8
 * @testrailinfo suiteId 9
 * @testrailinfo groupId 3358
 * @testrailinfo runName OE-e2e-Events
 */

// IMPORTANT: This spec should NOT be run in CI.  Page-under-test is "semi-static," requiring BOTH content-build & vets-website local-servers to be running.
// BEFORE RUNNING THIS SPEC, run vets-website yarn build, then content-build yarn watch, then vets-website yarn watch.

import moment from 'moment-timezone';

import * as cmpConstants from '../../components/Events/constants';
import e2eConstants from './fixtures/constants';
import * as helpers from './helpers';

describe('Outreach Events', () => {
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
    cy.visit(
      `http://localhost:${e2eConstants.CONTENT_PORT}${e2eConstants.PAGE_PATH}`,
    );
    cy.location('pathname').should('eq', e2eConstants.PAGE_PATH);
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
    cy.window().then(win => {
      const sortedEvents = helpers.sortEventsDateAscending(
        win.allEventTeasers.entities,
      );
      const sortedEventsTotal = sortedEvents.length;
      const pagesTotal = helpers.getPagesTotal(sortedEvents);
      cy.log(`sortedEventsTotal: ${sortedEventsTotal}`);

      cy.findByTestId('results-total').should(
        'have.text',
        sortedEventsTotal.toString(),
      );
      cy.get('[data-testclass="event-date-time"]')
        .should('have.length', sortedEventsTotal >= 10 ? 10 : sortedEventsTotal)
        .then($dateParagraphs => {
          const now = moment();
          const timestamps = helpers.getResultTimestamps($dateParagraphs);
          expect(timestamps, 'Events are sorted date-ascending').to.be
            .ascending;
          expect(
            moment(timestamps[0]).isAfter(now),
            'First sorted result is future',
          ).to.be.true;
        });
      if (pagesTotal > 1) {
        cy.get('.va-pagination-inner')
          .should('exist')
          .within(() => {
            cy.get('a:not(.va-pagination-active)')
              .last()
              .invoke('text')
              .then(txt => {
                expect(
                  txt.trim(),
                  'Pages-total is correct for events-total',
                ).to.equal(pagesTotal.toString());
              });
          });
      }
    });
  });
  /* eslint-enable va/axe-check-required */

  it('shows specific-date events - C13855', () => {
    cy.get('[data-testclass="event-date-time"]').then($dateParagraphs => {
      const timestamps = helpers.getResultTimestamps($dateParagraphs);
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

      cy.window().then(win => {
        const events = win.allEventTeasers.entities;
        const filteredEvents = helpers.getSpecificDateEvents(
          selectedMM,
          selectedDD,
          events,
        );
        const filteredEventsTotal = filteredEvents.length;
        const filteredPagesTotal = helpers.getPagesTotal(filteredEvents);
        cy.log('filteredEventsTotal:', filteredEventsTotal);

        cy.findByTestId('results-total').should(
          'have.text',
          filteredEventsTotal.toString(),
        );

        cy.get('[data-testclass="event-date-time"]')
          .should(
            'have.length',
            filteredEventsTotal >= 10 ? 10 : filteredEventsTotal,
          )
          .first()
          .then($dateParagraph => {
            const firstDatetime = helpers.getResultDatetime($dateParagraph);
            expect(
              firstDatetime.format('MM-DD'),
              'first event date matches selected date',
            ).to.equal(`${selectedMM}-${selectedDD}`);
          });

        if (filteredPagesTotal === 1) {
          cy.get('[data-testclass="event-date-time"]')
            .last()
            .then($dateParagraph => {
              const lastDatetime = helpers.getResultDatetime($dateParagraph);
              expect(
                lastDatetime.format('MM-DD'),
                'last event date matches selected date',
              ).to.equal(`${selectedMM}-${selectedDD}`);
            });
        } else {
          cy.get('.va-pagination-inner a')
            .last()
            .click();
          cy.findByTestId('results-start')
            .invoke('text')
            .then(txt => {
              cy.log(`results-start txt: ${txt}`);
              expect(
                parseInt(txt.trim(), 10),
                'results-start is correct for page',
              ).to.equal((filteredPagesTotal - 1) * cmpConstants.perPage - 1);
            });
          cy.get('[data-testclass="event-date-time"]')
            .last()
            .then($dateParagraph => {
              const lastDatetime = helpers.getResultDatetime($dateParagraph);
              expect(
                lastDatetime.format('MM-DD'),
                'last event date matches selected date',
              ).to.equal(`${selectedMM}-${selectedDD}`);
            });
        }
      });
    });
  });

  it('shows custom-date-range events - C13902', () => {
    cy.window().then(win => {
      const sortedEvents = helpers.sortEventsDateAscending(
        win.allEventTeasers.entities,
      );
      const desiredDates = helpers.getRandomEventDates(sortedEvents);
      const desiredStartMM = desiredDates[0].format('MM');
      const desiredStartDD = desiredDates[0].format('DD');
      const desiredEndMM = desiredDates[1].format('MM');
      const desiredEndDD = desiredDates[1].format('DD');
      const filteredEvents = helpers.getDateRangeEvents(
        desiredDates,
        sortedEvents,
      );
      const filteredEventsTotal = filteredEvents.length;
      const filteredPagesTotal = helpers.getPagesTotal(filteredEvents);
      cy.log('filteredEventsTotal:', filteredPagesTotal);

      cy.get('[name="filterBy"]').select('custom-date-range');
      cy.get('[name="startDateMonth"]').select(desiredStartMM);
      cy.get('[name="startDateDay"]').select(desiredStartDD);
      cy.get('[name="endDateMonth"]').select(desiredEndMM);
      cy.get('[name="endDateDay"]').select(desiredEndDD);
      cy.findByText(/apply filter/i, { selector: 'button' }).click();
      cy.findByTestId('results-query').should('have.text', 'Custom date range');
      cy.findByTestId('results-total').should(
        'have.text',
        filteredEventsTotal.toString(),
      );

      cy.injectAxeThenAxeCheck();

      cy.get('[data-testclass="event-date-time"]')
        .should(
          'have.length',
          filteredEventsTotal >= 10 ? 10 : filteredEventsTotal,
        )
        .first()
        .then($dateParagraph => {
          const startResultDatetime = helpers.getResultDatetime($dateParagraph);
          cy.log('startResultDatetime:', startResultDatetime);

          expect(
            startResultDatetime.isSameOrAfter(desiredDates[0], 'day'),
            'first result is on/after desired start-date',
          ).to.be.true;
        });

      if (filteredPagesTotal > 1) {
        cy.get('.va-pagination-inner')
          .last()
          .scrollIntoView()
          .find('a')
          .last()
          .click({ force: true });
        cy.location('pathname').should(
          'include',
          `/page-${filteredPagesTotal}`,
        );
      }
      cy.get('[data-testclass="event-date-time"]')
        .last()
        .then($dateParagraph => {
          const lastDatetime = helpers.getResultDatetime($dateParagraph);
          expect(
            lastDatetime.isSameOrBefore(desiredDates[1], 'day'),
            'last result is on/before desired end-date',
          ).to.be.true;
        });
    });
  });

  it('shows past events sorted date-descending - C13856', () => {
    cy.window().then(win => {
      const pastEvents = win.pastEvents.entities;
      const sortedEvents = helpers.sortEventsDateDescending(pastEvents);
      const eventsTotal = sortedEvents.length;
      const pagesTotal = helpers.getPagesTotal(sortedEvents);
      cy.log(`eventsTotal: ${eventsTotal}; pagesTotal: ${pagesTotal}`);

      cy.get('[name="filterBy"]').select('past');
      cy.findByText(/apply filter/i, { selector: 'button' }).click();
      cy.findByTestId('results-query').should('have.text', 'Past events');

      cy.injectAxeThenAxeCheck();

      cy.get('[data-testclass="event-date-time"]')
        .should('have.length', pagesTotal > 1 ? 10 : eventsTotal)
        .then($dateParagraphs => {
          const now = moment();
          const timestamps = helpers.getResultTimestamps($dateParagraphs);
          expect(timestamps, 'Events are sorted date-descending').to.be
            .descending;
          expect(
            moment(timestamps[0]).isBefore(now),
            'First sorted result is past',
          ).to.be.true;
        });
      if (pagesTotal > 1) {
        cy.get('.va-pagination-inner')
          .should('exist')
          .within(() => {
            cy.get('a:not(.va-pagination-active)').then($links => {
              cy.log('Pagination-links:', $links);
              cy.log(`First link text: ${$links.first().text()}`);
              cy.log(`Last link text: ${$links.last().text()}`);
            });
          });
      }
    });
  });
});
