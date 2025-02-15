import _ from 'lodash';
import React from 'react';
import fullSchema from 'vets-json-schema/dist/22-0994-schema.json';
import oldBankAccountUI from 'platform/forms/definitions/bankAccount';
import ReviewCardField from 'platform/forms-system/src/js/components/ReviewCardField';
import environment from 'platform/utilities/environment';
import { isValidRoutingNumber } from 'platform/forms/validations';
import { hasNewBankInformation, hasPrefillBankInformation } from '../utils';
import PaymentView from '../components/PaymentView';
import PaymentReviewView from '../components/PaymentReviewView';

import {
  bankInfoDescriptionWithInfo,
  bankInfoDescriptionWithoutInfo,
  bankInfoNote,
  bankInfoHelpText,
} from '../content/bankInformation';

const { bankAccount } = fullSchema.properties;

const hasNewBankInfo = formData => {
  const bankAccountObj = _.get(formData['view:bankAccount'], 'bankAccount', {});
  return hasNewBankInformation(bankAccountObj);
};

const hasPrefillBankInfo = formData => {
  const bankAccountObj = _.get(formData, 'prefillBankAccount', {});
  return hasPrefillBankInformation(bankAccountObj);
};

const startInEdit = data =>
  !_.get(data, 'view:hasBankInformation', false) &&
  !hasNewBankInformation(data.bankAccount);

const isProduction = environment.isProduction();

const newItemName = isProduction ? 'account' : 'account information';

const directDepositDescription = formData => {
  return (
    <div className="vads-u-margin-top--2 vads-u-margin-bottom--2">
      <p>
        We make payments only through direct deposit, also called electronic
        funds transfer (EFT). Please provide your direct deposit information
        below. We’ll send your housing payment to this account.
      </p>
      <img
        src="/img/direct-deposit-check-guide.svg"
        alt="On a personal check, find your bank’s 9-digit routing number listed along the bottom-left edge, and your account number listed beside that."
      />
      {!environment.isProduction() &&
        hasPrefillBankInfo(formData) && (
          <p>
            This is the bank account information we have on file for you. We’ll
            send your housing payment to this account.
          </p>
        )}
    </div>
  );
};

function validateRoutingNumber(
  errors,
  routingNumber,
  formData,
  schema,
  errorMessages,
) {
  if (!isValidRoutingNumber(routingNumber)) {
    errors.addError(errorMessages.pattern);
  }
}

const newBankUiSchema = {
  'ui:order': ['accountType', 'routingNumber', 'accountNumber'],
  'ui:description': data => directDepositDescription(data),
  accountType: {
    'ui:title': 'Account type',
    'ui:widget': 'radio',
    'ui:options': {
      labels: {
        checking: 'Checking',
        savings: 'Savings',
      },
    },
  },
  accountNumber: {
    'ui:title': 'Bank account number',
    'ui:errorMessages': {
      pattern: 'Please enter a valid account number',
      required: 'Please enter a bank account number',
    },
  },
  routingNumber: {
    'ui:title': 'Bank’s 9 digit routing number',
    'ui:validations': [validateRoutingNumber],
    'ui:errorMessages': {
      pattern: 'Please enter a valid 9 digit routing number',
      required: 'Please enter a routing number',
    },
  },
};

const bankAccountUI = isProduction ? oldBankAccountUI : newBankUiSchema;

export const uiSchema = {
  'ui:title': 'Direct deposit information',
  'view:descriptionWithInfo': {
    'ui:description': bankInfoDescriptionWithInfo,
    'ui:options': {
      hideIf: data => !hasPrefillBankInfo(data) && !hasNewBankInfo(data),
    },
  },
  'view:descriptionWithoutInfo': {
    'ui:description': bankInfoDescriptionWithoutInfo,
    'ui:options': {
      hideIf: data => hasPrefillBankInfo(data) || hasNewBankInfo(data),
    },
  },
  'view:bankAccount': {
    'ui:field': ReviewCardField,
    'ui:options': {
      viewComponent: PaymentView,
      reviewTitle: 'Payment information',
      editTitle: 'Update bank account',
      itemName: newItemName,
      itemNameAction: 'Update',
      startInEdit,
      volatileData: true,
    },
    saveClickTrackEvent: { event: 'edu-0994-bank-account-saved' },
    bankAccount: {
      ...bankAccountUI,
      accountType: {
        ...bankAccountUI.accountType,
        'ui:reviewWidget': PaymentReviewView,
        'ui:errorMessages': {
          required: 'Please choose an account type',
        },
      },
      accountNumber: {
        ...bankAccountUI.accountNumber,
        'ui:reviewWidget': PaymentReviewView,
        'ui:errorMessages': {
          required: 'Please provide a bank account number',
          pattern: 'Please enter a valid account number',
        },
      },
      routingNumber: {
        ...bankAccountUI.routingNumber,
        'ui:reviewWidget': PaymentReviewView,
        'ui:errorMessages': {
          required: 'Please provide a bank routing number',
          pattern: 'Please enter a valid routing number',
        },
      },
    },
  },
  'view:bankInfoNote': {
    'ui:description': bankInfoNote,
  },
  'view:bankInfoHelpText': {
    'ui:description': bankInfoHelpText,
  },
};

export const schema = {
  type: 'object',
  properties: {
    'view:descriptionWithInfo': {
      type: 'object',
      properties: {},
    },
    'view:descriptionWithoutInfo': {
      type: 'object',
      properties: {},
    },
    'view:bankAccount': {
      type: 'object',
      properties: { bankAccount },
    },
    'view:bankInfoNote': {
      type: 'object',
      properties: {},
    },
    'view:bankInfoHelpText': {
      type: 'object',
      properties: {},
    },
  },
};
