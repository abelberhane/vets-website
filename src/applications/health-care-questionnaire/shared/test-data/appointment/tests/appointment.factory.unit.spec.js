import { expect } from 'chai';
import isFuture from 'date-fns/isFuture';
import isPast from 'date-fns/isPast';
import isToday from 'date-fns/isToday';

import { AppointmentData } from '../factory';

describe('health care questionnaire -- utils -- test data -- data factory -- appointment --', () => {
  it('appointment is created with status', () => {
    const appointment = new AppointmentData().withStatus('testing');

    expect(appointment).to.have.property('status');
    expect(appointment.status).to.equal('testing');
  });
  it('appointment is created with id', () => {
    const appointment = new AppointmentData().withId('testing');

    expect(appointment).to.have.property('id');
    expect(appointment.id).to.equal('testing');
  });
  it('appointment is created in the future', () => {
    const appointment = new AppointmentData().inFuture();

    expect(appointment).to.have.property('start');
    expect(isFuture(appointment.start)).to.be.true;
  });
  it('appointment is created in the Past', () => {
    const appointment = new AppointmentData().inPast();

    expect(appointment).to.have.property('start');
    expect(isPast(appointment.start)).to.be.true;
  });
  it('appointment is created for today', () => {
    const appointment = new AppointmentData().isToday();

    expect(appointment).to.have.property('start');
    expect(isToday(appointment.start)).to.be.true;
  });
  it('appointment is convert to a string', () => {
    const appointment = new AppointmentData().toString();

    expect(appointment).to.be.a('string');
  });
});
