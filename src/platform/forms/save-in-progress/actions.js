import * as Sentry from '@sentry/browser';

import recordEvent from '../../monitoring/record-event';
import { logOut } from '../../user/authentication/actions';
import { fetchAndUpdateSessionExpiration as fetch } from '../../utilities/api';
import { inProgressApi } from '../helpers';
import { removeFormApi, saveFormApi } from './api';
import { REMOVING_SAVED_FORM_SUCCESS } from '../../user/profile/actions';

export const SET_SAVE_FORM_STATUS = 'SET_SAVE_FORM_STATUS';
export const SET_AUTO_SAVE_FORM_STATUS = 'SET_AUTO_SAVE_FORM_STATUS';
export const SET_FETCH_FORM_STATUS = 'SET_FETCH_FORM_STATUS';
export const SET_FETCH_FORM_PENDING = 'SET_FETCH_FORM_PENDING';
export const SET_IN_PROGRESS_FORM = 'SET_IN_PROGRESS_FORM';
export const SET_START_OVER = 'SET_START_OVER';
export const SET_PREFILL_UNFILLED = 'SET_PREFILL_UNFILLED';

export const SAVE_STATUSES = Object.freeze({
  notAttempted: 'not-attempted',
  pending: 'pending',
  noAuth: 'no-auth',
  failure: 'failure',
  clientFailure: 'clientFailure',
  success: 'success',
});

export const saveErrors = new Set([
  SAVE_STATUSES.failure,
  SAVE_STATUSES.clientFailure,
  SAVE_STATUSES.noAuth,
]);

const saveTypes = {
  AUTO: 'auto',
  SAVE_AND_REDIRECT: 'saveAndRedirect',
};

const statusActionsByType = new Map([
  [saveTypes.AUTO, SET_AUTO_SAVE_FORM_STATUS],
  [saveTypes.SAVE_AND_REDIRECT, SET_SAVE_FORM_STATUS],
]);

export const LOAD_STATUSES = Object.freeze({
  notAttempted: 'not-attempted',
  pending: 'pending',
  noAuth: 'no-auth',
  failure: 'failure',
  forbidden: 'forbidden',
  notFound: 'not-found',
  invalidData: 'invalid-data',
  success: 'success',
});

export const PREFILL_STATUSES = {
  notAttempted: 'not-attempted',
  pending: 'pending',
  success: 'success',
  unfilled: 'unfilled',
};

export function setSaveFormStatus(
  saveType,
  status,
  lastSavedDate = null,
  expirationDate = null,
  inProgressFormId = null,
) {
  return {
    type: statusActionsByType.get(saveType),
    status,
    lastSavedDate,
    expirationDate,
    inProgressFormId,
  };
}

export function setFetchFormStatus(status) {
  return {
    type: SET_FETCH_FORM_STATUS,
    status,
  };
}

export function setFetchFormPending(prefill) {
  return {
    type: SET_FETCH_FORM_PENDING,
    prefill,
  };
}

export function setInProgressForm(data, pages) {
  return {
    type: SET_IN_PROGRESS_FORM,
    data,
    pages,
  };
}

export function setStartOver() {
  return {
    type: SET_START_OVER,
  };
}

export function setPrefillComplete() {
  return {
    type: SET_PREFILL_UNFILLED,
  };
}

/**
 * @typedef SaveInProgressData~metadata
 * @type {Object}
 * @property {Integer} version - form-specific migration version
 * @property {Boolean} prefill - flag indicating if the save in progress data is
 *   from prefill (true) or in-progress data (false)
 * @property {String} returnUrl - path to form page, e.g. `/vet-info`
 */
/**
 * @typedef SaveInProgressData
 * @type {Object}
 * @property {Object} formData - form-specific data
 * @property {SaveInProgressData~metadata} metadata
 */
/**
 * Transforms the data from an old version of a form to be used in the latest
 *  version.
 *
 * @param {SaveInProgressData} savedData The old version of the
 *  save-in-progress data.
 * @param {Array} migrations - An array of functions which transform the data
 *  saved to work with the current version.
 * @return {SaveInProgressData} The modified save-in-progress data which should
 *  work with the current version of the form.
 */
