/* eslint-disable react/jsx-key */
import React from 'react';
import moment from 'moment';
import * as Sentry from '@sentry/browser';
// import appendQuery from 'append-query';
import { createSelector } from 'reselect';
import { omit } from 'lodash';
import merge from 'lodash/merge';
import fastLevenshtein from 'fast-levenshtein';
import Breadcrumbs from '@department-of-veterans-affairs/component-library/Breadcrumbs';

import { apiRequest } from 'platform/utilities/api';
import environment from 'platform/utilities/environment';
import _ from 'platform/utilities/data';
import { focusElement } from 'platform/utilities/ui';

import fullSchema from 'vets-json-schema/dist/21-526EZ-ALLCLAIMS-schema.json';
import fileUploadUI from 'platform/forms-system/src/js/definitions/file';
import ReviewCardField from 'platform/forms-system/src/js/components/ReviewCardField';
import AddressViewField from 'platform/forms-system/src/js/components/AddressViewField';
import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import { isValidYear } from 'platform/forms-system/src/js/utilities/validations';

import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import {
  DATA_PATHS,
  DISABILITY_526_V2_ROOT_URL,
  HOMELESSNESS_TYPES,
  MILITARY_CITIES,
  MILITARY_STATE_LABELS,
  MILITARY_STATE_VALUES,
  NINE_ELEVEN,
  PTSD_MATCHES,
  RESERVE_GUARD_TYPES,
  STATE_LABELS,
  STATE_VALUES,
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_FILE_SIZE_BYTES,
  USA,
  TYPO_THRESHOLD,
  itfStatuses,
  NULL_CONDITION_STRING,
  DATE_FORMAT,
  SAVED_SEPARATION_DATE,
  PAGE_TITLES,
  START_TEXT,
  FORM_STATUS_BDD,
  PDF_SIZE_FEATURE,
  CHAR_LIMITS,
} from '../constants';
import {
  validateMilitaryCity,
  validateMilitaryState,
  validateZIP,
} from '../validations';

/**
 * Returns an object where all the fields are prefixed with `view:` if they aren't already
 */
export const viewifyFields = formData => {
  const newFormData = {};
  Object.keys(formData).forEach(key => {
    const viewKey = /^view:/.test(key) ? key : `view:${key}`;
    // Recurse if necessary
    newFormData[viewKey] =
      typeof formData[key] === 'object' && !Array.isArray(formData[key])
        ? viewifyFields(formData[key])
        : formData[key];
  });
  return newFormData;
};

/**
 * Show one thing, have a screen reader say another.
 *
 * @param {ReactElement|ReactComponent|String} srIgnored -- Thing to be displayed visually,
 *                                                           but ignored by screen readers
 * @param {String} substitutionText -- Text for screen readers to say instead of srIgnored
 */
export const srSubstitute = (srIgnored, substitutionText) => (
  <span>
    <span aria-hidden>{srIgnored}</span>
    <span className="sr-only">{substitutionText}</span>
  </span>
);

export const isUndefined = value => (value || '') === '';

export const formatDate = (date, format = DATE_FORMAT) => {
  const m = moment(date);
  return date && m.isValid() ? m.format(format) : 'Unknown';
};

export const formatDateRange = (dateRange = {}, format = DATE_FORMAT) =>
  dateRange?.from || dateRange?.to
    ? `${formatDate(dateRange.from, format)} to ${formatDate(
        dateRange.to,
        format,
      )}`
    : 'Unknown';

// moment().isSameOrBefore() => true; so expirationDate can't be undefined
export const isNotExpired = (expirationDate = '') =>
  moment().isSameOrBefore(expirationDate);

export const isValidFullDate = dateString => {
  // expecting dateString = 'YYYY-MM-DD'
  const date = moment(dateString);
  return (
    (date?.isValid() &&
      // moment('2021') => '2021-01-01'
      // moment('XXXX-01-01') => '2001-01-01'
      dateString === formatDate(date, 'YYYY-MM-DD') &&
      // make sure we're within the min & max year range
      isValidYear(date.year())) ||
    false
  );
};

export const isValidServicePeriod = data => {
  const { serviceBranch, dateRange: { from = '', to = '' } = {} } = data || {};
  return (
    (!isUndefined(serviceBranch) &&
      !isUndefined(from) &&
      !isUndefined(to) &&
      isValidFullDate(from) &&
      isValidFullDate(to) &&
      moment(from).isBefore(moment(to))) ||
    false
  );
};

