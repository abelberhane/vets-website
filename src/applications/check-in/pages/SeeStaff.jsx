import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BackToHome from '../components/BackToHome';
import Footer from '../components/Footer';
import { focusElement } from 'platform/utilities/ui';
import BackButton from '../components/BackButton';

const SeeStaff = props => {
  const { router, message } = props;
  useEffect(() => {
    focusElement('h1');
  }, []);
  return (
    <div className="vads-l-grid-container vads-u-padding-top--3 vads-u-padding-bottom--3">
      <BackButton router={router} />
      <h1 tabIndex="-1" className="vads-u-margin-top--2">
        Check in with a staff member
      </h1>
      {message ? (
        <>{message}</>
      ) : (
        <p>Our staff can help you update your contact information.</p>
      )}
      <Footer />
      <BackToHome />
    </div>
  );
};

SeeStaff.propTypes = {
  router: PropTypes.object,
  message: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

const mapStateToProps = state => {
  return {
    message: state.checkInData.seeStaffMessage,
  };
};

export default connect(mapStateToProps)(SeeStaff);