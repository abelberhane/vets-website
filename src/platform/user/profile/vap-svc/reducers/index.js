import {
  UPDATE_PROFILE_FORM_FIELD,
  OPEN_MODAL,
  VAP_SERVICE_CLEAR_LAST_SAVED,
  VAP_SERVICE_TRANSACTIONS_FETCH_SUCCESS,
  VAP_SERVICE_TRANSACTION_REQUESTED,
  VAP_SERVICE_TRANSACTION_REQUEST_SUCCEEDED,
  VAP_SERVICE_TRANSACTION_REQUEST_FAILED,
  VAP_SERVICE_TRANSACTION_UPDATED,
  VAP_SERVICE_TRANSACTION_CLEARED,
  VAP_SERVICE_TRANSACTION_REQUEST_CLEARED,
  VAP_SERVICE_TRANSACTION_UPDATE_REQUESTED,
  VAP_SERVICE_TRANSACTION_UPDATE_FAILED,
  ADDRESS_VALIDATION_CONFIRM,
  ADDRESS_VALIDATION_ERROR,
  ADDRESS_VALIDATION_RESET,
  UPDATE_SELECTED_ADDRESS,
  ADDRESS_VALIDATION_INITIALIZE,
  ADDRESS_VALIDATION_UPDATE,
} from '../actions';

import { isEmpty, isEqual, pickBy } from 'lodash';

import { isFailedTransaction } from '../util/transactions';

const initialAddressValidationState = {
  addressValidationType: '',
  suggestedAddresses: [],
  confirmedSuggestions: [],
  addressFromUser: {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    stateCode: '',
    zipCode: '',
    countryCodeIso3: '',
  },
  addressValidationError: false,
  validationKey: null,
  selectedAddress: {},
  selectedAddressId: null,
};

const initialState = {
  hasUnsavedEdits: false,
  initialFormFields: {},
  modal: null,
  modalData: null,
  formFields: {},
  transactions: [],
  fieldTransactionMap: {},
  transactionsAwaitingUpdate: [],
  metadata: {
    mostRecentErroredTransactionId: '',
  },
  addressValidation: {
    ...initialAddressValidationState,
  },
};