export const isActiveITF = currentITF => {
  if (currentITF) {
    const isActive = currentITF.status === itfStatuses.active;
    return isActive && isNotExpired(currentITF.expirationDate);
  }
  return false;
};

export const hasGuardOrReservePeriod = formData => {
  const serviceHistory = formData.servicePeriods;
  if (!serviceHistory || !Array.isArray(serviceHistory)) {
    return false;
  }

  return serviceHistory.reduce((isGuardReserve, { serviceBranch }) => {
    // For a new service period, service branch defaults to undefined
    if (!serviceBranch) {
      return isGuardReserve;
    }
    const { nationalGuard, reserve } = RESERVE_GUARD_TYPES;
    return (
      isGuardReserve ||
      serviceBranch.includes(reserve) ||
      serviceBranch.includes(nationalGuard)
    );
  }, false);
};

export const ReservesGuardDescription = ({ formData }) => {
  const { servicePeriods } = formData;
  if (
    !servicePeriods ||
    !Array.isArray(servicePeriods) ||
    !servicePeriods[0].serviceBranch
  ) {
    return null;
  }

  const mostRecentPeriod = servicePeriods
    .filter(({ serviceBranch }) => {
      const { nationalGuard, reserve } = RESERVE_GUARD_TYPES;
      return (
        serviceBranch.includes(nationalGuard) || serviceBranch.includes(reserve)
      );
    })
    .map(({ serviceBranch, dateRange }) => {
      const dateTo = new Date(dateRange.to);
      return {
        serviceBranch,
        to: dateTo,
      };
    })
    .sort((periodA, periodB) => periodB.to - periodA.to)[0];

  if (!mostRecentPeriod) {
    return null;
  }
  const { serviceBranch, to } = mostRecentPeriod;
  return (
    <div>
      Please tell us more about your {serviceBranch} service that ended on{' '}
      {formatDate(to)}.
    </div>
  );
};

export const title10DatesRequired = formData =>
  _.get(
    'serviceInformation.reservesNationalGuardService.view:isTitle10Activated',
    formData,
    false,
  );

const capitalizeWord = word => {
  const capFirstLetter = word[0].toUpperCase();
  return `${capFirstLetter}${word.slice(1)}`;
};

/**
 * Takes a string and returns the same string with every word capitalized. If no valid
 * string is given as input, returns NULL_CONDITION_STRING and logs to Sentry.
 * @param {string} name the lower-case name of a disability
 * @returns {string} the input name, but with all words capitalized
 */
export const capitalizeEachWord = name => {
  if (name && typeof name === 'string') {
    return name.replace(/\w[^\s-]*/g, capitalizeWord);
  }

  if (typeof name !== 'string') {
    Sentry.captureMessage(
      `form_526_v2: capitalizeEachWord requires 'name' argument of type 'string' but got ${typeof name}`,
    );
  }

  return null;
};

export const hasForwardingAddress = formData =>
  _.get('view:hasForwardingAddress', formData, false);

export const forwardingCountryIsUSA = formData =>
  _.get('forwardingAddress.country', formData, '') === USA;

export function queryForFacilities(input = '') {
  // Only search if the input has a length >= 3, otherwise, return an empty array
  if (input.length < 3) {
    return Promise.resolve([]);
  }

  /**
   * Facilities endpoint removed for now, but we may be able to use EVSS's
   * endpoint /referencedata/v1/treatmentcenter
   * See https://github.com/department-of-veterans-affairs/va.gov-team/issues/14028#issuecomment-765717797
   * /
  const url = appendQuery('/facilities/suggested', {
    type: ['health', 'dod_health'],
    name_part: input, // eslint-disable-line camelcase
  });

  return apiRequest(url)
    .then(response =>
      response.data.map(facility => ({
        id: facility.id,
        label: facility.attributes.name,
      })),
    )
    .catch(error => {
      Sentry.withScope(scope => {
        scope.setExtra('input', input);
        scope.setExtra('error', error);
        Sentry.captureMessage('Error querying for facilities');
      });
      return [];
    });
    /* */
  return Promise.resolve([]);
}

export function getSeparationLocations() {
  return apiRequest('/disability_compensation_form/separation_locations')
    .then(({ separationLocations }) =>
      separationLocations.map(separationLocation => ({
        id: separationLocation.code,
        label: separationLocation.description,
      })),
    )
    .catch(error => {
      Sentry.withScope(scope => {
        scope.setExtra('error', error);
        Sentry.captureMessage('Error getting separation locations');
      });
      return [];
    });
}

