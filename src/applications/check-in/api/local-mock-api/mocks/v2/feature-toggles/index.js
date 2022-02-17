const generateFeatureToggles = (toggles = {}) => {
  const {
    checkInExperienceEnabled = true,
    preCheckInEnabled = true,
    checkInExperienceUpdateInformationPageEnabled = false,
    checkInExperienceEditingDayOfEnabled = false,
    checkInExperienceEditingPreCheckInEnabled = true,
  } = toggles;

  return {
    data: {
      type: 'feature_toggles',
      features: [
        {
          name: 'check_in_experience_enabled',
          value: checkInExperienceEnabled,
        },
        {
          name: 'check_in_experience_pre_check_in_enabled',
          value: preCheckInEnabled,
        },
        {
          name: 'check_in_experience_update_information_page_enabled',
          value: checkInExperienceUpdateInformationPageEnabled,
        },
        {
          name: 'check_in_experience_editing_day_of_enabled',
          value: checkInExperienceEditingDayOfEnabled,
        },
        {
          name: 'check_in_experience_editing_pre_check_in_enabled',
          value: checkInExperienceEditingPreCheckInEnabled,
        },
      ],
    },
  };
};

module.exports = { generateFeatureToggles };
