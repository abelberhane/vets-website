import { createSelector } from 'reselect';

import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';

const selectFeatureToggles = createSelector(
  state => ({
    isLoadingFeatureFlags: state?.featureToggles?.loading,
    isCheckInEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperienceEnabled
    ],
    isPreCheckInEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperiencePreCheckInEnabled
    ],
    isUpdatePageEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperienceUpdateInformationPageEnabled
    ],
    isEditingDayOfEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperienceEditingDayOfEnabled
    ],
    isEditingPreCheckInEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperienceEditingPreCheckInEnabled
    ],
    isDayOfDemographicsFlagsEnabled: toggleValues(state)[
      FEATURE_FLAG_NAMES.checkInExperienceDayOfDemographicsFlagsEnabled
    ],
  }),
  toggles => toggles,
);

const makeSelectFeatureToggles = () => selectFeatureToggles;

export { makeSelectFeatureToggles };