export const disabilityIsSelected = disability => disability['view:selected'];

/**
 * Takes a string and returns another that won't break SiP when used
 * as a property name.
 * @param {string} str - The string to make SiP-friendly
 * @return {string} The SiP-friendly string
 */
const regexNonWord = /[^\w]/g;
export const sippableId = str =>
  (str || 'blank').replace(regexNonWord, '').toLowerCase();

const createCheckboxSchema = (schema, disabilityName) => {
  const capitalizedDisabilityName =
    typeof disabilityName === 'string'
      ? capitalizeEachWord(disabilityName)
      : NULL_CONDITION_STRING;
  return _.set(
    // As an array like this to prevent periods in the name being interpreted as nested objects
    [sippableId(disabilityName)],
    { title: capitalizedDisabilityName, type: 'boolean' },
    schema,
  );
};

export const makeSchemaForNewDisabilities = createSelector(
  formData => formData.newDisabilities,
  (newDisabilities = []) => ({
    properties: newDisabilities
      .map(disability => disability.condition)
      .reduce(createCheckboxSchema, {}),
  }),
);

export const makeSchemaForRatedDisabilities = createSelector(
  formData => formData.ratedDisabilities,
  (ratedDisabilities = []) => ({
    properties: ratedDisabilities
      .filter(disabilityIsSelected)
      .map(disability => disability.name)
      .reduce(createCheckboxSchema, {}),
  }),
);

export const makeSchemaForAllDisabilities = createSelector(
  makeSchemaForNewDisabilities,
  makeSchemaForRatedDisabilities,
  (newDisabilitiesSchema, ratedDisabilitiesSchema) =>
    merge({}, newDisabilitiesSchema, ratedDisabilitiesSchema),
);

export const hasVAEvidence = formData =>
  _.get(DATA_PATHS.hasVAEvidence, formData, false);
export const hasOtherEvidence = formData =>
  _.get(DATA_PATHS.hasAdditionalDocuments, formData, false);
export const hasPrivateEvidence = formData =>
  _.get(DATA_PATHS.hasPrivateEvidence, formData, false);

/**
 * Inspects all given paths in the formData object for presence of values
 * @param {object} formData  full formData for the form
 * @param {array} fieldPaths full paths in formData for other fields that
 *                           should be checked for input
 * @returns {boolean} true if at least one path is not empty / false otherwise
 */
export const fieldsHaveInput = (formData, fieldPaths) =>
  fieldPaths.some(path => !!_.get(path, formData, ''));

export const bankFieldsHaveInput = formData =>
  fieldsHaveInput(formData, [
    'view:bankAccount.bankAccountType',
    'view:bankAccount.bankAccountNumber',
    'view:bankAccount.bankRoutingNumber',
    'view:bankAccount.bankName',
  ]);

/**
 * Returns the path with any ':index' substituted with the actual index.
 * @param {string} path - The path with or without ':index'
 * @param {number} index - The index to put in the string
 * @return {string}
 */
export const pathWithIndex = (path, index) => path.replace(':index', index);

/**
 * Returns the uiSchema for addresses that use the non-common address schema as found
 *  in the 526EZ-all-claims schema.
 * @param {string} addressPath - The path to the address in the formData
 * @param {string} [title] - Displayed as the card title in the card's header
 * @param {boolean} reviewCard - Whether to display the information in a ReviewCardField or not
 * @param {boolean} fieldsAreRequired - Whether the typical fields should be required or not
 * @returns {object} - UI schema for an address card's content
 */
