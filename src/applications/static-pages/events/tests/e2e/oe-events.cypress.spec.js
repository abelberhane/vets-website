/**
 * [TestRail-integrated] Spec for Outreach Events
 * @testrailinfo projectId 8
 * @testrailinfo suiteId 9
 * @testrailinfo groupId 3358
 * @testrailinfo runName OE-e2e-Events
 */

// IMPORTANT: This spec should NOT be run in CI.  Page-under-test is "semi-static," requiring BOTH content-build & vets-website local-servers to be running.

describe('Outreach Events', () => {
  const contentHost = 'localhost:3002';
  const pagePath = '/outreach-and-events/events/';
  const getEventTimestamps = $dateParagraphs => {
    const dateTimeRangeStrings = Cypress._.map($dateParagraphs, 'innerText');
    const startDateTimeStrings = Cypress._.map(
      dateTimeRangeStrings,
      s => s.split(' - ')[0] + s.substr(s.lastIndexOf(' ')),
    );
    const startDateTimes = Cypress._.map(
      startDateTimeStrings,
      s => new Date(s.replace(/\./g, '')),
    );

    return Cypress._.map(startDateTimes, d => d.getTime());
  };

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
    cy.findByText(/all upcoming/i, { selector: 'strong' }).should('be.visible');
    cy.get('[data-testid="event-date-time"]')
      .should('have.length.gt', 0)
      .then($dateParagraphs => {
        const now = Date.now();
        const timestamps = getEventTimestamps($dateParagraphs);
        expect(timestamps).to.be.ascending; // using chai-sorted
        cy.log(`Event timestamp: ${timestamps[0]}; Now timestamp: ${now}`);
        expect(
          timestamps[0],
          '1st sorted upcoming event should be future',
        ).to.be.greaterThan(now);
      });
  });
  /* eslint-enable va/axe-check-required */
});
