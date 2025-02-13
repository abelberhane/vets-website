import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { focusElement } from 'platform/utilities/ui';

import DownloadLetterLink from '../components/DownloadLetterLink';
import VeteranBenefitSummaryLetter from './VeteranBenefitSummaryLetter';

import { letterContent, bslHelpInstructions } from '../utils/helpers';
import { AVAILABILITY_STATUSES, LETTER_TYPES } from '../utils/constants';

export class LetterList extends React.Component {
  componentDidMount() {
    focusElement('.nav-header');
  }

  render() {
    const downloadStatus = this.props.letterDownloadStatus;
    const letterItems = (this.props.letters || []).map((letter, index) => {
      let content;
      let letterTitle;
      let helpText;
      if (letter.letterType === LETTER_TYPES.benefitSummary) {
        letterTitle = 'Benefit Summary and Service Verification Letter';
        content = <VeteranBenefitSummaryLetter />;
        helpText = bslHelpInstructions;
      } else if (letter.letterType === LETTER_TYPES.proofOfService) {
        letterTitle = 'Proof of Service Card';
        content = letterContent[letter.letterType] || '';
      } else {
        letterTitle = letter.name;
        content = letterContent[letter.letterType] || '';
      }

      let conditionalDownloadButton;
      if (
        letter.letterType !== LETTER_TYPES.benefitSummary ||
        this.props.optionsAvailable
      ) {
        conditionalDownloadButton = (
          <DownloadLetterLink
            letterType={letter.letterType}
            letterName={letter.name}
            downloadStatus={downloadStatus[letter.letterType]}
            key={`download-link-${index}`}
          />
        );
      }

      return (
        <va-accordion-item key={`collapsiblePanel-${index}`}>
          <h3 slot="headline">{letterTitle}</h3>
          <div>{content}</div>
          {conditionalDownloadButton}
          {helpText}
        </va-accordion-item>
      );
    });

    let eligibilityMessage;
    if (
      this.props.lettersAvailability ===
      AVAILABILITY_STATUSES.letterEligibilityError
    ) {
      eligibilityMessage = (
        <va-alert status="warning" visible>
          <h4 slot="headline">Some letters may not be available</h4>
          <p>
            One of our systems appears to be down. If you believe you’re missing
            a letter or document from the list above, please try again later.
          </p>
        </va-alert>
      );
    }

    return (
      <div className="step-content" aria-live="polite">
        <p>
          To see an explanation about each letter, click on the (+) to expand
          the box. After you expand the box, you’ll be given the option to
          download the letter.
        </p>
        <p>
          To download a letter, you’ll need to have Adobe Acrobat Reader
          installed on your computer. You can then download or save the letter
          to your device. Open Acrobat Reader, and from the File menu, choose
          Open. Select the PDF.
        </p>
        <p>
          If you’re still having trouble opening the letter, you may have an
          older version of Adobe Acrobat Reader. You’ll need to{' '}
          <a
            href="https://get.adobe.com/reader/otherversions/"
            rel="noopener noreferrer"
            target="_blank"
          >
            download the latest version
          </a>
          . It’s free.
        </p>
        <p>
          <Link to="confirm-address">Go back to edit address</Link>
        </p>
        <va-accordion bordered>{letterItems}</va-accordion>
        {eligibilityMessage}

        <br />
        <p>
          A lot of people come to this page looking for their Post-9/11 GI Bill
          statement of benefits, their Certificate of Eligibility (COE) for home
          loan benefits, and their DD214. We don’t have these documents
          available here yet, but if you’re eligible for them, you can get them
          through these links:
        </p>
        <ul>
          <li>
            <a
              href="/education/gi-bill/post-9-11/ch-33-benefit"
              target="_blank"
            >
              <strong>
                View and print your Post-9/11 GI Bill statement of benefits.
              </strong>
            </a>
          </li>
          <li>
            <a
              href="https://eauth.va.gov/ebenefits/coe"
              rel="noopener noreferrer"
              target="_blank"
            >
              <strong>
                Sign in to eBenefits to request a Certificate of Eligibility
                (COE) for your home loan benefits.
              </strong>
            </a>
          </li>
          <li>
            <a
              href="https://eauth.va.gov/ebenefits/DPRIS"
              rel="noopener noreferrer"
              target="_blank"
            >
              <strong>
                Sign in to eBenefits to request a copy of your discharge or
                separation papers (DD 214).
              </strong>
            </a>
          </li>
        </ul>
        <div className="feature help-desk">
          <h2>Need help?</h2>
          <div>
            If you have any questions, please call the VA Benefits Help Desk:
            <br />
            <a href="tel:1-800-827-1000">800-827-1000</a>, Monday &#8211;
            Friday, 8 a.m. &#8211; 9 p.m. ET
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const letterState = state.letters;
  return {
    letters: letterState.letters,
    lettersAvailability: letterState.lettersAvailability,
    letterDownloadStatus: letterState.letterDownloadStatus,
    optionsAvailable: letterState.optionsAvailable,
  };
}

export default connect(mapStateToProps)(LetterList);
