import React from 'react';
import PropTypes from 'prop-types';
import CTALink from '../CTALink';
import recordEvent from '~/platform/monitoring/record-event';

export const Debts = ({ debts, hasError }) => {
  const debtsCount = debts?.length || 0;
  if (debtsCount < 1) {
    return (
      <p className="vads-u-margin-bottom--3 vads-u-margin-top--0">
        Your total VA debt balance is $0.
      </p>
    );
  }
  if (hasError) {
    return (
      <div className="vads-u-display--flex vads-u-flex-direction--column large-screen:vads-u-flex--1 vads-u-margin-bottom--2p5">
        <va-alert
          status="error"
          background-only
          show-icon
          className="vads-u-margin-top--0"
          closeable
        >
          We’re sorry. We can’t access some of your financial information right
          now. We’re working to fix this problem. Please check back later.
        </va-alert>
      </div>
    );
  }

  return (
    <div className="vads-u-display--flex vads-u-flex-direction--column large-screen:vads-u-flex--1 vads-u-margin-bottom--2p5">
      <va-alert
        status="warning"
        background-only
        show-icon
        className="vads-u-margin-top--0"
      >
        You have {debtsCount} outstanding debts.{' '}
        <CTALink
          text="Manage your VA debt"
          href="/manage-va-debt/your-debt"
          onClick={() =>
            recordEvent({
              event: 'profile-navigation',
              'profile-action': 'view-link',
              'profile-section': 'view-manage-va-debt',
            })
          }
        />
      </va-alert>
    </div>
  );
};

Debts.propTypes = {
  hasError: PropTypes.bool,
  debts: PropTypes.arrayOf(
    PropTypes.shape({
      fileNumber: PropTypes.string.isRequired,
      payeeNumber: PropTypes.string.isRequired,
      personEntitled: PropTypes.string.isRequired,
      deductionCode: PropTypes.string.isRequired,
      benefitType: PropTypes.string.isRequired,
      diaryCode: PropTypes.string.isRequired,
      diaryCodeDescription: PropTypes.string,
      amountOverpaid: PropTypes.number.isRequired,
      amountWithheld: PropTypes.number.isRequired,
      originalAr: PropTypes.number.isRequired,
      currentAr: PropTypes.number.isRequired,
      debtHistory: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string.isRequired,
          letterCode: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
};

export default Debts;