export default function vapService(state = initialState, action) {
  switch (action.type) {
    case VAP_SERVICE_TRANSACTIONS_FETCH_SUCCESS: {
      const transactions = action.data.map(transactionData =>
        // Wrap in a "data" property to imitate the API response for a single transaction
        ({ data: transactionData }),
      );
      return {
        ...state,
        transactions,
      };
    }

    case VAP_SERVICE_TRANSACTION_REQUESTED:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: { isPending: true, method: action.method },
        },
      };

    case VAP_SERVICE_TRANSACTION_REQUEST_FAILED:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            ...state.fieldTransactionMap[action.fieldName],
            isPending: false,
            isFailed: true,
            error: action.error,
          },
        },
      };

    case VAP_SERVICE_TRANSACTION_REQUEST_SUCCEEDED: {
      return {
        ...state,
        transactions: state.transactions.concat(action.transaction),
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            ...state.fieldTransactionMap[action.fieldName],
            isPending: false,
            transactionId: action.transaction.data.attributes.transactionId,
          },
        },
        initialFormFields: {},
        hasUnsavedEdits: false,
      };
    }

    case VAP_SERVICE_TRANSACTION_UPDATE_REQUESTED: {
      const { transactionId } = action.transaction.data.attributes;
      return {
        ...state,
        transactionsAwaitingUpdate: state.transactionsAwaitingUpdate.concat(
          transactionId,
        ),
      };
    }

    case VAP_SERVICE_TRANSACTION_UPDATED: {
      const { transaction } = action;
      const {
        transactionId: updatedTransactionId,
      } = transaction.data.attributes;

      const metadata = { ...state.metadata };
      if (isFailedTransaction(transaction)) {
        metadata.mostRecentErroredTransactionId = updatedTransactionId;
      }

      return {
        ...state,
        metadata,
        transactionsAwaitingUpdate: state.transactionsAwaitingUpdate.filter(
          tid => tid !== updatedTransactionId,
        ),
        transactions: state.transactions.map(
          t =>
            t.data.attributes.transactionId === updatedTransactionId
              ? transaction
              : t,
        ),
      };
    }

    case VAP_SERVICE_TRANSACTION_UPDATE_FAILED: {
      const { transactionId } = action.transaction.data.attributes;
      return {
        ...state,
        transactionsAwaitingUpdate: state.transactionsAwaitingUpdate.filter(
          tid => tid !== transactionId,
        ),
      };
    }

    case VAP_SERVICE_CLEAR_LAST_SAVED: {
      return {
        ...state,
        mostRecentlySavedField: null,
      };
    }

    case VAP_SERVICE_TRANSACTION_CLEARED: {
      const finishedTransactionId =
        action.transaction.data.attributes.transactionId;
      const fieldTransactionMap = { ...state.fieldTransactionMap };

      let mostRecentlySavedField;

      Object.keys(fieldTransactionMap).forEach(field => {
        const transactionRequest = fieldTransactionMap[field];
        if (
          transactionRequest &&
          transactionRequest.transactionId === finishedTransactionId
        ) {
          delete fieldTransactionMap[field];
          mostRecentlySavedField = field;
        }
      });

      const metadata = { ...state.metadata };
      if (metadata.mostRecentErroredTransactionId === finishedTransactionId) {
        metadata.mostRecentErroredTransactionId = null;
      }

      return {
        ...state,
        metadata,
        transactions: state.transactions.filter(
          t => t.data.attributes.transactionId !== finishedTransactionId,
        ),
        modal: null,
        fieldTransactionMap,
        mostRecentlySavedField,
      };
    }

    case VAP_SERVICE_TRANSACTION_REQUEST_CLEARED: {
      const fieldTransactionMap = { ...state.fieldTransactionMap };
      delete fieldTransactionMap[action.fieldName];

      return {
        ...state,
        fieldTransactionMap,
      };
    }

    case UPDATE_PROFILE_FORM_FIELD: {
      const formFields = {
        ...state.formFields,
        [action.field]: action.newState,
      };

      // The action gets fired upon initial opening of the edit modal
      // We only want to capture initialFormFields once, it should not update
      const initialFormFields = isEmpty(state.initialFormFields)
        ? formFields
        : state.initialFormFields;

      const modalName = state?.modal;
      let formFieldValues = formFields[modalName]?.value;

      // Initial form fields does not have 'view' properties, those get added to formFields
      // After editing a field. So we need to strip of those 'view' fields to be able to compare
      formFieldValues = pickBy(formFieldValues, value => value !== undefined);
      formFieldValues = pickBy(
        formFieldValues,
        (value, key) => !key.startsWith('view:'),
      );

      const initialFormFieldValues = pickBy(
        state.initialFormFields[modalName]?.value,
        (value, key) => !key.startsWith('view:'),
      );

      const hasUnsavedEdits =
        !isEmpty(initialFormFieldValues) &&
        !isEqual(formFieldValues, initialFormFieldValues);

      return {
        ...state,
        formFields,
        hasUnsavedEdits,
        initialFormFields,
      };
    }

    case OPEN_MODAL:
      return {
        ...state,
        modal: action.modal,
        modalData: action.modalData,
        hasUnsavedEdits: false,
        initialFormFields: {},
        mostRecentlySavedField: null,
      };

    case ADDRESS_VALIDATION_INITIALIZE:
      return {
        ...state,
        addressValidation: {
          ...initialAddressValidationState,
        },
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: { isPending: true },
        },
      };

    case ADDRESS_VALIDATION_CONFIRM:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.addressValidationType]: { isPending: false },
        },
        addressValidation: {
          ...state.addressValidation,
          addressFromUser: action.addressFromUser,
          addressValidationType: action.addressValidationType,
          suggestedAddresses: action.suggestedAddresses,
          validationKey: action.validationKey,
          selectedAddress: action.selectedAddress,
          selectedAddressId: action.selectedAddressId,
          confirmedSuggestions: action.confirmedSuggestions,
          addressValidationError: false,
        },
        modal: 'addressValidation',
      };

    case ADDRESS_VALIDATION_ERROR:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: {
            ...state.fieldTransactionMap[action.fieldName],
            isPending: false,
            isFailed: true,
            error: action.error,
          },
        },
        addressValidation: {
          ...initialAddressValidationState,
          addressValidationError: action.addressValidationError,
          addressValidationType: action.fieldName,
          validationKey: action.validationKey || null,
          addressFromUser: action.addressFromUser,
        },
        modal: action.fieldName,
      };

    case ADDRESS_VALIDATION_RESET:
      return {
        ...state,
        addressValidation: { ...initialAddressValidationState },
      };

    case ADDRESS_VALIDATION_UPDATE:
      return {
        ...state,
        fieldTransactionMap: {
          ...state.fieldTransactionMap,
          [action.fieldName]: { isPending: true },
        },
      };

    case UPDATE_SELECTED_ADDRESS:
      return {
        ...state,
        addressValidation: {
          ...state.addressValidation,
          selectedAddress: action.selectedAddress,
          selectedAddressId: action.selectedAddressId,
        },
      };

    default:
      return state;
  }
}
