import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import recordEvent from 'platform/monitoring/record-event';
import { URLS } from '../../utils/navigation/day-of';
import { useFormRouting } from '../../hooks/useFormRouting';
import BackButton from '../../components/BackButton';
import BackToHome from '../components/BackToHome';
import { focusElement } from 'platform/utilities/ui';
import Footer from '../components/Footer';
import { seeStaffMessageUpdated } from '../../actions/day-of';
import NextOfKinDisplay from '../../components/pages/nextOfKin/NextOfKinDisplay';

const NextOfKin = props => {
  const {
    nextOfKin,
    isLoading,
    router,
    demographicsStatus,
    isUpdatePageEnabled,
  } = props;
  const { nextOfKinNeedsUpdate } = demographicsStatus;
  const { jumpToPage, goToNextPage, goToPreviousPage } = useFormRouting(
    router,
    URLS,
  );

  const seeStaffMessage =
    'Our staff can help you update your next of kin information.';
  const dispatch = useDispatch();
  const updateSeeStaffMessage = useCallback(
    message => {
      dispatch(seeStaffMessageUpdated(message));
    },
    [dispatch],
  );
  useEffect(() => {
    focusElement('h1');
  }, []);

  const yesClick = useCallback(
    () => {
      recordEvent({
        event: 'cta-button-click',
        'button-click-label': 'yes-to-next-of-kin-information',
      });
      goToNextPage();
    },
    [goToNextPage],
  );

  const noClick = useCallback(
    () => {
      recordEvent({
        event: 'cta-button-click',
        'button-click-label': 'no-to-next-of-kin-information',
      });
      updateSeeStaffMessage(seeStaffMessage);
      jumpToPage(URLS.SEE_STAFF);
    },
    [updateSeeStaffMessage, jumpToPage],
  );
  useEffect(
    () => {
      if (nextOfKinNeedsUpdate === false) {
        goToNextPage();
      }
    },
    [nextOfKinNeedsUpdate, goToNextPage, isUpdatePageEnabled, jumpToPage],
  );
  if (isLoading) {
    return (
      <va-loading-indicator message="Loading your appointments for today" />
    );
  } else if (!nextOfKin) {
    goToNextPage(router, URLS.ERROR);
    return <></>;
  } else {
    return (
      <>
        <BackButton router={router} action={goToPreviousPage} />
        <NextOfKinDisplay
          nextOfKin={nextOfKin}
          yesAction={yesClick}
          noAction={noClick}
          Footer={Footer}
        />
        <BackToHome />
      </>
    );
  }
};

NextOfKin.propTypes = {
  nextOfKin: PropTypes.object,
  isLoading: PropTypes.bool,
  isUpdatePageEnabled: PropTypes.bool,
  router: PropTypes.object,
  demographicsStatus: PropTypes.object,
};

export default NextOfKin;
