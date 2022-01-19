import moment from 'moment-timezone';
import { perPage } from '../../components/Events/constants';

export const sortUpcomingEvents = events => {
  return events.sort(
    (a, b) =>
      a.fieldDatetimeRangeTimezone.value - b.fieldDatetimeRangeTimezone.value,
  );
};

export const getPagesTotal = events => {
  return Math.ceil(events.length / perPage);
};

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

export const getResultDatetime = $dateParagraph => {
  console.log('$dateParagraph:', $dateParagraph);
  const dateTimeRangeString = $dateParagraph.text();
  const startDateTimeString =
    dateTimeRangeString
      .split(' - ')[0]
      .substr(4)
      .replace(/\.|,/g, '') +
    dateTimeRangeString.substr(dateTimeRangeString.lastIndexOf(' '));
  return moment(
    startDateTimeString.substring(0, startDateTimeString.lastIndexOf(' ')),
    'MMM D YYYY h:mm a',
  ).tz(
    getTimezoneName(
      startDateTimeString.substr(startDateTimeString.lastIndexOf(' ') + 1),
    ),
  );
};

export const getResultTimestamp = $dateParagraph => {
  return getResultDatetime($dateParagraph).valueOf();
};

export const getResultDatetimes = $dateParagraphs => {
  const dateTimeRangeStrings = Cypress._.map($dateParagraphs, 'innerText');
  const startDateTimeStrings = Cypress._.map(
    dateTimeRangeStrings,
    s =>
      s
        .split(' - ')[0]
        .substr(4)
        .replace(/\.|,/g, '') + s.substr(s.lastIndexOf(' ')),
  );
  return Cypress._.map(startDateTimeStrings, s =>
    moment(s.substring(0, s.lastIndexOf(' ')), 'MMM D YYYY h:mm a').tz(
      getTimezoneName(s.substr(s.lastIndexOf(' ') + 1)),
    ),
  );
};

export const getResultTimestamps = $dateParagraphs => {
  return Cypress._.map(getResultDatetimes($dateParagraphs), d => d.valueOf());
};

export const getRandomEventDate = events => {
  return moment(
    events[Math.floor(Math.random * events.length)].fieldDatetimeRangeTimezone
      .value * 1000,
  );
};

export const getRandomEventDates = sortedEvents => {
  const splitIndex = Math.floor(sortedEvents.length / 2);
  const events1stHalf = sortedEvents.slice(0, splitIndex);
  const events2ndHalf = sortedEvents.slice(splitIndex);
  const randomStartEvent =
    events1stHalf[Math.floor(Math.random() * events1stHalf.length)];
  const randomEndEvent =
    events2ndHalf[Math.floor(Math.random() * events2ndHalf.length)];

  return [
    moment(randomStartEvent.fieldDatetimeRangeTimezone.value * 1000),
    moment(randomEndEvent.fieldDatetimeRangeTimezone.value * 1000),
  ];
};

export const getSpecificDateEvents = (desiredMM, desiredDD, events) => {
  const isSelectedDate = evt => {
    const dateTime = moment(evt.fieldDatetimeRangeTimezone.value * 1000);
    return (
      dateTime.format('MM') === desiredMM && dateTime.format('DD') === desiredDD
    );
  };

  return events.filter(isSelectedDate);
};

export const getDateRangeEvents = (desiredDates, events) => {
  return sortUpcomingEvents(
    events.filter(evt => {
      const evtDate = moment(evt.fieldDatetimeRangeTimezone.value * 1000);

      return (
        evtDate.isSameOrAfter(desiredDates[0], 'day') &&
        evtDate.isSameOrBefore(desiredDates[1], 'day')
      );
    }),
  );
};
