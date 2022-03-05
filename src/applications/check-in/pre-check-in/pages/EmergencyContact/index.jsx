import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import recordEvent from 'platform/monitoring/record-event';

import { recordAnswer } from '../../../actions/pre-check-in';

import BackButton from '../../../components/BackButton';
import BackToHome from '../../../components/BackToHome';
import Footer from '../../../components/Footer';
import EmergencyContactDisplay from '../../../components/pages/emergencyContact/EmergencyContactDisplay';

import { useFormRouting } from '../../../hooks/useFormRouting';
import {
  makeSelectVeteranData,
  makeSelectPendingEdits,
} from '../../../selectors';
import { makeSelectFeatureToggles } from '../../../utils/selectors/feature-toggles';

const EmergencyContact = props => {
  const { router } = props;

  const [isSendingData, setIsSendingData] = useState(false);

  const selectVeteranData = useMemo(makeSelectVeteranData, []);
  const { demographics } = useSelector(selectVeteranData);
  const { emergencyContact } = demographics;

  const selectPendingEdits = useMemo(makeSelectPendingEdits, []);
  const { pendingEdits } = useSelector(selectPendingEdits);
  const { emergencyContact: newInformation } = pendingEdits || {};

  const selectFeatureToggles = useMemo(makeSelectFeatureToggles, []);
  const { isEditingPreCheckInEnabled } = useSelector(selectFeatureToggles);

  const dispatch = useDispatch();

  const { goToNextPage, goToPreviousPage, jumpToPage } = useFormRouting(router);

  const buttonClick = useCallback(
    async answer => {
      setIsSendingData(true);
      recordEvent({
        event: 'cta-button-click',
        'button-click-label': `${answer}-to-emergency-contact`,
      });
      dispatch(recordAnswer({ emergencyContactUpToDate: `${answer}` }));

      // select the answers from state
      // send to API

      goToNextPage();
    },
    [dispatch, goToNextPage],
  );

  const yesClick = useCallback(
    () => {
      buttonClick('yes');
    },
    [buttonClick],
  );
  const noClick = useCallback(
    () => {
      buttonClick('no');
    },
    [buttonClick],
  );

  return (
    <>
      <BackButton action={goToPreviousPage} router={router} />
      <EmergencyContactDisplay
        emergencyContact={newInformation || emergencyContact}
        yesAction={yesClick}
        noAction={noClick}
        isLoading={isSendingData}
        Footer={Footer}
        isEditEnabled={isEditingPreCheckInEnabled}
        jumpToPage={jumpToPage}
      />
      <BackToHome />
    </>
  );
};

EmergencyContact.propTypes = {
  router: PropTypes.object,
};

export default EmergencyContact;
