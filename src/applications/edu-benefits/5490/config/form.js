import { merge, omit, without } from 'lodash';
import get from 'platform/utilities/data/get';
import { createSelector } from 'reselect';

import fullSchema5490 from 'vets-json-schema/dist/22-5490-schema.json';
import PreSubmitInfo from '../containers/PreSubmitInfo';
import {
  benefitsRelinquishedInfo,
  benefitsRelinquishedWarning,
  benefitsDisclaimerChild,
  benefitsDisclaimerSpouse,
  relationshipLabels,
  highSchoolStatusLabels,
  transform,
} from '../helpers';

import { urlMigration } from '../../config/migrations';

import { stateLabels, survivorBenefitsLabels } from '../../utils/labels';

import {
  validateMonthYear,
  validateFutureDateIfExpectedGrad,
} from 'platform/forms-system/src/js/validation';

import * as address from 'platform/forms/definitions/address';
import currentOrPastDateUI from 'platform/forms-system/src/js/definitions/currentOrPastDate';
import dateUI from 'platform/forms-system/src/js/definitions/date';
import monthYearUI from 'platform/forms-system/src/js/definitions/monthYear';
import phoneUI from 'platform/forms-system/src/js/definitions/phone';
import * as personId from 'platform/forms/definitions/personId';
import dateRangeUi from 'platform/forms-system/src/js/definitions/dateRange';
import fullNameUi from 'platform/forms/definitions/fullName';

import FormFooter from 'platform/forms/components/FormFooter';
import environment from 'platform/utilities/environment';
import { VA_FORM_IDS } from 'platform/forms/constants';
import GetFormHelp from '../../components/GetFormHelp';
import ErrorText from '../../components/ErrorText';
import postHighSchoolTrainingsUi from '../../definitions/postHighSchoolTrainings';

import contactInformationPage from '../../pages/contactInformation';
import createDirectDepositPage from '../../pages/directDeposit';
import applicantInformationUpdate from '../components/applicantInformationUpdate';
import applicantServicePage from '../../pages/applicantService';
import createSchoolSelectionPage, {
  schoolSelectionOptionsFor,
} from '../../pages/schoolSelection';
import additionalBenefitsPage from '../../pages/additionalBenefits';
import employmentHistoryPage from '../../pages/employmentHistory';

import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import benefitSelectionWarning from '../components/BenefitSelectionWarning';
import createNonRequiredFullName from 'platform/forms/definitions/nonRequiredFullName';

import manifest from '../manifest.json';

const {
  benefit,
  benefitsRelinquishedDate,
  currentlyActiveDuty,
  currentSameAsPrevious,
  highSchool,
  outstandingFelony,
  previousBenefits,
  serviceBranch,
  sponsorStatus,
  spouseInfo,
  veteranDateOfBirth,
  veteranDateOfDeath,
} = fullSchema5490.properties;

const {
  secondaryContact,
  date,
  dateRange,
  educationType,
  fullName,
  postHighSchoolTrainings,
  vaFileNumber,
  phone,
  ssn,
} = fullSchema5490.definitions;

const nonRequiredFullName = createNonRequiredFullName(fullName);