export const addressUISchema = (
  addressPath,
  title,
  reviewCard,
  fieldsAreRequired = true,
) => {
  const updateStates = (formData, currentSchema, uiSchema, index) => {
    // Could use path (updateSchema callback param after index), but it points to `state`,
    //  so using `addressPath` is easier
    const currentCity = _.get(
      `${pathWithIndex(addressPath, index)}.city`,
      formData,
      '',
    )
      .trim()
      .toUpperCase();
    if (MILITARY_CITIES.includes(currentCity)) {
      return {
        enum: MILITARY_STATE_VALUES,
        enumNames: MILITARY_STATE_LABELS,
      };
    }

    return {
      enum: STATE_VALUES,
      enumNames: STATE_LABELS,
    };
  };

  return {
    'ui:order': [
      'country',
      'addressLine1',
      'addressLine2',
      'addressLine3',
      'city',
      'state',
      'zipCode',
    ],
    'ui:title': title,
    'ui:field': reviewCard && ReviewCardField,
    'ui:options': {
      viewComponent: AddressViewField,
    },
    country: {
      'ui:title': 'Country',
      'ui:autocomplete': 'country',
    },
    addressLine1: {
      'ui:title': 'Street address',
      'ui:autocomplete': 'address-line1',
      'ui:errorMessages': {
        pattern: 'Please enter a valid street address',
        required: 'Please enter a street address',
      },
    },
    addressLine2: {
      'ui:title': 'Street address line 2',
      'ui:autocomplete': 'address-line2',
      'ui:errorMessages': {
        pattern: 'Please enter a valid street address',
      },
    },
    addressLine3: {
      'ui:title': 'Street address line 3',
      'ui:autocomplete': 'address-line3',
      'ui:errorMessages': {
        pattern: 'Please enter a valid street address',
      },
    },
    city: {
      'ui:title': 'City',
      'ui:autocomplete': 'address-level2',
      'ui:validations': [
        {
          options: { addressPath },
          // pathWithIndex is called in validateMilitaryCity
          validator: validateMilitaryCity,
        },
      ],
      'ui:errorMessages': {
        pattern: 'Please enter a valid city',
        required: 'Please enter a city',
      },
    },
    state: {
      'ui:title': 'State',
      'ui:autocomplete': 'address-level1',
      'ui:required': (formData, index) =>
        fieldsAreRequired &&
        _.get(`${pathWithIndex(addressPath, index)}.country`, formData, '') ===
          USA,
      'ui:options': {
        hideIf: (formData, index) =>
          _.get(
            `${pathWithIndex(addressPath, index)}.country`,
            formData,
            '',
          ) !== USA,
        updateSchema: updateStates,
      },
      'ui:validations': [
        {
          options: { addressPath },
          // pathWithIndex is called in validateMilitaryState
          validator: validateMilitaryState,
        },
      ],
      'ui:errorMessages': {
        pattern: 'Please enter a valid state',
        required: 'Please enter a state',
      },
    },
    zipCode: {
      'ui:title': 'Postal code',
      'ui:autocomplete': 'postal-code',
      'ui:validations': [validateZIP],
      'ui:required': (formData, index) =>
        fieldsAreRequired &&
        _.get(`${pathWithIndex(addressPath, index)}.country`, formData, '') ===
          USA,
      'ui:errorMessages': {
        required: 'Please enter a postal code',
        pattern:
          'Please enter a valid 5- or 9-digit postal code (dashes allowed)',
      },
      'ui:options': {
        widgetClassNames: 'va-input-medium-large',
        hideIf: (formData, index) =>
          _.get(
            `${pathWithIndex(addressPath, index)}.country`,
            formData,
            '',
          ) !== USA,
      },
    },
  };
};

const ptsdAddressOmitions = [
  'addressLine1',
  'addressLine2',
  'addressLine3',
  'postalCode',
  'zipCode',
];

/**
 * @param {string} addressPath - The path to the address in the formData
 */
export function incidentLocationUISchema(addressPath) {
  const addressUIConfig = omit(
    addressUISchema(addressPath, null, false, false),
    ptsdAddressOmitions,
  );
  return {
    ...addressUIConfig,
    state: {
      ...addressUIConfig.state,
      'ui:title': 'State/Province',
    },
    additionalDetails: {
      'ui:title':
        'Additional details (This could include an address, landmark, military installation, or other location.)',
      'ui:widget': 'textarea',
    },
    'ui:order': ['country', 'state', 'city', 'additionalDetails'],
  };
}

const post911Periods = createSelector(
  data => _.get('serviceInformation.servicePeriods', data, []),
  periods =>
    periods.filter(({ dateRange }) => {
      if (!(dateRange && dateRange.to)) {
        return false;
      }

      const toDate = new Date(dateRange.to);
      const cutOff = new Date(NINE_ELEVEN);
      return toDate.getTime() > cutOff.getTime();
    }),
);

export const servedAfter911 = formData => !!post911Periods(formData).length;

