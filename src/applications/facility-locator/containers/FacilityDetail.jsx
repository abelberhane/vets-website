import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AlertBox from '@department-of-veterans-affairs/component-library/AlertBox';
import { fetchVAFacility } from '../actions';
import AccessToCare from '../components/AccessToCare';
import LocationAddress from '../components/search-results-items/common/LocationAddress';
import LocationDirectionsLink from '../components/search-results-items/common/LocationDirectionsLink';
import LocationHours from '../components/LocationHours';
import LocationMap from '../components/LocationMap';
import LocationPhoneLink from '../components/search-results-items/common/LocationPhoneLink';
import LoadingIndicator from '@department-of-veterans-affairs/component-library/LoadingIndicator';
import ServicesAtFacility from '../components/ServicesAtFacility';
import AppointmentInfo from '../components/AppointmentInfo';
import { OperatingStatus, FacilityType } from '../constants';
import VABenefitsCall from '../components/VABenefitsCall';
import { facilityLocatorShowOperationalHoursSpecialInstructions } from '../utils/featureFlagSelectors';
import scrollTo from 'platform/utilities/ui/scrollTo';

class FacilityDetail extends Component {
  headerRef = React.createRef();
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.props.fetchVAFacility(this.props.params.id, null);
    scrollTo(0);
  }

  componentDidUpdate(prevProps) {
    const justLoaded =
      prevProps.currentQuery.inProgress && !this.props.currentQuery.inProgress;

    if (justLoaded) {
      this.__previousDocTitle = document.title;
      document.title = `${
        this.props.facility.attributes.name
      } | Veterans Affairs`;

      // Need to wait until the data is loaded to focus
      this.headerRef.current.focus();
    }
  }

  componentWillUnmount() {
    document.title = this.__previousDocTitle;
  }

  visitText(facilityType, website) {
    if (facilityType === FacilityType.VA_CEMETARY) {
      return (
        <p>
          For more information about the cemetery including interment, visit our{' '}
          <a href={website}>cemetery website</a>.
        </p>
      );
    }
    return (
      <p>
        Visit the <a href={website}>website</a> to learn more about hours and
        services.
      </p>
    );
  }

  showOperationStatus(operatingStatus, website, facilityType) {
    if (!operatingStatus || operatingStatus.code === 'NORMAL') {
      return null;
    }
    let operationStatusTitle;
    let alertClass;
    if (operatingStatus.code === OperatingStatus.NOTICE) {
      operationStatusTitle = 'Facility notice';
      alertClass = 'info';
    }
    if (operatingStatus.code === OperatingStatus.LIMITED) {
      operationStatusTitle = 'Limited services and hours';
      alertClass = 'info';
    }
    if (operatingStatus.code === OperatingStatus.CLOSED) {
      operationStatusTitle = 'Facility Closed';
      alertClass = 'error';
    }
    return (
      <AlertBox
        level={2}
        headline={`${operationStatusTitle}`}
        content={
          <div>
            {operatingStatus.additionalInfo && (
              <p>{operatingStatus.additionalInfo} </p>
            )}
            {website &&
              website !== 'NULL' &&
              this.visitText(facilityType, website)}
          </div>
        }
        status={`${alertClass}`}
      />
    );
  }

  renderFacilityInfo() {
    const { facility } = this.props;
    const {
      name,
      website,
      phone,
      operatingStatus,
      facilityType,
    } = facility.attributes;

    const isVBA = facilityType === FacilityType.VA_BENEFITS_FACILITY;
    return (
      <div>
        <h1 ref={this.headerRef} tabIndex={-1}>
          {name}
        </h1>
        {this.showOperationStatus(operatingStatus, website, facilityType)}
        <div className="p1">
          <LocationAddress location={facility} />
        </div>
        <div>
          <LocationPhoneLink location={facility} from={'FacilityDetail'} />
        </div>
        {website &&
          website !== 'NULL' && (
            <span>
              <a href={website} target="_blank" rel="noopener noreferrer">
                <i className="fa fa-globe" />
                Website
              </a>
            </span>
          )}
        <div>
          <LocationDirectionsLink location={facility} from={'FacilityDetail'} />
        </div>
        {phone &&
          phone.main &&
          !isVBA && (
            <p className="p1">
              Planning to visit? Please call first as information on this page
              may change.
            </p>
          )}
        {isVBA && <VABenefitsCall />}
      </div>
    );
  }

  render() {
    const { facility, currentQuery, showHoursSpecialInstructions } = this.props;

    if (!facility) {
      return null;
      // Shouldn't we render some sort of error message instead?
      // Right now all the user sees is a blank page. How is a dev
      // to quickly understand what the failure was?
    }

    if (currentQuery.inProgress) {
      return (
        <div>
          <LoadingIndicator message="Loading information..." />
        </div>
      );
    }

    return (
      <div className="row facility-detail all-details" id="facility-detail-id">
        <div className="usa-width-two-thirds medium-8 columns">
          <div>
            {this.renderFacilityInfo()}
            <ServicesAtFacility facility={facility} />
          </div>
          <div>
            <AppointmentInfo location={facility} />
            <AccessToCare location={facility} />
          </div>
        </div>
        <div className="usa-width-one-third medium-4 columns">
          <div>
            <LocationMap info={facility} />
            <div className="vads-u-margin-bottom--4">
              <LocationHours
                location={facility}
                showHoursSpecialInstructions={showHoursSpecialInstructions}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchVAFacility }, dispatch);
}

function mapStateToProps(state) {
  return {
    facility: state.searchResult.selectedResult,
    currentQuery: state.searchQuery,
    showHoursSpecialInstructions: facilityLocatorShowOperationalHoursSpecialInstructions(
      state,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FacilityDetail);