const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/v0/education_benefits_claims/5490`,
  trackingPrefix: 'edu-5490-',
  formId: VA_FORM_IDS.FORM_22_5490,
  saveInProgress: {
    messages: {
      inProgress:
        'Your education benefits application (22-5490) is in progress.',
      expired:
        'Your saved education benefits application (22-5490) has expired. If you want to apply for education benefits, please start a new application.',
      saved: 'Your education benefits application has been saved.',
    },
  },
  version: 1,
  migrations: [urlMigration('/5490')],
  prefillEnabled: true,
  savedFormMessages: {
    notFound: 'Please start over to apply for education benefits.',
    noAuth:
      'Please sign in again to resume your application for education benefits.',
  },
  transformForSubmit: transform,
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  title: 'Apply for education benefits as an eligible dependent',
  subTitle: 'Form 22-5490',
  preSubmitInfo: {
    CustomComponent: PreSubmitInfo,
    required: true,
    field: 'privacyAgreementAccepted',
  },
  footerContent: FormFooter,
  getHelp: GetFormHelp,
  errorText: ErrorText,
  defaultDefinitions: {
    date,
    educationType,
    dateRange,
    fullName,
    ssn,
    vaFileNumber,
  },
  chapters: {
    applicantInformation: {
      title: 'Applicant information',
      pages: {
        applicantInformation: applicantInformationUpdate(fullSchema5490, {
          labels: { relationship: relationshipLabels },
        }),
        additionalBenefits: additionalBenefitsPage(fullSchema5490, {
          fields: ['civilianBenefitsAssistance', 'civilianBenefitsSource'],
        }),
        applicantService: applicantServicePage(fullSchema5490),
      },
    },
    benefitSelection: {
      title: 'Benefits eligibility',
      pages: {
        benefitSelection: {
          title: 'Benefits eligibility',
          path: 'benefits/eligibility',
          initialData: {},
          uiSchema: {
            'ui:title': 'Benefit selection',
            'view:benefitsDisclaimerChild': {
              'ui:description': benefitsDisclaimerChild,
              'ui:options': {
                hideIf: form => get('relationship', form) !== 'child',
              },
            },
            'view:benefitsDisclaimerSpouse': {
              'ui:description': benefitsDisclaimerSpouse,
              'ui:options': {
                hideIf: form => get('relationship', form) !== 'spouse',
              },
            },
            benefit: {
              'ui:widget': 'radio',
              'ui:title': 'Select the benefit that is the best match for you:',
              'ui:options': {
                labels: survivorBenefitsLabels,
                updateSchema: (form, schema, uiSchema) => {
                  const relationship = get('relationship', form);
                  const nestedContent = {
                    chapter33: benefitSelectionWarning(
                      'chapter33',
                      relationship,
                    ),
                    chapter35: benefitSelectionWarning(
                      'chapter35',
                      relationship,
                    ),
                  };
                  const uiOptions = get('ui:options', uiSchema);
                  uiOptions.nestedContent = nestedContent;
                  return schema;
                },
              },
            },
          },
          schema: {
            type: 'object',
            required: ['benefit'],
            properties: {
              'view:benefitsDisclaimerChild': {
                type: 'object',
                properties: {},
              },
              'view:benefitsDisclaimerSpouse': {
                type: 'object',
                properties: {},
              },
              benefit,
            },
          },
        },
        benefitRelinquishment: {
          title: 'Benefits relinquishment',
          path: 'benefits/relinquishment',
          initialData: {},
          depends: {
            relationship: 'child',
          },
          uiSchema: {
            'ui:title': 'Benefits relinquishment',
            'view:benefitsRelinquishedInfo': {
              'ui:description': benefitsRelinquishedInfo,
            },
            benefitsRelinquishedDate: currentOrPastDateUI('Effective date'),
            'view:benefitsRelinquishedWarning': {
              'ui:description': benefitsRelinquishedWarning,
            },
          },
          schema: {
            type: 'object',
            required: ['benefitsRelinquishedDate'],
            properties: {
              'view:benefitsRelinquishedInfo': {
                type: 'object',
                properties: {},
              },
              benefitsRelinquishedDate,
              'view:benefitsRelinquishedWarning': {
                type: 'object',
                properties: {},
              },
            },
          },
        },
        benefitHistory: {
          title: 'Benefits history',
          path: 'benefits/history',
          initialData: {},
          uiSchema: {
            'ui:title': 'Benefits history',
            'ui:description':
              'Before this application, have you ever applied for or received any of the following VA benefits?',
            previousBenefits: {
              'ui:order': [
                'disability',
                'dic',
                'chapter31',
                'view:ownServiceBenefits',
                'ownServiceBenefits',
                'view:claimedSponsorService',
                'chapter35',
                'chapter33',
                'transferOfEntitlement',
                'veteranFullName',
                'view:veteranId',
                'view:otherBenefitReceived',
                'other',
              ],
              'view:noPreviousBenefits': {
                'ui:title': 'None',
              },
              'view:otherBenefitReceived': {
                'ui:title': 'Other benefit',
              },
              disability: {
                'ui:title': 'Disability Compensation or Pension',
              },
              dic: {
                'ui:title': 'Dependents’ Indemnity Compensation (DIC)',
              },
              chapter31: {
                'ui:title':
                  'Veteran Readiness and Employment benefits (Chapter 31)',
              },
              'view:ownServiceBenefits': {
                'ui:title':
                  'Veterans education assistance based on your own service',
                'ui:options': {
                  expandUnderClassNames: 'schemaform-expandUnder-indent',
                },
              },
              ownServiceBenefits: {
                'ui:title': 'Describe the benefits you used',
                'ui:options': {
                  expandUnder: 'view:ownServiceBenefits',
                },
              },
              'view:claimedSponsorService': {
                'ui:title':
                  'Veterans education assistance based on someone else’s service',
                'ui:options': {
                  expandUnderClassNames: 'schemaform-expandUnder-indent',
                },
              },
              chapter35: {
                'ui:title':
                  'Survivors’ and Dependents’ Educational Assistance Program (DEA, Chapter 35)',
                'ui:options': {
                  expandUnder: 'view:claimedSponsorService',
                },
              },
              chapter33: {
                'ui:title':
                  'Post-9/11 GI Bill Marine Gunnery Sergeant David Fry Scholarship (Chapter 33)',
                'ui:options': {
                  expandUnder: 'view:claimedSponsorService',
                },
              },
              transferOfEntitlement: {
                'ui:title': 'Transferred Entitlement',
                'ui:options': {
                  expandUnder: 'view:claimedSponsorService',
                },
              },
              veteranFullName: merge({}, fullNameUi, {
                'ui:title': 'Sponsor Veteran’s name',
                'ui:options': {
                  expandUnder: 'view:claimedSponsorService',
                  updateSchema: form => {
                    if (
                      get('previousBenefits.view:claimedSponsorService', form)
                    ) {
                      return fullName;
                    }
                    return nonRequiredFullName;
                  },
                },
                // Re-label the inputs to add 'sponsor'
                first: { 'ui:title': "Sponsor's first name" },
                last: { 'ui:title': "Sponsor's last name" },
                middle: { 'ui:title': "Sponsor's middle name" },
                suffix: { 'ui:title': "Sponsor's suffix" },
              }),
              'view:veteranId': merge({}, personId.uiSchema(), {
                veteranSocialSecurityNumber: {
                  'ui:title': "Sponsor's Social Security number",
                  'ui:required': formData =>
                    get(
                      'previousBenefits.view:claimedSponsorService',
                      formData,
                    ) &&
                    !get(
                      'previousBenefits.view:veteranId.view:noSSN',
                      formData,
                    ),
                },
                'view:noSSN': {
                  'ui:title':
                    'I don’t know my sponsor’s Social Security number',
                },
                vaFileNumber: {
                  'ui:title': "Sponsor's VA number",
                  'ui:required': formData =>
                    get(
                      'previousBenefits.view:claimedSponsorService',
                      formData,
                    ) &&
                    !!get(
                      'previousBenefits.view:veteranId.view:noSSN',
                      formData,
                    ),
                },
                'ui:options': {
                  expandUnder: 'view:claimedSponsorService',
                },
              }),
              other: {
                'ui:title': 'What benefit?',
                'ui:options': {
                  expandUnder: 'view:otherBenefitReceived',
                },
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              previousBenefits: merge(
                {},
                omit(previousBenefits, [
                  'anyOf',
                  'properties.veteranFullName',
                  'properties.veteranSocialSecurityNumber',
                  'properties.vaFileNumber',
                ]),
                {
                  properties: {
                    'view:ownServiceBenefits': { type: 'boolean' },
                    'view:claimedSponsorService': { type: 'boolean' },
                    veteranFullName: fullName,
                    'view:veteranId': personId.schema(fullSchema5490),
                    'view:otherBenefitReceived': { type: 'boolean' },
                  },
                },
              ),
            },
          },
        },
      },
    },
    sponsorInformation: {
      title: 'Sponsor information',
      pages: {
        sponsorInformation: {
          title: 'Sponsor information',
          path: 'sponsor/information',
          uiSchema: {
            spouseInfo: {
              divorcePending: {
                'ui:title':
                  'Is there a divorce or annulment pending with your sponsor?',
                'ui:widget': 'yesNo',
                'ui:required': formData =>
                  get('relationship', formData) === 'spouse',
              },
              remarried: {
                'ui:title':
                  'If you’re the surviving spouse, did you get remarried?',
                'ui:widget': 'yesNo',
              },
              remarriageDate: {
                ...dateUI('Date you got remarried'),
                'ui:options': {
                  expandUnder: 'remarried',
                },
                'ui:required': formData =>
                  get('spouseInfo.remarried', formData),
              },
              'ui:options': {
                hideIf: formData => get('relationship', formData) !== 'spouse',
              },
            },
            currentSameAsPrevious: {
              'ui:options': {
                hideIf: formData =>
                  !get('previousBenefits.view:claimedSponsorService', formData),
              },
              'ui:title': 'Same sponsor as previously claimed benefits',
            },
            'view:currentSponsorInformation': {
              'ui:options': {
                hideIf: formData => formData.currentSameAsPrevious,
              },
              veteranFullName: merge({}, fullNameUi, {
                'ui:options': {
                  updateSchema: form => {
                    if (!get('currentSameAsPrevious', form)) {
                      return fullName;
                    }
                    return nonRequiredFullName;
                  },
                },
                'ui:title': 'Name of Sponsor',
                first: {
                  'ui:title': "Sponsor's first name",
                },
                middle: {
                  'ui:title': "Sponsor's middle name",
                },
                last: {
                  'ui:title': "Sponsor's last name",
                },
                suffix: {
                  'ui:title': "Sponsor's suffix",
                },
              }),
              'view:veteranId': merge({}, personId.uiSchema(), {
                veteranSocialSecurityNumber: {
                  'ui:title': "Sponsor's Social Security number",
                  'ui:required': formData =>
                    !get('currentSameAsPrevious', formData) &&
                    !get(
                      'view:currentSponsorInformation.view:veteranId.view:noSSN',
                      formData,
                    ),
                },
                'view:noSSN': {
                  'ui:title':
                    'I don’t know my sponsor’s Social Security number',
                },
                vaFileNumber: {
                  'ui:required': formData =>
                    !!get(
                      'view:currentSponsorInformation.view:veteranId.view:noSSN',
                      formData,
                    ),
                  'ui:title': "Sponsor's VA number",
                },
              }),
            },
            veteranDateOfBirth: currentOrPastDateUI('Sponsor’s date of birth'),
            veteranDateOfDeath: {
              ...currentOrPastDateUI(
                "Sponsor's date of death or date listed as MIA or POW",
              ),
              'ui:options': {
                hideIf: formData =>
                  get('benefit', formData) === 'chapter33' &&
                  get('relationship', formData) === 'spouse',
              },
            },
            sponsorStatus: {
              'ui:title': 'Do any of these situations apply to your sponsor?',
              'ui:widget': 'radio',
              'ui:options': {
                labels: {
                  diedOnDuty:
                    'Died while serving on active duty or duty other than active duty',
                  diedFromDisabilityOrOnReserve:
                    'Died from a service-connected disability while a member of the Selected Reserve',
                  powOrMia: 'Listed as MIA or POW',
                },
                hideIf: formData =>
                  get('benefit', formData) === 'chapter35' ||
                  get('relationship', formData) === 'child',
              },
            },
            'view:sponsorDateOfDeath': {
              ...currentOrPastDateUI('Sponsor’s date of death'),
              'ui:options': {
                expandUnder: 'sponsorStatus',
                expandUnderCondition: status => status && status !== 'powOrMia',
                hideIf: formData =>
                  get('benefit', formData) === 'chapter35' ||
                  get('relationship', formData) === 'child',
              },
            },
            'view:sponsorDateListedMiaOrPow': {
              ...currentOrPastDateUI('Sponsor’s date listed as MIA or POW'),
              'ui:options': {
                expandUnder: 'sponsorStatus',
                expandUnderCondition: status => status && status === 'powOrMia',
                hideIf: formData =>
                  get('benefit', formData) === 'chapter35' ||
                  get('relationship', formData) === 'child',
              },
            },
          },
          schema: {
            type: 'object',
            required: ['veteranDateOfBirth'],
            properties: {
              spouseInfo,
              currentSameAsPrevious,
              'view:currentSponsorInformation': {
                type: 'object',
                properties: {
                  veteranFullName: fullName,
                  'view:veteranId': personId.schema(fullSchema5490),
                },
              },
              veteranDateOfBirth,
              veteranDateOfDeath,
              sponsorStatus,
              'view:sponsorDateOfDeath': {
                $ref: '#/definitions/date',
              },
              'view:sponsorDateListedMiaOrPow': {
                $ref: '#/definitions/date',
              },
            },
          },
        },
        sponsorService: {
          title: 'Sponsor service',
          path: 'sponsor/service',
          uiSchema: {
            'ui:title': 'Sponsor service',
            serviceBranch: {
              'ui:title': "Sponsor's branch of service",
            },
            currentlyActiveDuty: {
              'ui:title': 'Is your sponsor on active duty?',
              'ui:widget': 'yesNo',
            },
            outstandingFelony: {
              'ui:title':
                'Do you or your sponsor have an outstanding felony and/or warrant?',
              'ui:widget': 'yesNo',
            },
          },
          schema: {
            type: 'object',
            properties: {
              serviceBranch,
              currentlyActiveDuty,
              outstandingFelony,
            },
          },
        },
      },
    },
    educationHistory: {
      title: 'Education history',
      pages: {
        educationHistory: {
          title: 'Education history',
          path: 'education/history',
          initialData: {},
          uiSchema: {
            highSchool: {
              status: {
                'ui:title': 'What’s your current high school status?',
                'ui:options': {
                  labels: highSchoolStatusLabels,
                  expandUnderClassNames: 'schemaform-expandUnder-indent',
                },
              },
              highSchoolOrGedCompletionDate: {
                ...monthYearUI(null),
                'ui:options': {
                  monthYear: true,
                  expandUnderCondition: status =>
                    status === 'graduated' || status === 'graduationExpected',
                  expandUnder: 'status',
                  updateSchema: form => {
                    const status = get('highSchool.status', form);

                    if (status === 'graduationExpected') {
                      return {
                        title:
                          'When do you expect to earn your high school diploma?',
                      };
                    }

                    return {
                      title: 'When did you earn your high school diploma?',
                    };
                  },
                },
                'ui:validations': [
                  validateMonthYear,
                  validateFutureDateIfExpectedGrad,
                ],
              },
              'view:hasHighSchool': {
                'ui:options': {
                  expandUnderCondition: status => status === 'discontinued',
                  expandUnder: 'status',
                },
                name: {
                  'ui:title': 'Name of high school',
                },
                city: {
                  'ui:title': 'City',
                },
                state: {
                  'ui:title': 'State',
                  'ui:options': {
                    labels: stateLabels,
                  },
                },
                dateRange: dateRangeUi(),
              },
            },
            'view:hasTrainings': {
              'ui:title': 'Do you have any training after high school?',
              'ui:widget': 'yesNo',
              'ui:options': {
                hideIf: form => {
                  const status = get('highSchool.status', form);
                  return (
                    status === 'discontinued' ||
                    status === 'graduationExpected' ||
                    status === 'neverAttended'
                  );
                },
              },
            },
            postHighSchoolTrainings: merge({}, postHighSchoolTrainingsUi, {
              'ui:options': {
                expandUnder: 'view:hasTrainings',
              },
            }),
          },
          schema: {
            type: 'object',
            properties: {
              highSchool: {
                type: 'object',
                properties: {
                  status: highSchool.properties.status,
                  highSchoolOrGedCompletionDate: date,
                  'view:hasHighSchool': {
                    type: 'object',
                    properties: {
                      name: highSchool.properties.name,
                      city: highSchool.properties.city,
                      state: highSchool.properties.state,
                      dateRange: highSchool.properties.dateRange,
                    },
                  },
                },
              },
              'view:hasTrainings': {
                type: 'boolean',
              },
              postHighSchoolTrainings,
            },
          },
        },
      },
    },
    employmentHistory: {
      title: 'Employment history',
      pages: {
        employmentHistory: employmentHistoryPage(fullSchema5490, false),
      },
    },
    schoolSelection: {
      title: 'School selection',
      pages: {
        schoolSelection: merge(
          {},
          createSchoolSelectionPage(
            fullSchema5490,
            schoolSelectionOptionsFor['5490'],
          ),
          {
            // Rephrase the question for facility name in educationProgram
            uiSchema: {
              educationProgram: {
                name: {
                  'ui:title':
                    'Name of school, university, or training facility you want to attend',
                },
                educationType: {
                  'ui:options': {
                    updateSchema: (() => {
                      const edTypes = educationType.enum;
                      // Using reselect here avoids running the filter code
                      // and creating a new object unless either benefit or
                      // relationship has changed
                      const filterEducationType = createSelector(
                        form => get('benefit', form),
                        form => get('relationship', form),
                        (benefitData, relationshipData) => {
                          // Remove tuition top-up
                          const filterOut = ['tuitionTopUp'];
                          // Correspondence not available to Chapter 35 (DEA) children
                          if (
                            benefitData === 'chapter35' &&
                            relationshipData === 'child'
                          ) {
                            filterOut.push('correspondence');
                          }
                          // Flight training available to Chapter 33 (Fry Scholarships) only
                          if (benefitData && benefitData !== 'chapter33') {
                            filterOut.push('flightTraining');
                          }

                          return { enum: without(edTypes, filterOut) };
                        },
                      );

                      return form => filterEducationType(form);
                    })(),
                  },
                },
              },
            },
          },
        ),
      },
    },
    personalInformation: {
      title: 'Personal information',
      pages: {
        contactInformation: contactInformationPage(
          fullSchema5490,
          'relativeAddress',
        ),
        secondaryContact: {
          title: 'Secondary contact',
          path: 'personal-information/secondary-contact',
          initialData: {},
          uiSchema: {
            'ui:title': 'Secondary contact',
            'ui:description':
              'This person should know where you can be reached at all times.',
            secondaryContact: {
              fullName: {
                'ui:title': 'Name',
              },
              phone: phoneUI('Telephone number'),
              sameAddress: {
                'ui:title': 'Address for secondary contact is the same as mine',
              },
              address: merge({}, address.uiSchema(), {
                'ui:options': {
                  hideIf: formData =>
                    get('secondaryContact.sameAddress', formData) === true,
                },
              }),
            },
          },
          schema: {
            type: 'object',
            properties: {
              secondaryContact: {
                type: 'object',
                properties: {
                  fullName: secondaryContact.properties.fullName,
                  phone,
                  sameAddress: secondaryContact.properties.sameAddress,
                  address: address.schema(fullSchema5490),
                },
              },
            },
          },
        },
        directDeposit: createDirectDepositPage(fullSchema5490),
      },
    },
  },
};

export default formConfig;
