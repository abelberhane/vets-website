import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Scroll from 'react-scroll';
import _ from 'lodash';

import LoadingIndicator from '@department-of-veterans-affairs/component-library/LoadingIndicator';
import { getScrollOptions, focusElement } from 'platform/utilities/ui';
import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { fetchProfile, showModal, hideModal } from '../actions';
import VetTecInstitutionProfile from '../components/vet-tec/InstitutionProfile';
import InstitutionProfile from '../components/profile/InstitutionProfile';
import ServiceError from '../components/ServiceError';
import { isSmallScreen, useQueryParams } from '../utils/helpers';
import scrollTo from 'platform/utilities/ui/scrollTo';

const { Element: ScrollElement } = Scroll;

export function ProfilePage({
  constants,
  profile,
  calculator,
  dispatchFetchProfile,
  dispatchShowModal,
  dispatchHideModal,
  eligibility,
  gibctEybBottomSheet,
  gibctSchoolRatings,
  match,
  compare,
}) {
  const { facilityCode } = match.params;
  const queryParams = useQueryParams();
  const version = queryParams.get('version');
  const institutionName = _.get(profile, 'attributes.name');
  const [smallScreen, setSmallScreen] = useState(isSmallScreen());

  useEffect(() => {
    const checkSize = () => {
      setSmallScreen(isSmallScreen());
    };
    window.addEventListener('resize', checkSize);

    return () => {
      window.removeEventListener('resize', checkSize);
      dispatchHideModal();
    };
  });

  useEffect(
    () => {
      document.title = `${
        institutionName ? `${institutionName} - ` : ''
      }GI Bill® Comparison Tool`;
    },
    [institutionName],
  );

  useEffect(
    () => {
      scrollTo('profilePage', getScrollOptions());
      focusElement('.profile-page h1');
    },
    [profile.inProgress],
  );

  useEffect(
    () => {
      dispatchFetchProfile(facilityCode, version);
    },
    [dispatchFetchProfile, facilityCode, version],
  );

  let content;

  const loadingProfile = profile.inProgress || _.isEmpty(profile.attributes);
  if (loadingProfile) {
    content = <LoadingIndicator message="Loading your profile..." />;
  } else {
    const isOJT = profile.attributes.type.toLowerCase() === 'ojt';

    if (profile.attributes.vetTecProvider) {
      content = (
        <VetTecInstitutionProfile
          institution={profile.attributes}
          showModal={dispatchShowModal}
          selectedProgram={calculator.selectedProgram}
          compare={compare}
          smallScreen={smallScreen}
        />
      );
    } else {
      content = (
        <InstitutionProfile
          institution={profile.attributes}
          isOJT={isOJT}
          constants={constants}
          showModal={dispatchShowModal}
          calculator={calculator}
          eligibility={eligibility}
          version={version}
          gibctEybBottomSheet={gibctEybBottomSheet}
          gibctSchoolRatings={gibctSchoolRatings}
          compare={compare}
          smallScreen={smallScreen}
        />
      );
    }
  }

  return (
    <ScrollElement
      name="profilePage"
      className="profile-page vads-u-padding-top--3"
    >
      <div className="row">
        {profile.error && <ServiceError />}
        {!profile.error && content}
      </div>
    </ScrollElement>
  );
}

const mapStateToProps = state => {
  const {
    constants: { constants },
    profile,
    calculator,
    eligibility,
    compare,
  } = state;
  return {
    compare,
    constants,
    profile,
    calculator,
    eligibility,
    gibctEybBottomSheet: toggleValues(state)[
      FEATURE_FLAG_NAMES.gibctEybBottomSheet
    ],
    gibctSchoolRatings: toggleValues(state)[
      FEATURE_FLAG_NAMES.gibctSchoolRatings
    ],
  };
};

const mapDispatchToProps = {
  dispatchFetchProfile: fetchProfile,
  dispatchShowModal: showModal,
  dispatchHideModal: hideModal,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfilePage);