export function migrateFormData(savedData, migrations) {
  // migrations is an array that looks like this:
  // [
  //   (savedData) => {
  //     // Makes modifications to savedData to update it from version 0 -> version 1
  //   },
  //   (savedData) => {
  //     // Makes modifications to update the data from version 1 -> version 2
  //   },
  //   ...
  // ]
  // The functions transform the data from version of their index to the next one up.
  // This works because every time the version is bumped on the form, it’s because
  //  the saved data needs to be manipulated, so there will be no skipped versions.

  // Break out early in case we don’t have any migrations for the form yet
  if (!migrations) {
    return savedData;
  }

  let savedDataCopy = Object.assign({}, savedData);
  let savedVersion = savedData.metadata.version;
  while (typeof migrations[savedVersion] === 'function') {
    savedDataCopy = migrations[savedVersion](savedDataCopy);
    savedVersion++;
  }

  return savedDataCopy;
}

/**
 * @typedef Form~submission - copy of `form.submission` object which stores the
 *   state of the form last submission attempt
 * @type {Object}
 * @property {Boolean|String} status - initialized as `false`, and may end up as
 *   a string: 'submitPending', 'applicationSubmitted', 'validationError',
 *  'clientError', 'throttledError', 'serverError', etc.
 * @property {Boolean|String} errorMessage - initialized as `false`; Returns
 *   actual server errorMessage
 * @property {Object} errors - The errors object provided by the jsonschema
 *   validation library; only available when there are form validation errors
 *   prior to actual form submission to the server
 * @property {Boolean} id - initialized as `false`; never altered. A submit ID
 *   would not be available as the SiPs data is cleared after submission
 * @property {Boolean|Number} timestamp - initialized as `false`; or contains
 *   the number of milliseconds* since the Unix Epoch of the submission attempt
 * @property {Boolean} hasAttemptedSubmit - flag indicating if the user had
 *   attempted to submit a form
 * @property {Number} extra - extra 'x-ratelimit-reset' data returned from a
 *   rate limit ('throttledError) error (see submitToUrl function in the
 *   forms-system actions file)
 */
/**
 * Saves the form data to the back end
 * @param  {String}  saveType  The type of save that's happening, auto or save and redirect
 * @param  {String}  formId    The form’s formId
 * @param  {Object}  formData  The data the user has entered so far
 * @param  {Integer} version   The form’s version
 * @param  {String}  returnUrl The last URL the user was at before saving
 * @param  {Form~submission} submission Form submission data
 */
function saveForm(saveType, formId, formData, version, returnUrl, submission) {
  const savedAt = Date.now();

  return (dispatch, getState) => {
    const trackingPrefix = getState().form.trackingPrefix;

    dispatch(setSaveFormStatus(saveType, SAVE_STATUSES.pending));

    return saveFormApi(
      formId,
      formData,
      version,
      returnUrl,
      savedAt,
      trackingPrefix,
      submission,
    )
      .then(json => {
        dispatch(
          setSaveFormStatus(
            saveType,
            SAVE_STATUSES.success,
            savedAt,
            json.data.attributes.metadata.expiresAt,
            json.data.id,
          ),
        );

        return Promise.resolve(json);
      })
      .catch(resOrError => {
        let errorStatus;
        if (resOrError.status === 401) {
          dispatch(logOut());
          errorStatus = SAVE_STATUSES.noAuth;
        } else if (resOrError instanceof Response) {
          errorStatus = SAVE_STATUSES.failure;
        } else {
          errorStatus = SAVE_STATUSES.clientFailure;
        }
        dispatch(setSaveFormStatus(saveType, errorStatus));
      });
  };
}

export function autoSaveForm(...args) {
  return saveForm(saveTypes.AUTO, ...args);
}

export function saveAndRedirectToReturnUrl(...args) {
  return saveForm(saveTypes.SAVE_AND_REDIRECT, ...args);
}

/**
 * Loads the form data from the back end into the redux store.
 *
 * @param  {Integer} formId      The form’s identifier
 * @param  {Array}   migrations  An array of functions to run the data returned
 *                                from the server through in the event that the
 *                                version of the form the data was saved with
 *                                is different from the current version.
 */
