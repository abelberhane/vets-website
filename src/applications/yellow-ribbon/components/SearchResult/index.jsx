// Node modules.
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
// Relative imports.
import { capitalize } from '../../helpers';

const deriveNameLabel = school => {
  // Show unknown if there's no name.
  if (!school?.schoolNameInYrDatabase) {
    return 'Unknown';
  }

  // Show the name.
  return capitalize(school?.schoolNameInYrDatabase);
};

const deriveLocationLabel = (school = {}) => {
  // Show unknown if there's no city or state.
  if (!school?.city && !school?.state) {
    return 'Unknown';
  }

  // Only show state if there's no city.
  if (!school?.city) {
    return school?.state;
  }

  // Only show city if there's no state.
  if (!school?.state) {
    return capitalize(school?.city);
  }

  // Show both city and state.
  return `${capitalize(school?.city)}, ${school?.state}`;
};

const deriveMaxAmountLabel = (school = {}) => {
  // Show unknown if there's no contributionAmount.
  if (!school?.contributionAmount) {
    return 'Unknown';
  }

  // Derive the contribution amount number.
  const contributionAmountNum = parseFloat(school?.contributionAmount);

  if (contributionAmountNum > 90000) {
    return 'All tuition and fees not covered by Post-9/11 GI Bill';
  }

  // Show formatted contributionAmount.
  return contributionAmountNum.toLocaleString('en-US', {
    currency: 'USD',
    style: 'currency',
  });
};

const deriveEligibleStudentsLabel = (school = {}) => {
  // Show unknown if there's no numberOfStudents.
  if (!school?.numberOfStudents) {
    return 'Unknown';
  }

  // Escape early if the data indicates all eligible students.
  if (school?.numberOfStudents >= 99999) {
    return 'All eligible students';
  }

  // Show numberOfStudents.
  return `${school?.numberOfStudents} students`;
};

const deriveInstURLLabel = (school = {}) => {
  // Show unknown if there's no insturl.
  if (!school?.insturl) {
    return 'Unknown';
  }

  // Show the school's website URL.
  return (
    <a href={school?.insturl} rel="noreferrer noopener">
      {school?.insturl}
    </a>
  );
};

export const SearchResult = ({ school, schoolIDs }) => (
  <div
    className={classNames(
      'medium-screen:vads-l-col',
      'vads-l-col',
      'vads-u-margin-bottom--2',
      'vads-u-padding-x--3',
      'vads-u-padding-y--2',
      'vads-u-background-color--gray-light-alt',
      'vads-u-border--3px',
      {
        'vads-u-border-color--primary': includes(schoolIDs, school?.id),
        'vads-u-border-color--transparent': !includes(schoolIDs, school?.id),
      },
    )}
  >
    {/* School Name */}
    <h3 className="vads-u-margin--0">{deriveNameLabel(school)}</h3>

    {/* School Location */}
    <p className="vads-u-margin-bottom--1 vads-u-margin-top--0">
      {deriveLocationLabel(school)}
    </p>

    <div className="vads-l-row vads-u-margin-top--2">
      <div className="vads-l-col--6 vads-u-display--flex vads-u-flex-direction--column vads-u-justify-content--space-between">
        {/* Max Contribution Amount */}
        <div className="vads-u-col">
          <h4 className="vads-u-font-family--sans vads-u-font-size--h5 vads-u-margin--0">
            Maximum Yellow Ribbon funding amount
            <br />
            (per student, per year)
          </h4>
          <p className="vads-u-margin--0">{deriveMaxAmountLabel(school)}</p>
        </div>

        {/* Student Count */}
        <h4 className="vads-u-font-family--sans vads-u-font-size--h5 vads-u-margin-top--2 vads-u-margin-bottom--0">
          Funding available for
        </h4>
        <p className="vads-u-margin-top--0 vads-u-margin-bottom--0">
          {deriveEligibleStudentsLabel(school)}
        </p>
      </div>

      <div className="vads-l-col--6 vads-u-padding-left--2">
        {/* School Website */}
        <h4 className="vads-u-font-family--sans vads-u-font-size--h5 vads-u-margin--0">
          School Website
        </h4>
        <p className="vads-u-margin--0">{deriveInstURLLabel(school)}</p>
      </div>
    </div>
  </div>
);

SearchResult.propTypes = {
  school: PropTypes.shape({
    city: PropTypes.string.isRequired,
    insturl: PropTypes.number,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    numberOfStudents: PropTypes.number.isRequired,
    contributionAmount: PropTypes.number.isRequired,
  }).isRequired,
  // From mapStateToProps.
  schoolIDs: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const mapStateToProps = state => ({
  schoolIDs: state.yellowRibbonReducer.schoolIDs,
});

export default connect(
  mapStateToProps,
  null,
)(SearchResult);
