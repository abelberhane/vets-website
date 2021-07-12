// Node modules.
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
// Relative imports.
import * as customPropTypes from '../prop-types';
import {
  FORM_MOMENT_PRESENTATION_DATE_FORMAT,
  FORM_MOMENT_CONSTRUCTOR_DATE_FORMAT,
} from '../constants';
import FormTitle from './FormTitle';
import recordEvent from 'platform/monitoring/record-event';

// Helper to derive the download link props.
const deriveLinkPropsFromFormURL = url => {
  const linkProps = {};
  if (!url) return linkProps;

  const isSameOrigin = url.startsWith(window.location.origin);
  const isPDF = url.toLowerCase().includes('.pdf');

  if (!isSameOrigin || !isPDF) {
    // Just open in a new tab if we'd otherwise hit a CORS issue or if the form URL isn't a PDF.
    linkProps.target = '_blank';
  } else {
    // Use HTML5 `download` attribute.
    linkProps.download = true;
    if (isPDF) linkProps.type = 'application/pdf';
  }

  return linkProps;
};

export const deriveLatestIssue = (d1, d2) => {
  if (!d1 && !d2) return 'N/A';
  if (!d1) return moment(d2).format(FORM_MOMENT_PRESENTATION_DATE_FORMAT); // null scenarios
  if (!d2) return moment(d1).format(FORM_MOMENT_PRESENTATION_DATE_FORMAT);

  const date1Formatted = moment(d1).format(FORM_MOMENT_CONSTRUCTOR_DATE_FORMAT);
  const date2Formatted = moment(d2).format(FORM_MOMENT_CONSTRUCTOR_DATE_FORMAT);

  if (moment(date1Formatted).isAfter(date2Formatted))
    return moment(date1Formatted).format(FORM_MOMENT_PRESENTATION_DATE_FORMAT);

  return moment(date2Formatted).format(FORM_MOMENT_PRESENTATION_DATE_FORMAT);
};

const recordGAEventHelper = ({
  query,
  eventUrl,
  eventTitle,
  eventType,
  currentPage,
  currentPositionOnPage,
  totalResultsCount,
  totalResultsPages,
}) =>
  recordEvent({
    event: 'onsite-search-results-click', // remains consistent, push this event and metadata with each search result click
    'search-page-path': '/find-forms', // consistent for all search result clicks from this page
    'search-query': query, // dynamically populate with the search query
    'search-result-chosen-page-url': eventUrl, // populate with the full href of the form detail page or tool page
    'search-result-chosen-title': eventTitle, // or 'Download VA form 10-10EZ (PDF)' or 'Go to online tool'
    'search-result-type': eventType, // populate with 'pdf' if pdf, or 'cta' if "Go to online tool"
    'search-results-pagination-current-page': currentPage, // populate with the current pagination number at time of result click
    'search-results-position': currentPositionOnPage, // populate with position on page of result click, beginning with 1 as the first result, number in relation to total results on the page (10 being last with 10 results are shown)
    'search-results-total-count': totalResultsCount, // populate with the total number of search results at time of click
    'search-results-total-pages': totalResultsPages, // populate with total number of result pages at time of click
    'search-selection': 'Find forms', // populate consistently with 'Find forms'
    'search-results-top-recommendation': undefined, // consistently populate with undefined since there's no top recommendations surfaced here
    'search-typeahead-enabled': false, // consistently populate with false since there's no type ahead enabled for this search feature
  });

const deriveRelatedTo = ({
  vaFormAdministration,
  formType,
  benefitCategories,
}) => {
  let relatedTo = vaFormAdministration;

  if (formType === 'employment') {
    relatedTo = 'Employment or jobs at VA';
  }
  if (formType === 'non-va') {
    relatedTo = (
      <>
        A non-VA form. For other government agency forms, go to the{' '}
        <a href="https://www.gsa.gov/reference/forms">GSA forms library</a>
      </>
    );
  }

  if (benefitCategories?.length > 0) {
    relatedTo = benefitCategories.map(f => f.name).join(', ');
  }

  if (relatedTo) {
    return (
      <dd className="vads-u-margin-top--1 vads-u-margin-bottom--2">
        <dfn className="vads-u-font-weight--bold">Related to:</dfn> {relatedTo}
      </dd>
    );
  }

  return null;
};