export const isDisabilityPtsd = disability => {
  if (!disability || typeof disability !== 'string') {
    return false;
  }

  const strippedDisability = disability.toLowerCase().replace(/[^a-zA-Z]/g, '');

  return PTSD_MATCHES.some(ptsdString => {
    const strippedString = ptsdString.replace(/[^a-zA-Z]/g, '');
    if (strippedString === strippedDisability) {
      return true;
    }

    // does the veteran's input contain a string from our match list?
    if (strippedDisability.includes(strippedString)) {
      return true;
    }

    return (
      fastLevenshtein.get(strippedString, strippedDisability) <
      Math.ceil(strippedDisability.length * TYPO_THRESHOLD)
    );
  });
};

export const hasRatedDisabilities = formData =>
  formData?.ratedDisabilities?.length > 0;

export const isClaimingNew = formData =>
  _.get(
    'view:claimType.view:claimingNew',
    formData,
    // force default to true if user has no rated disabilities
    !hasRatedDisabilities(formData),
  );

export const isClaimingIncrease = formData =>
  _.get('view:claimType.view:claimingIncrease', formData, false);

export const isBDD = formData => {
  const isBddDataFlag = Boolean(formData?.['view:isBddData']);
  const servicePeriods = formData?.serviceInformation?.servicePeriods || [];

  // separation date entered in the wizard
  const separationDate = window.sessionStorage.getItem(SAVED_SEPARATION_DATE);

  // this flag helps maintain the correct form title within a session
  // Removed because of Cypress e2e tests don't have access to 'view:isBddData'
  // window.sessionStorage.removeItem(FORM_STATUS_BDD);

  // isActiveDuty is true when the user selects that option in the wizard & then
  // enters a separation date - based on the session storage value; we then
  // set this flag in the formData.
  // If the user doesn't choose the active duty wizard option, but enters a
  // future date in their service history, this may be associated with reserves
  // and therefor should not open the BDD flow
  const isActiveDuty = isBddDataFlag || separationDate;

  if (
    !isActiveDuty ||
    // User hasn't started the form or the wizard
    (servicePeriods.length === 0 && !separationDate)
  ) {
    return false;
  }

  const mostRecentDate = separationDate
    ? moment(separationDate)
    : servicePeriods
        .filter(({ dateRange }) => dateRange?.to)
        .map(({ dateRange }) => moment(dateRange?.to))
        .sort((dateA, dateB) => (dateB.isBefore(dateA) ? -1 : 1))[0];

  if (!mostRecentDate) {
    window.sessionStorage.setItem(FORM_STATUS_BDD, 'false');
    return false;
  }

  const result =
    isActiveDuty &&
    mostRecentDate.isAfter(moment().add(89, 'days')) &&
    !mostRecentDate.isAfter(moment().add(180, 'days'));

  // this flag helps maintain the correct form title within a session
  window.sessionStorage.setItem(FORM_STATUS_BDD, result ? 'true' : 'false');
  return Boolean(result);
};

export const hasNewPtsdDisability = formData =>
  isClaimingNew(formData) &&
  _.get('newDisabilities', formData, []).some(disability =>
    isDisabilityPtsd(disability.condition),
  );

export const showPtsdCombat = formData =>
  hasNewPtsdDisability(formData) &&
  _.get('view:selectablePtsdTypes.view:combatPtsdType', formData, false);

export const showPtsdNonCombat = formData =>
  hasNewPtsdDisability(formData) &&
  _.get('view:selectablePtsdTypes.view:nonCombatPtsdType', formData, false) &&
  // skip non-combat question if Veteran says yes to combat question
  !_.get('skip781ForCombatReason', formData, false);

export const skip781 = formData =>
  _.get('skip781ForCombatReason', formData) === true ||
  _.get('skip781ForNonCombatReason', formData) === true;

export const needsToEnter781 = formData =>
  (showPtsdCombat(formData) || showPtsdNonCombat(formData)) &&
  !skip781(formData);

export const needsToEnter781a = formData =>
  hasNewPtsdDisability(formData) &&
  (_.get('view:selectablePtsdTypes.view:mstPtsdType', formData, false) ||
    _.get('view:selectablePtsdTypes.view:assaultPtsdType', formData, false));

export const isUploading781Form = formData =>
  _.get('view:upload781Choice', formData, '') === 'upload';

export const isUploading781aForm = formData =>
  _.get('view:upload781aChoice', formData, '') === 'upload';

