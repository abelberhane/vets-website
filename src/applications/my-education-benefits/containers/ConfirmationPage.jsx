import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import environment from 'platform/utilities/environment';
import FormFooter from '../components/FormFooter';
import {
  fetchClaimStatus,
  CLAIM_STATUS_RESPONSE_ELIGIBLE,
  CLAIM_STATUS_RESPONSE_DENIED,
  CLAIM_STATUS_RESPONSE_IN_PROGRESS,
  CLAIM_STATUS_RESPONSE_ERROR,
} from '../actions';
import { formatReadableDate } from '../helpers';

const LETTER_URL = `${environment.API_URL}/meb_api/v0/claim_letter`;

function printPage() {
  window.print();
}

const approvedPage = (claimantName, confirmationDate) => (
  <div className="meb-confirmation-page meb-confirmation-page_approved">
    <va-alert status="success">
      <h3 slot="headline">
        Congratulations! You have been approved for the Post-9/11 GI Bill
      </h3>
      <p>
        We reviewed your application and have determined that you are entitled
        to educational benefits under the Post-9/11 GI Bill. Your Certificate of
        Eligibility is now available. A physical copy will also be mailed to
        your mailing address.
      </p>
      <a
        type="button"
        className="usa-button-primary va-button-primary"
        href={LETTER_URL}
        download
      >
        Download your Certificate of Eligibility
      </a>
      <a href="https://www.va.gov/education/gi-bill/post-9-11/ch-33-benefit/ ">
        View a statement of your benefits
      </a>
    </va-alert>

    <div className="feature">
      <h3>Application for VA education benefits (Form 22-1990)</h3>
      {claimantName.trim() ? <p>For {claimantName}</p> : <></>}
      <dl>
        <dt>Date received</dt>
        <dd>{confirmationDate}</dd>
      </dl>
      <button
        className="usa-button meb-print"
        onClick={printPage}
        type="button"
      >
        Print this page
      </button>
    </div>

    <h2>What happens next?</h2>
    <ul>
      <li>
        Download a copy of your{' '}
        <a href={LETTER_URL} download>
          Certificate of Eligibility
        </a>
      </li>
      <li>
        Use our{' '}
        <a href="/education/gi-bill-comparison-tool/ ">
          GI Bill Comparison Tool
        </a>{' '}
        to help you decide which education program and school is best for you.
      </li>
      <li>
        Once you’ve selected a school or program, you may bring your Certificate
        of Eligibility to your School Certifying Official to provide proof of
        eligibility.
      </li>
      <li>
        Review and/or update your direct deposit information on your{' '}
        <a href="/change-direct-deposit/">VA.gov profile</a>.
      </li>
      <li>
        Learn more about VA benefits and programs through the{' '}
        <a
          href="https://blogs.va.gov/VAntage/78073/new-guide-series-provides-gi-bill-benefits-information/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Building Your Future with the GI Bill Series
        </a>
        .
      </li>
    </ul>

    <va-additional-info trigger="What is a Certificate of Eligibility?">
      <p>
        A Certificate of Eligibility is an official document from the U.S.
        Department of Veterans Affairs that details your GI Bill benefit status.
        You may provide this official document to your educational institution
        to prove your eligibility status.
      </p>
      <a
        href="https://benefits.va.gov/gibill/understandingyourcoe.asp"
        target="_blank"
        rel="noopener noreferrer"
      >
        Understanding your Certificate of Eligibility
      </a>
    </va-additional-info>

    <a className="vads-c-action-link--green" href="/my-va/">
      Go to your My VA dashboard
    </a>

    <FormFooter />
  </div>
);

const deniedPage = (claimantName, confirmationDate) => (
  <div className="meb-confirmation-page meb-confirmation-page_denied">
    <va-alert status="info">
      <h3 slot="headline">You’re not eligible for this benefit</h3>
      <p>
        Unfortunately, based on the information you provided and Department of
        Defense records, we have determined you are not eligible for the
        Post-9/11 GI Bill program at this time.
      </p>
      <p>
        Your denial letter, which explains why you are ineligible, is now
        available. A physical copy will also be mailed to your mailing address.{' '}
      </p>
      <a
        type="button"
        className="usa-button meb-print"
        href={LETTER_URL}
        download
      >
        Download your letter
      </a>
    </va-alert>

    <div className="feature">
      <h3>Application for VA education benefits (Form 22-1990)</h3>
      {claimantName.trim() ? <p>For {claimantName}</p> : <></>}
      <dl>
        <dt>Date received</dt>
        <dd>{confirmationDate}</dd>
      </dl>
      <button
        className="usa-button meb-print"
        onClick={printPage}
        type="button"
      >
        Print this page
      </button>
    </div>

    <h2>What happens next?</h2>
    <ul>
      <li>
        Download a copy of your{' '}
        <a href={LETTER_URL} download>
          Denial Letter
        </a>
      </li>
      <li>
        We will review your eligibility for other VA education benefit programs.
      </li>
      <li>
        You will be notified if you are eligible for other VA education
        benefits.
      </li>
      <li>There is no further action required by you at this time.</li>
    </ul>

    <a className="vads-c-action-link--green" href="/my-va/">
      Go to your My VA dashboard
    </a>

    <FormFooter />
  </div>
);