const SearchResult = ({ form, formMetaInfo, showPDFInfoBox }) => {
  // Escape early if we don't have the necessary form attributes.
  if (!form?.attributes) {
    return null;
  }

  const {
    attributes: {
      firstIssuedOn,
      formType,
      formToolUrl,
      formDetailsUrl,
      language,
      lastRevisionOn,
      benefitCategories,
      vaFormAdministration,
      title,
      url,
    },
    id,
  } = form;

  // Derive the download link props.
  const linkProps = deriveLinkPropsFromFormURL(url);

  // Derive labels.
  const pdfLabel = url.toLowerCase().includes('.pdf') ? '(PDF)' : '';
  const lastRevision = deriveLatestIssue(firstIssuedOn, lastRevisionOn);

  const relatedTo = deriveRelatedTo({
    vaFormAdministration,
    formType,
    benefitCategories,
  });

  const recordGAEvent = (eventTitle, eventUrl, eventType) =>
    recordGAEventHelper({ ...formMetaInfo, eventTitle, eventUrl, eventType });

  return (
    <>
      <FormTitle
        id={id}
        formUrl={formDetailsUrl}
        lang={language}
        title={title}
        recordGAEvent={recordGAEvent}
      />
      <dd className="vads-u-margin-y--1 vsa-from-last-updated">
        <dfn className="vads-u-font-weight--bold">Form last updated:</dfn>{' '}
        {lastRevision}
      </dd>

      {relatedTo}
      {formToolUrl ? (
        <dd className="vads-u-margin-bottom--2p5">
          <a
            className="find-forms-max-content vads-u-display--flex vads-u-align-items--center vads-u-text-decoration--none"
            href={formToolUrl}
            onClick={() =>
              recordGAEvent(`Go to online tool`, formToolUrl, 'cta')
            }
          >
            <i
              aria-hidden="true"
              className="fas fa-chevron-circle-right fa-2x vads-u-margin-right--1"
              role="presentation"
            />
            <span className="vads-u-text-decoration--underline vads-u-font-weight--bold">
              Go to online tool
            </span>
            <span className="vads-u-visibility--screen-reader">
              for {id} {title}
            </span>
          </a>
        </dd>
      ) : null}
      {showPDFInfoBox ? (
        <dd>
          <va-alert status="info">
            <div className="usa-alert-text vads-u-font-size--base">
              <h3 slot="heading" className="vads-u-margin-top--0">
                You'll need to download this form and open it in Adobe Acrobat
                Reader
              </h3>
              <a href="https://www.va.gov/resources/what-if-im-having-trouble-opening-a-pdf/">
                Get instructions for opening the form in Acrobat Reader
              </a>
            </div>
          </va-alert>
        </dd>
      ) : null}
      <dd className="vads-u-margin-bottom--5">
        <a
          className="find-forms-max-content vads-u-text-decoration--none"
          href={url}
          rel="noreferrer noopener"
          onClick={() =>
            recordGAEvent(`Download VA form ${id} ${pdfLabel}`, url, 'pdf')
          }
          {...linkProps}
        >
          <i
            aria-hidden="true"
            className="fas fa-download fa-lg vads-u-margin-right--1"
            role="presentation"
          />
          <span className="vads-u-text-decoration--underline">
            Download VA form {id} {pdfLabel}
          </span>
        </a>
      </dd>
    </>
  );
};

SearchResult.propTypes = {
  form: customPropTypes.Form.isRequired,
  formMetaInfo: customPropTypes.FormMetaInfo,
  showPDFInfoBox: PropTypes.bool,
};

export default SearchResult;
