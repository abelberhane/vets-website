// Node modules.
import React from 'react';
import PropTypes from 'prop-types';
import Pagination from '@department-of-veterans-affairs/component-library/Pagination';
import moment from 'moment-timezone';
// Relative imports.
import {
  deriveEventLocations,
  deriveMostRecentDate,
  deriveResultsEndNumber,
  deriveResultsStartNumber,
} from '../../helpers';

export const Results = ({
  onPageSelect,
  page,
  perPage,
  query,
  results,
  totalResults,
}) => {
  // Show no results found message.
  if (!results?.length) {
    return (
      <p className="vads-u-margin--0 vads-u-margin-top--2 vads-u-margin-bottom--1">
        No results found for <strong>{query}</strong>.
      </p>
    );
  }

  // Derive values for "Displayed x-x out of x results."
  const resultsStartNumber = deriveResultsStartNumber(page, perPage);
  const resultsEndNumber = deriveResultsEndNumber(page, perPage, totalResults);

  return (
    <>
      {/* Showing 10 results for All upcoming */}
      {results && (
        <p
          className="vads-u-margin--0 vads-u-margin-top--2 vads-u-margin-bottom--1"
          data-testid="results-synopsis"
        >
          <span>Displaying {resultsStartNumber}</span>
          <span className="vads-u-visibility--screen-reader">through</span>
          <span aria-hidden="true">&ndash;</span>
          <span>
            {resultsEndNumber} of {totalResults} results for{' '}
            <strong>{query}</strong>
          </span>
        </p>
      )}

      {/* Events */}
      {results && (
        <div className="vads-u-display--flex vads-u-flex-direction--column">
          {results?.map(event => {
            // Derive event properties.
            const entityUrl = event?.entityUrl;
            const fieldDescription = event?.fieldDescription;
            const title = event?.title;

            // Derive the most recent date.
            const mostRecentDate = deriveMostRecentDate(
              event?.fieldDatetimeRangeTimezone,
            );
            const startsAtUnix = mostRecentDate?.value;
            const endsAtUnix = mostRecentDate?.endValue;
            const timezone = mostRecentDate?.timezone;

            // Derive starts at and ends at.
            const formattedStartsAt = moment
              .tz(startsAtUnix * 1000, timezone)
              .format('ddd MMM D, YYYY, h:mm a');
            const formattedEndsAt = moment
              .tz(endsAtUnix * 1000, timezone)
              .format('h:mm a');
            const endsAtTimezone = moment
              .tz(endsAtUnix * 1000, timezone)
              .format('z');

            // Derive the event locations.
            const locations = deriveEventLocations(event);

            return (
              <div
                className="vads-u-display--flex vads-u-flex-direction--column vads-u-border-top--1px vads-u-border-color--gray-light vads-u-padding-y--4"
                key={`${title}-${entityUrl?.path}`}
                data-testid="event-wrapper"
              >
                {/* Title */}
                <h2
                  className="vads-u-margin--0 vads-u-font-size--h4"
                  data-testid="event-title"
                >
                  <a href={entityUrl.path}>{title}</a>
                </h2>

                {/* Description */}
                <p
                  className="vads-u-margin--0 vads-u-margin-y--1"
                  data-testid="event-description"
                >
                  {fieldDescription}
                </p>

                {/* When */}
                <div className="vads-u-display--flex vads-u-flex-direction--row">
                  <p className="vads-u-margin--0 vads-u-margin-right--0p5">
                    <strong>When:</strong>
                  </p>
                  <div className="vads-u-display--flex vads-u-flex-direction--column">
                    {/* Starts at and ends at */}
                    <p
                      className="vads-u-margin--0"
                      data-testid="event-date-time"
                    >
                      {formattedStartsAt} - {formattedEndsAt} {endsAtTimezone}
                    </p>

                    {/* Repeats */}
                    {event?.fieldDatetimeRangeTimezone?.length > 1 && (
                      <p
                        className="vads-u-margin--0"
                        data-testid="event-recurrence"
                      >
                        <i
                          className="fa fa-sync vads-u-font-size--sm vads-u-margin-right--0p5"
                          aria-hidden="true"
                        />{' '}
                        Repeats
                      </p>
                    )}
                  </div>
                </div>

                {/* Where */}
                {locations?.length > 0 && (
                  <div className="vads-u-display--flex vads-u-flex-direction--row vads-u-margin-top--1">
                    <p className="vads-u-margin--0 vads-u-margin-right--0p5">
                      <strong>Where:</strong>
                    </p>

                    <div
                      className="vads-u-display--flex vads-u-flex-direction--column"
                      data-testid="event-location"
                    >
                      {locations?.map(location => (
                        <p className="vads-u-margin--0" key={location}>
                          {location}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination bar */}
      <Pagination
        className="vads-u-border-top--0"
        onPageSelect={onPageSelect}
        page={page}
        pages={Math.ceil(totalResults / perPage)}
        maxPageListLength={perPage}
        showLastPage
      />
    </>
  );
};

Results.propTypes = {
  onPageSelect: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  query: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      entityUrl: PropTypes.object.isRequired,
      fieldDatetimeRangeTimezone: PropTypes.shape({
        endValue: PropTypes.number.isRequired,
        timezone: PropTypes.string,
        value: PropTypes.number.isRequired,
      }).isRequired,
      fieldDescription: PropTypes.string,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  totalResults: PropTypes.number.isRequired,
};

export default Results;