export const isAnswering781Questions = index => formData =>
  needsToEnter781(formData) &&
  _.get('view:upload781Choice', formData, '') === 'answerQuestions' &&
  (_.get(`view:enterAdditionalEvents${index - 1}`, formData, false) ||
    index === 0);

export const isAnswering781aQuestions = index => formData =>
  needsToEnter781a(formData) &&
  _.get('view:upload781aChoice', formData, '') === 'answerQuestions' &&
  (_.get(`view:enterAdditionalSecondaryEvents${index - 1}`, formData, false) ||
    index === 0);

export const isUploading781aSupportingDocuments = index => formData =>
  isAnswering781aQuestions(index)(formData) &&
  _.get(`secondaryIncident${index}.view:uploadSources`, formData, false);

export const isAddingIndividuals = index => formData =>
  isAnswering781Questions(index)(formData) &&
  _.get(`view:individualsInvolved${index}`, formData, false);

export const isUploading8940Form = formData =>
  _.get('view:unemployabilityUploadChoice', formData, '') === 'upload';

export const getHomelessOrAtRisk = formData => {
  const homelessStatus = _.get('homelessOrAtRisk', formData, '');
  return (
    homelessStatus === HOMELESSNESS_TYPES.homeless ||
    homelessStatus === HOMELESSNESS_TYPES.atRisk
  );
};

export const isNotUploadingPrivateMedical = formData =>
  _.get(DATA_PATHS.hasPrivateRecordsToUpload, formData) === false;

export const needsToEnterUnemployability = formData =>
  _.get('view:unemployable', formData, false);

export const needsToAnswerUnemployability = formData =>
  needsToEnterUnemployability(formData) &&
  _.get('view:unemployabilityUploadChoice', formData, '') === 'answerQuestions';

export const hasDoctorsCare = formData =>
  needsToAnswerUnemployability(formData) &&
  _.get('unemployability.underDoctorsCare', formData, false);

export const hasHospitalCare = formData =>
  needsToAnswerUnemployability(formData) &&
  _.get('unemployability.hospitalized', formData, false);

export const getPdfSizeFeature = () =>
  sessionStorage.getItem(PDF_SIZE_FEATURE) === 'true';

export const ancillaryFormUploadUi = (
  label,
  itemDescription,
  {
    attachmentId = '',
    widgetType = 'select',
    customClasses = '',
    isDisabled = false,
    addAnotherLabel = 'Add Another',
  } = {},
) => {
  const pdfSizeFeature = getPdfSizeFeature();
  // a11y focus management. Move focus to select after upload
  // see va.gov-team/issues/19688
  const findAndFocusLastSelect = () => {
    // focus on last document type select since all new uploads are appended
    const lastSelect = [...document.querySelectorAll('select')].slice(-1);
    if (lastSelect.length) {
      focusElement(lastSelect[0]);
    }
  };
  return fileUploadUI(label, {
    itemDescription,
    hideLabelText: !label,
    fileUploadUrl: `${environment.API_URL}/v0/upload_supporting_evidence`,
    addAnotherLabel,
    fileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'txt'],
    // not sure what to do here... we need to differentiate pdf vs everything
    // else; the check is in the actions.js > uploadFile function
    maxSize: MAX_FILE_SIZE_BYTES,
    maxPdfSize: pdfSizeFeature ? MAX_PDF_FILE_SIZE_BYTES : MAX_FILE_SIZE_BYTES,
    minSize: 1,
    createPayload: (file, _formId, password) => {
      const payload = new FormData();
      payload.append('supporting_evidence_attachment[file_data]', file);
      if (password) {
        payload.append('supporting_evidence_attachment[password]', password);
      }
      return payload;
    },
    parseResponse: (response, file) => {
      setTimeout(() => {
        findAndFocusLastSelect();
      });
      return {
        name: file.name,
        confirmationCode: response.data.attributes.guid,
        attachmentId,
      };
    },
    attachmentSchema: ({ fileId }) => ({
      'ui:title': 'Document type',
      'ui:disabled': isDisabled,
      'ui:widget': widgetType,
      'ui:options': {
        widgetProps: {
          'aria-describedby': fileId,
        },
      },
    }),
    classNames: customClasses,
    attachmentName: false,
  });
};

export const isUploadingSupporting8940Documents = formData =>
  needsToAnswerUnemployability(formData) &&
  _.get('view:uploadUnemployabilitySupportingDocumentsChoice', formData, false);

