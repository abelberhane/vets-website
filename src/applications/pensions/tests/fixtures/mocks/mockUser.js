const CSP_IDS = require('platform/user/authentication/constants').CSP_IDS;
const VA_FORM_IDS = require('platform/forms/constants').VA_FORM_IDS;

/* eslint-disable camelcase */
const mockUser = {
  data: {
    attributes: {
      profile: {
        sign_in: {
          service_name: CSP_IDS.ID_ME,
        },
        email: 'fake@fake.com',
        loa: { current: 3 },
        first_name: 'Jane',
        middle_name: '',
        last_name: 'Doe',
        gender: 'F',
        birth_date: '1985-01-01',
        verified: true,
      },
      veteran_status: {
        status: 'OK',
        is_veteran: true,
      },
      in_progress_forms: [
        {
          form: VA_FORM_IDS.FORM_10_10EZ,
          metadata: {},
        },
        {
          form: VA_FORM_IDS.FORM_22_1995,
          metadata: {},
        },
        {
          form: VA_FORM_IDS.FORM_21P_530,
          metadata: {},
        },
        {
          form: VA_FORM_IDS.FORM_21P_527EZ,
          metadata: {},
        },
      ],
      prefills_available: [],
      services: [
        'facilities',
        'hca',
        'edu-benefits',
        'evss-claims',
        'user-profile',
        'rx',
        'messaging',
      ],
      va_profile: {
        status: 'OK',
        birth_date: '19511118',
        family_name: 'Hunter',
        gender: 'M',
        given_names: ['Julio', 'E'],
        active_status: 'active',
      },
    },
  },
  meta: { errors: null },
};
/* eslint-enable camelcase */

export default mockUser;
