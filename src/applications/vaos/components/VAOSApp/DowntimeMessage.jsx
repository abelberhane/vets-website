import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@department-of-veterans-affairs/component-library/Modal';
import externalServiceStatus from 'platform/monitoring/DowntimeNotification/config/externalServiceStatus';
import { dismissDowntimeWarning } from 'platform/monitoring/DowntimeNotification/actions';
import FullWidthLayout from '../FullWidthLayout';
import InfoAlert from '../InfoAlert';

const appTitle = 'VA online scheduling tool';

export default function DowntimeMessage({
  startTime,
  endTime,
  status,
  children,
}) {
  const dispatch = useDispatch();
  const isDowntimeWarningDismissed = useSelector(state =>
    state.scheduledDowntime.dismissedDowntimeWarnings.includes(appTitle),
  );
  if (status === externalServiceStatus.down) {
    return (
      <FullWidthLayout>
        <InfoAlert
          className="vads-u-margin-bottom--4"
          headline="The VA appointments tool is down for maintenance"
          status="warning"
        >
          <p>
            We’re making updates to the tool on {startTime.format('MMMM Do')}{' '}
            between {startTime.format('LT')} and {endTime.format('LT')}. We’re
            sorry it’s not working right now. If you need to request or confirm
            an appointment during this time, please call your local VA medical
            center. Use the <a href="/find-locations">VA facility locator</a> to
            find contact information for your medical center.
          </p>
        </InfoAlert>
      </FullWidthLayout>
    );
  }

  const close = () => dispatch(dismissDowntimeWarning(appTitle));
  return (
    <>
      {status === externalServiceStatus.downtimeApproaching && (
        <Modal
          id="downtime-approaching-modal"
          onClose={close}
          visible={!isDowntimeWarningDismissed}
        >
          <h3>VA online scheduling will be down for maintenance</h3>
          <p>
            We’re doing work on the VA appointments tool on{' '}
            {startTime.format('MMMM Do')} between {startTime.format('LT')} and{' '}
            {endTime.format('LT')}. If you need to request or confirm an
            appointment during this time, please call your local VA medical
            center. Use the <a href="/find-locations">VA facility locator</a> to
            find contact information for your medical center.
          </p>
          <button
            type="button"
            className="usa-button-secondary"
            onClick={close}
          >
            Dismiss
          </button>
        </Modal>
      )}
      {children}
    </>
  );
}