export const wantsHelpWithOtherSourcesSecondary = index => formData =>
  _.get(`secondaryIncident${index}.otherSources`, formData, '') &&
  isAnswering781aQuestions(index)(formData);

export const wantsHelpWithPrivateRecordsSecondary = index => formData =>
  _.get(
    `secondaryIncident${index}.otherSourcesHelp.view:helpPrivateMedicalTreatment`,
    formData,
    '',
  ) &&
  isAnswering781aQuestions(index)(formData) &&
  wantsHelpWithOtherSourcesSecondary(index)(formData);

export const wantsHelpRequestingStatementsSecondary = index => formData =>
  _.get(
    `secondaryIncident${index}.otherSourcesHelp.view:helpRequestingStatements`,
    formData,
    '',
  ) &&
  isAnswering781aQuestions(index)(formData) &&
  wantsHelpWithOtherSourcesSecondary(index)(formData);

export const getAttachmentsSchema = defaultAttachmentId => {
  const { attachments } = fullSchema.properties;
  return _.set(
    'items.properties.attachmentId.default',
    defaultAttachmentId,
    attachments,
  );
};

const isDateRange = ({ from, to }) => !!(from && to);

const parseDate = dateString => moment(dateString, 'YYYY-MM-DD');

// NOTE: Could move this to outside all-claims
/**
 * Checks to see if the first parameter is inside the date range (second parameter).
 * If the first parameter is a date range, it'll return true if both dates are inside the range.
 * @typedef {Object} DateRange
 * @property {string} to - A date string YYYY-MM-DD
 * @property {string} from - A date string YYYY-MM-DD
 * ---
 * @param {String|DateRange} inside - The date or date range to check
 * @param {DateRange} outside - The range `inside` must fit in
 * @param {String} inclusivity - See https://momentjs.com/docs/#/query/is-between/
 *                               NOTE: This function defaults to inclusive dates which is different
 *                               from moment's default
 */
export const isWithinRange = (inside, outside, inclusivity = '[]') => {
  if (isDateRange(inside)) {
    return (
      isWithinRange(inside.to, outside, inclusivity) &&
      isWithinRange(inside.from, outside, inclusivity)
    );
  }
  if (typeof inside !== 'string') return false;

  const insideDate = parseDate(inside);
  const from = parseDate(outside.from);
  const to = parseDate(outside.to);

  return insideDate.isBetween(from, to, 'days', inclusivity);
};

// This is in here instead of validations.js because it returns a jsx element
export const getPOWValidationMessage = servicePeriodDateRanges => (
  <span>
    The dates you enter must be within one of the service periods you entered.
    <ul>
      {servicePeriodDateRanges.map((range, index) => (
        <li key={index}>{formatDateRange(range)}</li>
      ))}
    </ul>
  </span>
);

export const increaseOnly = formData =>
  isClaimingIncrease(formData) && !isClaimingNew(formData);
export const newConditionsOnly = formData =>
  !isClaimingIncrease(formData) && isClaimingNew(formData);
export const newAndIncrease = formData =>
  isClaimingNew(formData) && isClaimingIncrease(formData);

// Shouldn't be possible, but just in case this requirement is lifted later...
export const noClaimTypeSelected = formData =>
  !isClaimingNew(formData) && !isClaimingIncrease(formData);

/**
 * The base urls for each form
 * @readonly
 * @enum {String}
 */
export const urls = {
  v2: DISABILITY_526_V2_ROOT_URL,
};

/**
 * Returns the base url of whichever form the user needs to go to.
 *
 * @param {Object} formData - The saved form data
 * @param {Boolean} isPrefill - True if formData comes from pre-fill, false if it's a saved form
 * @return {String} - The base url of the right form to return to
 */

export const claimingRated = formData =>
  formData?.ratedDisabilities?.some(d => d['view:selected']);

// TODO: Rename this to avoid collision with `isClaimingNew` above
export const claimingNew = formData =>
  formData?.newDisabilities?.some(d => d.condition);

export const hasClaimedConditions = formData =>
  (isClaimingIncrease(formData) && claimingRated(formData)) ||
  (isClaimingNew(formData) && claimingNew(formData));

/**
 * Finds active service periods—those without end dates or end dates
 * in the future.
 */
export const activeServicePeriods = formData =>
  _.get('serviceInformation.servicePeriods', formData, []).filter(
    sp => !sp.dateRange.to || moment(sp.dateRange.to).isAfter(moment()),
  );

