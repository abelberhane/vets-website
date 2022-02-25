import { expect } from 'chai';

import {
  appointmentWasCheckedInto,
  APPOINTMENT_WAS_CHECKED_INTO,
  receivedMultipleAppointmentDetails,
  RECEIVED_APPOINTMENT_DETAILS,
  receivedDemographicsData,
  RECEIVED_DEMOGRAPHICS_DATA,
  recordAnswer,
  RECORD_ANSWER,
  triggerRefresh,
  TRIGGER_REFRESH,
  SEE_STAFF_MESSAGE_UPDATED,
  seeStaffMessageUpdated,
} from './index';

describe('check in actions', () => {
  describe('actions', () => {
    describe('recordAnswer', () => {
      it('should return correct action', () => {
        const action = recordAnswer({});
        expect(action.type).to.equal(RECORD_ANSWER);
      });
      it('should return correct structure', () => {
        const action = recordAnswer({
          demographicsUpToDate: 'yes',
        });
        expect(action.payload.demographicsUpToDate).equal('yes');
      });
    });
    describe('receivedMultipleAppointmentDetails', () => {
      it('should return correct action', () => {
        const action = receivedMultipleAppointmentDetails([]);
        expect(action.type).to.equal(RECEIVED_APPOINTMENT_DETAILS);
      });
      it('should return correct structure', () => {
        const action = receivedMultipleAppointmentDetails([{ id: 'some-id' }]);
        expect(action.payload.appointments[0]).to.haveOwnProperty('id');
        expect(action.payload.appointments[0].id).to.equal('some-id');
      });
    });

    describe('appointmentWasCheckedInto', () => {
      it('should return correct action', () => {
        const action = appointmentWasCheckedInto({
          appointmentIen: 'some-ien',
        });
        expect(action.type).to.equal(APPOINTMENT_WAS_CHECKED_INTO);
      });
      it('should return correct structure', () => {
        const action = appointmentWasCheckedInto({
          appointmentIen: 'some-ien',
        });
        expect(action.payload).to.haveOwnProperty('appointment');
        expect(action.payload.appointment.appointmentIen).to.equal('some-ien');
      });
    });
    describe('receivedDemographicsData', () => {
      it('should return correct action', () => {
        const action = receivedDemographicsData({});
        expect(action.type).to.equal(RECEIVED_DEMOGRAPHICS_DATA);
      });
      it('should return correct structure', () => {
        const action = receivedDemographicsData({
          homePhone: '555-867-5309',
        });
        expect(action.payload).to.haveOwnProperty('demographics');
        expect(action.payload.demographics.homePhone).to.equal('555-867-5309');
      });
    });
    describe('triggerRefresh', () => {
      it('should return correct action', () => {
        const action = triggerRefresh();
        expect(action.type).to.equal(TRIGGER_REFRESH);
      });
      it('should return correct structure', () => {
        const action = triggerRefresh();
        expect(action.payload.context.shouldRefresh).to.equal(true);
      });
    });
    describe('seeStaffMessageUpdated', () => {
      it('should return correct action', () => {
        const action = seeStaffMessageUpdated('test');
        expect(action.type).to.equal(SEE_STAFF_MESSAGE_UPDATED);
      });
      it('should return correct structure', () => {
        const action = seeStaffMessageUpdated('test');
        expect(action.payload.seeStaffMessage).to.equal('test');
      });
    });
  });
});
