import moment from 'moment-timezone';

export const getTimezoneName = tzAbbr => {
  // returns full international timezone name based on U.S. abbreviation
  const tzNames = {
    EST: 'America/New_York',
    EDT: 'America/New_York',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    MST: 'America/Phoenix',
    MDT: 'America/Denver',
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
  };

  return tzNames[tzAbbr.toUpperCase()];
};

export const getEventTimestamps = $dateParagraphs => {
  const dateTimeRangeStrings = Cypress._.map($dateParagraphs, 'innerText');
  const startDateTimeStrings = Cypress._.map(
    dateTimeRangeStrings,
    s =>
      s
        .split(' - ')[0]
        .substr(4)
        .replace(/\.|,/g, '') + s.substr(s.lastIndexOf(' ')),
  );
  const startDateTimes = Cypress._.map(startDateTimeStrings, s =>
    moment(s.substring(0, s.lastIndexOf(' ')), 'MMM D YYYY h:mm a').tz(
      getTimezoneName(s.substr(s.lastIndexOf(' ') + 1)),
    ),
  );
  return Cypress._.map(startDateTimes, d => d.valueOf());
};