export const isUploadingSTR = formData =>
  isBDD(formData) &&
  _.get(
    'view:uploadServiceTreatmentRecordsQualifier.view:hasServiceTreatmentRecordsToUpload',
    formData,
    false,
  );

export const DISABILITY_SHARED_CONFIG = {
  orientation: {
    path: 'disabilities/orientation',
    // Only show the page if both (or potentially neither) options are chosen on the claim-type page
    depends: formData => newAndIncrease(formData) && !isBDD(formData),
  },
  ratedDisabilities: {
    path: 'disabilities/rated-disabilities',
    depends: formData => isClaimingIncrease(formData) && !isBDD(formData),
  },
  addDisabilities: {
    path: 'new-disabilities/add',
    depends: isClaimingNew,
  },
};

export const getPageTitle = formData => {
  const showBDDTitle =
    formData === true ||
    isBDD(formData) ||
    window.sessionStorage.getItem(FORM_STATUS_BDD) === 'true';
  return PAGE_TITLES[showBDDTitle ? 'BDD' : 'ALL'];
};

// Intro page doesn't have formData
export const getStartText = isBDDForm => {
  const showBDDText =
    isBDDForm ||
    isBDD() ||
    window.sessionStorage.getItem(FORM_STATUS_BDD) === 'true';
  return START_TEXT[showBDDText ? 'BDD' : 'ALL'];
};

export const showSeparationLocation = formData => {
  const { serviceInformation = {} } = formData || {};
  const { servicePeriods, reservesNationalGuardService } = serviceInformation;

  // moment(undefined) => today
  // moment(null) => Invalid date
  const title10SeparationDate = moment(
    reservesNationalGuardService?.title10Activation
      ?.anticipatedSeparationDate || null,
  );

  if (
    !title10SeparationDate.isValid() &&
    (!servicePeriods || !Array.isArray(servicePeriods))
  ) {
    return false;
  }

  const today = moment();
  const todayPlus180 = moment().add(180, 'days');

  // Show separation location field if activated on federal orders & < 180 days
  if (
    title10SeparationDate.isValid() &&
    title10SeparationDate.isAfter(today) &&
    !title10SeparationDate.isAfter(todayPlus180)
  ) {
    return true;
  }

  const mostRecentDate = servicePeriods
    ?.filter(({ dateRange }) => dateRange?.to)
    .map(({ dateRange }) => moment(dateRange.to || null))
    .sort((dateA, dateB) => dateB - dateA)[0];

  return mostRecentDate?.isValid()
    ? mostRecentDate.isAfter(today) && !mostRecentDate.isAfter(todayPlus180)
    : false;
};

export const show526Wizard = state => toggleValues(state).show526Wizard;

export const showSubform8940And4192 = state =>
  toggleValues(state)[FEATURE_FLAG_NAMES.subform89404192];

export const wrapWithBreadcrumb = (title, component) => (
  <>
    <Breadcrumbs>
      <a href="/">Home</a>
      <a href="/disability">Disability Benefits</a>
      <span className="vads-u-color--black">
        <strong>{title}</strong>
      </span>
    </Breadcrumbs>
    {component}
  </>
);

const today = moment().endOf('day');
export const isExpired = date => {
  if (!date) {
    return true;
  }
  // expiresAt: Ruby saves as time from Epoch date in seconds (not milliseconds)
  const expires = moment.unix(date?.expiresAt);
  return !(expires.isValid() && expires.endOf('day').isSameOrAfter(today));
};

/**
 * @typedef NewDisability~entry
 * @property {String} condition - disability name
 * @property {String} cause - disability type
 * @property {String} primaryDescription - new disability description
 * @property {String} causedByDisabilityDescription - name of rated disability
 * @property {String} worsenedDescription - worsened description
 * @property {String} worsenedEffects - result
 * @property {String} vaMistreatmentDescription - VA involved
 * @property {String} vaMistreatmentLocation - location
 * @property {String} vaMistreatmentDate - date
 */
/**
 * Truncate long descriptions
 * @param {NewDisability~entry} data - new disability array entry
 * @returns new disability array entry with over-the-limit descriptions
 *  truncated
 */
export const truncateDescriptions = data =>
  Object.keys(data).reduce(
    (entry, key) => ({
      ...entry,
      [key]:
        key in CHAR_LIMITS
          ? data[key].substring(0, CHAR_LIMITS[key])
          : data[key],
    }),
    {},
  );
