// Dependencies
import { connect } from 'react-redux';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import recordEvent from 'platform/monitoring/record-event';
import localStorage from 'platform/utilities/storage/localStorage';

// Relative imports
import AdditionalInstructions from '../components/gpMinorComponents/AdditionalInstructions';
import CarefulConsiderationStatement from '../components/CarefulConsiderationStatement';
import OptionalStep from '../components/gpMinorComponents/OptionalStep';
import ResultsSummary from '../components/gpMinorComponents/ResultsSummary';
import StepOne from '../components/gpSteps/StepOne';
import StepTwo from '../components/gpSteps/StepTwo';
import StepThree from '../components/gpSteps/StepThree';
import Warnings from '../components/gpMinorComponents/Warnings';

export const GuidancePage = ({ formValues }) => {
  const [accordionQuestionsState, setAccordionQuestionsState] = useState({
    q1: false,
    q2: false,
  });

  useEffect(
    () => {
      // This effect hook only runs on mount OR if formValues dependency changes (Which is a new render/ or props to the component)
      localStorage.setItem('dw-viewed-guidance', true);
      localStorage.setItem('dw-formValues', JSON.stringify(formValues));
      window.scrollTo(0, 0);
    },
    [formValues],
  );

  const handleFAQToggle = e => {
    e.preventDefault();
    recordEvent({ event: 'discharge-upgrade-faq-toggle' });
    setAccordionQuestionsState({
      ...accordionQuestionsState,
      [e.target.name]: !accordionQuestionsState[e.target.name],
    });
  };

  const handlePrint = e => {
    e.preventDefault();
    recordEvent({ event: 'discharge-upgrade-print' });
    if (window.print) {
      window.print();
    }
  };

  return (
    <article className="dw-guidance">
      <h1>Your Steps for Upgrading Your Discharge</h1>
      <div className="medium-8">
        <ResultsSummary formValues={formValues} />
        <CarefulConsiderationStatement formValues={formValues} />
        <Warnings formValues={formValues} />
        <OptionalStep formValues={formValues} />
        <ul className="steps-list vertical-list-group more-bottom-cushion numbered">
          <StepOne formValues={formValues} />
          <StepTwo formValues={formValues} />
          <StepThree formValues={formValues} handlePrint={handlePrint} />
        </ul>
        <AdditionalInstructions
          formValues={formValues}
          handleFAQToggle={handleFAQToggle}
          parentState={accordionQuestionsState}
        />
      </div>
    </article>
  );
};

const mapStateToProps = state => ({
  formValues: state.dischargeWizard.form,
});
const mapDispatchToProps = {};

GuidancePage.propTypes = {
  formValues: PropTypes.object.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GuidancePage);
