// Example of an imported schema:
import fullSchema from '../00-1234-schema.json';
// In a real app this would be imported from `vets-json-schema`:
// import fullSchema from 'vets-json-schema/dist/00-1234-schema.json';

// In a real app this would not be imported directly; instead the schema you
// imported above would import and use these common definitions:
import commonDefinitions from 'vets-json-schema/dist/definitions.json';

import fullNameUI from 'platform/forms-system/src/js/definitions/fullName';
import ssnUI from 'platform/forms-system/src/js/definitions/ssn';
import bankAccountUI from 'platform/forms-system/src/js/definitions/bankAccount';
import phoneUI from 'platform/forms-system/src/js/definitions/phone';
import * as address from 'platform/forms-system/src/js/definitions/address';

// import fullSchema from 'vets-json-schema/dist/00-1234-schema.json';

import manifest from '../manifest.json';

import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';

// const { } = fullSchema.properties;

// const { } = fullSchema.definitions;

import { directDepositWarning } from '../helpers';
import toursOfDutyUI from '../definitions/toursOfDuty';

const {
  fullName,
  ssn,
  date,
  dateRange,
  usaPhone,
  bankAccount,
  toursOfDuty,
} = commonDefinitions;

// Define all the fields in the form to aid reuse
const formFields = {
  fullName: 'fullName',
  ssn: 'ssn',
  toursOfDuty: 'toursOfDuty',
  viewNoDirectDeposit: 'view:noDirectDeposit',
  viewStopWarning: 'view:stopWarning',
  bankAccount: 'bankAccount',
  accountType: 'accountType',
  accountNumber: 'accountNumber',
  routingNumber: 'routingNumber',
  address: 'address',
  email: 'email',
  altEmail: 'altEmail',
  phoneNumber: 'phoneNumber',
  // intermediate tutorial
  expandUnder: 'expandUnder',
  conditionalFields: 'conditionalFields',
  conditionalPages: 'conditionalPages',
  // available features and usage guidelines
  radioButtonGroup: 'radioButtonGroup',
  checkboxGroup: 'checkboxGroup',
  checkboxGroup2: 'checkboxGroup2',
};

function hasDirectDeposit(formData) {
  return formData[formFields.viewNoDirectDeposit] !== true;
}

// Define all the form pages to help ensure uniqueness across all form chapters
const formPages = {
  applicantInformation: 'applicantInformation',
  serviceHistory: 'serviceHistory',
  contactInformation: 'contactInformation',
  directDeposit: 'directDeposit',
};