export function fetchInProgressForm(
  formId,
  migrations,
  prefill = false,
  prefillTransformer = null,
) {
  // TODO: Migrations currently aren’t sent; they’re taken from `form` in the
  //  redux store, but form.migrations doesn’t exist (nor should it, really)
  return (dispatch, getState) => {
    const trackingPrefix = getState().form.trackingPrefix;
    const apiUrl = inProgressApi(formId);

    // Update UI while we’re waiting for the API
    dispatch(setFetchFormPending(prefill));

    // Query the api and return a promise (for navigation / error handling afterward)
    return fetch(apiUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Key-Inflection': 'camel',
        'Source-App-Name': window.appName,
      },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }

        // Make me a switch?
        let status = LOAD_STATUSES.failure;
        if (res.status === 401) {
          dispatch(logOut());
          status = LOAD_STATUSES.noAuth;
        } else if (res.status === 403) {
          status = LOAD_STATUSES.forbidden;
        } else if (res.status === 404) {
          status = LOAD_STATUSES.notFound;
        }
        return Promise.reject(status);
      })
      .then(resBody => {
        // Just in case something funny happens where the json returned isn’t an object as expected
        // Unfortunately, JavaScript is quite fiddly here, so there has to be additional checks
        if (typeof resBody !== 'object' || Array.isArray(resBody) || !resBody) {
          return Promise.reject(LOAD_STATUSES.invalidData);
        }

        // If an empty object is returned, throw a not-found
        // TODO: When / if we return a 404 for applications that don’t exist, remove this
        if (Object.keys(resBody).length === 0) {
          return Promise.reject(LOAD_STATUSES.notFound);
        }

        // If we’ve made it this far, we’ve got valid form

        let formData;
        let metadata;
        try {
          const dataToMigrate = {
            formId,
            formData: resBody.formData,
            metadata: resBody.metadata,
          };

          ({ formData, metadata } = migrateFormData(dataToMigrate, migrations));

          let pages = getState().form.pages;
          if (metadata.prefill && prefillTransformer) {
            ({ formData, pages, metadata } = prefillTransformer(
              pages,
              formData,
              metadata,
              getState(),
            ));
          }

          dispatch(setInProgressForm({ formData, metadata }, pages));

          recordEvent({
            event: `${trackingPrefix}sip-form-loaded`,
          });

          return Promise.resolve();
        } catch (e) {
          // We don’t want to lose the stacktrace, but want to be able to search for migration errors
          // related to SiP
          Sentry.captureException(e);
          Sentry.withScope(scope => {
            scope.setExtra('metadata', resBody.metadata);
            Sentry.captureMessage('vets_sip_error_migration');
          });
          return Promise.reject(LOAD_STATUSES.invalidData);
        }
      })
      .catch(status => {
        let loadedStatus = status;
        if (status instanceof SyntaxError) {
          // if res.json() has a parsing error, it’ll reject with a SyntaxError
          Sentry.captureException(
            new Error(`vets_sip_error_server_json: ${status.message}`),
          );
          loadedStatus = LOAD_STATUSES.invalidData;
        } else if (status instanceof Error) {
          // If we’ve got an error that isn’t a SyntaxError, it’s probably a network error
          Sentry.captureException(status);
          Sentry.captureMessage('vets_sip_error_fetch');
          loadedStatus = LOAD_STATUSES.clientFailure;
        }

        // If prefilling went wrong for a non-auth reason, it probably means that
        // they didn’t have info to use and we can continue on as usual
        if (
          prefill &&
          loadedStatus !== LOAD_STATUSES.noAuth &&
          loadedStatus !== LOAD_STATUSES.forbidden
        ) {
          dispatch(setPrefillComplete());
          recordEvent({
            event: `${trackingPrefix}sip-form-prefill-failed`,
          });
        } else {
          // If we're in a noAuth status, users are sent to the error page
          // where they can sign in again. This isn't an error, it's expected
          // when a session expires
          if (loadedStatus === LOAD_STATUSES.noAuth) {
            recordEvent({
              event: `${trackingPrefix}sip-form-load-signed-out`,
            });
          } else {
            Sentry.captureMessage(`vets_sip_error_load: ${loadedStatus}`);
            recordEvent({
              event: `${trackingPrefix}sip-form-load-failed`,
            });
          }
          dispatch(setFetchFormStatus(loadedStatus));
        }
      });
  };
}

export function removeInProgressForm(formId, migrations, prefillTransformer) {
  return (dispatch, getState) => {
    const trackingPrefix = getState().form.trackingPrefix;

    // Update UI while we’re waiting for the API
    dispatch(setStartOver());

    return removeFormApi(formId)
      .catch(res => {
        // If there’s some error when deleting, there’s not much we can
        // do aside from not stop the user from continuing on
        if (res instanceof Error || res.status !== 401) {
          return Promise.resolve();
        }

        return Promise.reject(res);
      })
      .then(() => {
        recordEvent({
          event: `${trackingPrefix}sip-form-start-over`,
        });
        // This action removes the form from the profile list
        dispatch({ type: REMOVING_SAVED_FORM_SUCCESS, formId });
        // after deleting, go fetch prefill info if they’ve got it
        return dispatch(
          fetchInProgressForm(formId, migrations, true, prefillTransformer),
        );
      })
      .catch(() => {
        dispatch(logOut());
        dispatch(setFetchFormStatus(LOAD_STATUSES.noAuth));
      });
  };
}