const errorPage = () => (
  <div className="meb-confirmation-page meb-confirmation-page_denied">
    <va-alert close-btn-aria-label="Close notification" status="error" visible>
      <h3 slot="headline">There was an error processing your claim</h3>
      <div>
        We’re sorry we couldn’t process your Post-9/11 GI Bill
        <sup>&reg;</sup> application. Please try again later.
      </div>
    </va-alert>

    <FormFooter />
  </div>
);

const pendingPage = (claimantName, confirmationDate) => (
  <div className="meb-confirmation-page meb-confirmation-page_denied">
    <va-alert status="success">
      <h3 slot="headline">We’ve received your application</h3>
      <p>
        Your application requires additional review. Once we have reviewed your
        application, we will reach out to notify you about next steps.
      </p>
    </va-alert>

    <div className="feature">
      <h3>Application for VA education benefits (Form 22-1990)</h3>
      {claimantName.trim() ? <p>For {claimantName}</p> : <></>}
      <dl>
        <dt>Date received</dt>
        <dd>{confirmationDate}</dd>
      </dl>
      <button
        className="usa-button meb-print"
        onClick={printPage}
        type="button"
      >
        Print this page
      </button>
    </div>

    <h2>When will I hear back about my application?</h2>
    <div className="feature meb-feature--secondary">
      <h2>In 1 month</h2>
      <hr className="meb-hr" />
      <p>
        If more than a month has passed since you gave us your application and
        you haven’t heard back, please don’t apply again. Call our toll-free
        Education Call Center at <a href="tel:1-888-442-4551">1-888-442-4551</a>{' '}
        or <a href="tel:001-918-781-5678">001-918-781-5678</a> if you are
        outside the U.S.
      </p>
    </div>

    <h2>What happens next?</h2>
    <ul>
      <li>We will review your eligibility for the Post-9/11 GI Bill.</li>
      <li>We may reach out with questions about your application.</li>
      <li>
        You will be notified if you are eligible for VA education benefits.
      </li>
      <li>There is no further action required by you at this time.</li>
    </ul>

    <h2>What can I do while I wait?</h2>
    <ul>
      <li>
        If you need to submit documentation to VA, such as service records,
        please send this through <a href="/contact-us">Ask VA</a>.
      </li>
      <li>
        Review and/or update your direct deposit information on{' '}
        <a href="/change-direct-deposit/">your VA.gov profile</a>.
      </li>
      <li>
        Use our{' '}
        <a href="/education/gi-bill-comparison-tool/ ">
          GI Bill Comparison Tool
        </a>{' '}
        to help you decide which education program and school is best for you.
      </li>
      <li>
        Learn more about VA benefits and programs through the{' '}
        <a href="https://blogs.va.gov/VAntage/78073/new-guide-series-provides-gi-bill-benefits-information/">
          Building Your Future with the GI Bill Series
        </a>
        .
      </li>
      <li>
        Measure your interests and skill levels and help figure out your career
        path with{' '}
        <a href="https://www.benefits.va.gov/gibill/careerscope.asp">
          CareerScope®
        </a>
        .
      </li>
    </ul>

    <a className="vads-c-action-link--green" href="/my-va/">
      Go to your My VA dashboard
    </a>

    <FormFooter />
  </div>
);

const loadingPage = (
  <div
    className="meb-confirmation-page meb-confirmation-page_loading"
    style={{ marginBottom: '3rem' }}
  >
    <va-loading-indicator
      label="Loading"
      message="Loading your results"
      set-focus
    />
  </div>
);

export const ConfirmationPage = ({
  claimStatus,
  getClaimStatus,
  userFullName,
}) => {
  useEffect(
    () => {
      if (!claimStatus) {
        getClaimStatus();
      }
    },
    [getClaimStatus, claimStatus],
  );

  const confirmationResult = claimStatus?.claimStatus;
  const confirmationDate = claimStatus?.receivedDate
    ? formatReadableDate(claimStatus?.receivedDate)
    : undefined;
  const claimantName = `${userFullName?.first || ''} ${userFullName?.middle ||
    ''} ${userFullName?.last || ''} ${userFullName?.suffix || ''}`;

  switch (confirmationResult) {
    case CLAIM_STATUS_RESPONSE_ELIGIBLE: {
      return approvedPage(claimantName, confirmationDate);
    }
    case CLAIM_STATUS_RESPONSE_DENIED: {
      return deniedPage(claimantName, confirmationDate);
    }
    case CLAIM_STATUS_RESPONSE_ERROR: {
      return errorPage();
    }
    case CLAIM_STATUS_RESPONSE_IN_PROGRESS: {
      return pendingPage(claimantName, confirmationDate);
    }
    default: {
      return loadingPage;
    }
  }
};

const mapStateToProps = state => ({
  claimStatus: state.data?.claimStatus,
  userFullName: state.form?.data['view:userFullName']?.userFullName,
});

const mapDispatchToProps = {
  getClaimStatus: fetchClaimStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfirmationPage);