const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  // submitUrl: '/v0/api',
  submit: () =>
    Promise.resolve({ attributes: { confirmationNumber: '123123123' } }),
  trackingPrefix: 'mock-1234',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  formId: '00-1234',
  saveInProgress: {
    // messages: {
    //   inProgress: 'Your Mock form application (00-1234) is in progress.',
    //   expired: 'Your saved Mock form application (00-1234) has expired. If you want to apply for Mock form, please start a new application.',
    //   saved: 'Your Mock form application has been saved.',
    // },
  },
  version: 0,
  prefillEnabled: true,
  savedFormMessages: {
    notFound: 'Please start over to apply for Mock form.',
    noAuth: 'Please sign in again to continue your application for Mock form.',
  },
  title: 'Mock Form',
  defaultDefinitions: {
    fullName,
    ssn,
    date,
    dateRange,
    usaPhone,
  },
  chapters: {
    // ** Complex Form
    applicantInformationChapter: {
      title: 'Applicant Information (Basic Form elements)',
      pages: {
        [formPages.applicantInformation]: {
          path: 'applicant-information',
          title: 'Applicant Information',
          uiSchema: {
            [formFields.fullName]: fullNameUI,
            [formFields.ssn]: ssnUI,
          },
          schema: {
            type: 'object',
            required: [formFields.fullName],
            properties: {
              [formFields.fullName]: fullName,
              [formFields.ssn]: ssn,
            },
          },
        },
      },
    },
    serviceHistoryChapter: {
      title: 'Service History (Simple array loop)',
      pages: {
        [formPages.serviceHistory]: {
          path: 'service-history',
          title: 'Service History',
          uiSchema: {
            [formFields.toursOfDuty]: toursOfDutyUI,
          },
          schema: {
            type: 'object',
            properties: {
              [formFields.toursOfDuty]: toursOfDuty,
            },
          },
        },
      },
    },
    additionalInformationChapter: {
      title: 'Additional Information (manual method)',
      pages: {
        [formPages.contactInformation]: {
          path: 'contact-information',
          title: 'Contact Information',
          uiSchema: {
            [formFields.address]: address.uiSchema('Mailing address'),
            [formFields.email]: {
              'ui:title': 'Primary email',
            },
            [formFields.altEmail]: {
              'ui:title': 'Secondary email',
            },
            [formFields.phoneNumber]: phoneUI('Daytime phone'),
          },
          schema: {
            type: 'object',
            properties: {
              [formFields.address]: address.schema(fullSchema, true),
              [formFields.email]: {
                type: 'string',
                format: 'email',
              },
              [formFields.altEmail]: {
                type: 'string',
                format: 'email',
              },
              [formFields.phoneNumber]: usaPhone,
            },
          },
        },
        [formPages.directDeposit]: {
          path: 'direct-deposit',
          title: 'Direct Deposit',
          uiSchema: {
            'ui:title': 'Direct deposit',
            [formFields.viewNoDirectDeposit]: {
              'ui:title': 'I don’t want to use direct deposit',
            },
            [formFields.bankAccount]: {
              ...bankAccountUI,
              'ui:order': [
                formFields.accountType,
                formFields.accountNumber,
                formFields.routingNumber,
              ],
              'ui:options': {
                hideIf: formData => !hasDirectDeposit(formData),
              },
              [formFields.accountType]: {
                'ui:required': hasDirectDeposit,
              },
              [formFields.accountNumber]: {
                'ui:required': hasDirectDeposit,
              },
              [formFields.routingNumber]: {
                'ui:required': hasDirectDeposit,
              },
            },
            [formFields.viewStopWarning]: {
              'ui:description': directDepositWarning,
              'ui:options': {
                hideIf: hasDirectDeposit,
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              [formFields.viewNoDirectDeposit]: {
                type: 'boolean',
              },
              [formFields.bankAccount]: bankAccount,
              [formFields.viewStopWarning]: {
                type: 'object',
                properties: {},
              },
            },
          },
        },
      },
    },

    // ** Intermediate tutorial examples
    intermediateTutorialChapter: {
      title: 'Intermediate tutorial examples',
      pages: {
        [formPages.expandUnder]: {
          path: 'expand-under',
          title: 'Expand under title', // ignored?
          uiSchema: {
            expandUnderExample: {
              'ui:title': 'Expand under example',
              'ui:description': 'Choose "Yes" to reveal a conditional field',
              'ui:widget': 'yesNo',
              'ui:options': {
                labels: {
                  Y: 'Yes, this is what I want',
                  N: 'No, I do not want this',
                },
                widgetProps: {
                  Y: { 'data-info': 'yes' },
                  N: { 'data-info': 'no' },
                },
                // Only added to the radio when it is selected
                // a11y requirement: aria-describedby ID's *must* exist on the page;
                // and we conditionally add content based on the selection
                selectedProps: {
                  Y: { 'aria-describedby': 'root_myConditionalField-label' },
                  // this ID doesn't exist, setting this would cause an axe error
                  // N: { 'aria-describedby': 'different_id' },
                },
              },
            },
            myConditionalField: {
              'ui:title': 'My conditional field title',
              'ui:description': 'My conditional field description',
              'ui:options': {
                expandUnder: 'expandUnderExample',
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              expandUnderExample: {
                type: 'boolean',
              },
              myConditionalField: {
                type: 'string',
              },
            },
          },
        },
        [formPages.conditionalFields]: {
          path: 'conditionally-hidden',
          title: 'Conditionally hidden',
          uiSchema: {
            conditionalFieldExample: {
              'ui:title': 'Conditionally hidden example',
              'ui:description':
                'Choose "Yes" to reveal a conditionally hidden field',
              'ui:widget': 'yesNo',
              'ui:options': {
                labels: {
                  Y: 'Yes, this is what I want',
                  N: 'No, I do not want this',
                },
                widgetProps: {
                  Y: { 'data-info': 'yes' },
                  N: { 'data-info': 'no' },
                },
                // Only added to the radio when it is selected
                // a11y requirement: aria-describedby ID's *must* exist on the page;
                // and we conditionally add content based on the selection
                selectedProps: {
                  Y: { 'aria-describedby': 'some_id' },
                  // this ID doesn't exist, setting this would cause an axe error
                  // N: { 'aria-describedby': 'different_id' }
                },
              },
            },
            myConditionalField: {
              'ui:title': 'My conditional field',
              'ui:options': {
                hideIf: formData => formData.conditionalFieldExample !== true,
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              conditionalFieldExample: {
                type: 'boolean',
              },
              myConditionalField: {
                type: 'string',
              },
            },
          },
        },
        [formPages.conditionalPages]: {
          'ui:title': 'Conditional page',
          depends: form => form.conditionalFieldExample,
          uiSchema: {
            conditionalPageExample: {
              'ui:title': 'Conditional Page',
              'ui:description': 'Shown when conditional field value is true',
              'ui:widget': 'yesNo',
              'ui:options': {
                labels: {
                  Y: 'Yes, this is what I want',
                  N: 'No, I do not want this',
                },
                widgetProps: {
                  Y: { 'data-info': 'yes' },
                  N: { 'data-info': 'no' },
                },
                // Only added to the radio when it is selected
                // a11y requirement: aria-describedby ID's *must* exist on the page;
                // and we conditionally add content based on the selection
                selectedProps: {
                  Y: { 'aria-describedby': 'some_id' },
                  N: { 'aria-describedby': 'different_id' },
                },
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              myField: {
                type: 'boolean',
              },
            },
          },
        },
      },
    },

    //
    availableFeaturesAndUsageChapter: {
      title: 'Available features and usage guidelines examples',
      pages: {
        [formPages.radioButtonGroup]: {
          'ui:title': 'Radio button group',
          path: 'radio-button-group',
          title: 'Radio button group example',
          uiSchema: {
            favoriteAnimal: {
              'ui:widget': 'radio',
              'ui:options': {
                labels: {
                  dog: 'Dog',
                  cat: 'Cat',
                  octopus: 'Octopus',
                  sloth: 'Sloth',
                },
                widgetProps: {
                  dog: { 'data-info': 'dog_1' },
                  cat: { 'data-info': 'cat_2' },
                  octopus: { 'data-info': 'octopus_3' },
                  sloth: { 'data-info': 'sloth_4' },
                },
                // Only added to the radio when it is selected
                // a11y requirement: aria-describedby ID's *must* exist on the page; and we
                // conditionally add content based on the selection
                selectedProps: {
                  // dog: { 'aria-describedby': 'some_id_1' },
                  // cat: { 'aria-describedby': 'some_id_2' },
                  // octopus: { 'aria-describedby': 'some_id_3' },
                  // sloth: { 'aria-describedby': 'some_id_4' },
                },
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              favoriteAnimal: {
                type: 'string',
                enum: ['dog', 'cat', 'octopus', 'sloth'],
              },
            },
          },
        },
        [formPages.checkboxGroup]: {
          'ui:title': 'Checkbox group pattern',
          path: 'checkbox-group-pattern',
          title: 'Checkbox group pattern',
          uiSchema: {
            'view:booksRead': {
              'ui:title': 'Which books have you read?',
              'ui:description': 'You may check more than one.',
              hasReadPrideAndPrejudice: {
                'ui:title': 'Pride and Prejudice by Jane Austen',
              },
              hasReadJaneEyre: {
                'ui:title': 'Jane Eyre by Charlotte Brontë',
              },
              hasReadGreatGatsby: {
                'ui:title': 'The Great Gatsby by F. Scott Fitzgerald',
              },
              hasReadBuddenbrooks: {
                'ui:title': 'Buddenbrooks by Thomas Mann',
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              'view:booksRead': {
                type: 'object',
                properties: {
                  hasReadPrideAndPrejudice: { type: 'boolean' },
                  hasReadJaneEyre: { type: 'boolean' },
                  hasReadGreatGatsby: { type: 'boolean' },
                  hasReadBuddenbrooks: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default formConfig;
