import { expect } from 'chai';
import * as selectors from '../selectors';

import mockPersonalInformationSuccessEnhanced from './fixtures/personal-information-success-enhanced.json';

const personalInformation =
  mockPersonalInformationSuccessEnhanced.data.attributes;

const getDirectDepositInfoError = {
  errors: [
    {
      title: 'Bad Gateway',
      detail: 'Received an an invalid response from the upstream server',
      code: 'EVSS502',
      source: 'EVSS::PPIU::Service',
      status: '502',
    },
  ],
};

const errors = [{ name: 'error1' }, { name: 'error2' }];

describe('profile selectors', () => {
  describe('cnpDirectDepositIsSetUp selector', () => {
    let state;
    beforeEach(() => {
      state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                paymentAccount: {
                  accountType: '',
                  financialInstitutionName: null,
                  accountNumber: '123123123',
                  financialInstitutionRoutingNumber: '',
                },
              },
            ],
          },
        },
      };
    });
    it('returns `true` if there is an account number set in state', () => {
      expect(selectors.cnpDirectDepositIsSetUp(state)).to.be.true;
    });
    it('returns `false` when vaProfile does not exist on state', () => {
      delete state.vaProfile;
      expect(selectors.cnpDirectDepositIsSetUp(state)).to.be.false;
    });
    it('returns `false` when vaProfile.cnpPaymentInformation is not set on state', () => {
      delete state.vaProfile.cnpPaymentInformation;
      expect(selectors.cnpDirectDepositIsSetUp(state)).to.be.false;
    });
    it('returns `false` when the account number is not set', () => {
      state.vaProfile.cnpPaymentInformation.responses[0].paymentAccount.accountNumber =
        '';
      expect(selectors.cnpDirectDepositIsSetUp(state)).to.be.false;
    });
    it('returns `false` when the payment info endpoint failed to get data', () => {
      state = {
        vaProfile: {
          cnpPaymentInformation: {
            error: getDirectDepositInfoError,
          },
        },
      };
      expect(selectors.cnpDirectDepositIsSetUp(state)).to.be.false;
    });
  });

  describe('cnpDirectDepositLoadError', () => {
    it('returns the error if there is one', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            error: getDirectDepositInfoError,
          },
        },
      };
      expect(selectors.cnpDirectDepositLoadError(state)).to.deep.equal(
        getDirectDepositInfoError,
      );
    });
    it('returns undefined if there are no errors', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                paymentAccount: {
                  accountType: '',
                  financialInstitutionName: null,
                  accountNumber: '123123123',
                  financialInstitutionRoutingNumber: '',
                },
              },
            ],
          },
        },
      };
      expect(selectors.cnpDirectDepositLoadError(state)).to.be.undefined;
    });
    it('returns undefined if payment info does not exist on the state', () => {
      let state = {};
      expect(selectors.cnpDirectDepositLoadError(state)).to.be.undefined;
      state = { vaProfile: {} };
      expect(selectors.cnpDirectDepositLoadError(state)).to.be.undefined;
    });
  });

  describe('cnpDirectDepositAddressIsSetUp selector', () => {
    let state;
    beforeEach(() => {
      state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                paymentAddress: {
                  addressOne: '123 Main',
                  city: 'San Francisco',
                  stateCode: 'CA',
                },
              },
            ],
          },
        },
      };
    });
    it('returns `true` if there is a street, city, and state set on the payment info payment address', () => {
      expect(selectors.cnpDirectDepositAddressIsSetUp(state)).to.be.true;
    });
    it('returns `false` if the street address is missing', () => {
      state.vaProfile.cnpPaymentInformation.responses[0].paymentAddress.addressOne =
        '';
      expect(selectors.cnpDirectDepositAddressIsSetUp(state)).to.be.false;
    });
    it('returns `false` if the city is missing', () => {
      state.vaProfile.cnpPaymentInformation.responses[0].paymentAddress.city =
        '';
      expect(selectors.cnpDirectDepositAddressIsSetUp(state)).to.be.false;
    });
    it('returns `false` if the state is missing', () => {
      state.vaProfile.cnpPaymentInformation.responses[0].paymentAddress.stateCode =
        '';
      expect(selectors.cnpDirectDepositAddressIsSetUp(state)).to.be.false;
    });

    it('returns `false` when the payment info endpoint failed to get data', () => {
      state = {
        vaProfile: {
          cnpPaymentInformation: {
            error: getDirectDepositInfoError,
          },
        },
      };
      expect(selectors.cnpDirectDepositAddressIsSetUp(state)).to.be.false;
    });
  });

  describe('cnpDirectDepositIsBlocked', () => {
    it('returns `false` if the isCompetentIndicator, noFiduciaryAssignedIndicator, and notDeceasedIndicator flags are all `true`', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                controlInformation: {
                  isCompetentIndicator: true,
                  noFiduciaryAssignedIndicator: true,
                  notDeceasedIndicator: true,
                },
              },
            ],
          },
        },
      };
      expect(selectors.cnpDirectDepositIsBlocked(state)).to.be.false;
    });
    it('returns `false` if the control information is not set', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [{ cnpPaymentInformation: {} }],
          },
        },
      };
      expect(selectors.cnpDirectDepositIsBlocked(state)).to.be.false;
    });
    it('returns `true` if the `isCompetentIndicator` is not true', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                controlInformation: {
                  isCompetentIndicator: null,
                  noFiduciaryAssignedIndicator: true,
                },
              },
            ],
          },
        },
      };
      expect(selectors.cnpDirectDepositIsBlocked(state)).to.be.true;
    });
    it('returns `true` if the `noFiduciaryAssignedIndicator` is not true', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                controlInformation: {
                  isCompetentIndicator: true,
                },
              },
            ],
          },
        },
      };
      expect(selectors.cnpDirectDepositIsBlocked(state)).to.be.true;
    });
    it('returns `true` if the `notDeceasedIndicator` is not true', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformation: {
            responses: [
              {
                controlInformation: {
                  isCompetentIndicator: true,
                  noFiduciaryAssignedIndicator: true,
                },
              },
            ],
          },
        },
      };
      expect(selectors.cnpDirectDepositIsBlocked(state)).to.be.true;
    });
  });

  describe('cnpDirectDepositUiState', () => {
    it('should return the correct part of the state`', () => {
      const state = {
        vaProfile: {
          cnpPaymentInformationUiState: {},
        },
      };
      expect(selectors.cnpDirectDepositUiState(state)).to.deep.equal(
        state.vaProfile.cnpPaymentInformationUiState,
      );
    });
    it('should return undefined if vaProfile is not set on the state', () => {
      const state = {};
      expect(selectors.cnpDirectDepositUiState(state)).to.equal(undefined);
    });
  });

  describe('eduDirectDepositInformation', () => {
    it('should return the correct part of the state', () => {
      const paymentInformation = {
        accountNumber: null,
        routingNumber: null,
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: paymentInformation,
        },
      };

      expect(selectors.eduDirectDepositInformation(state)).to.deep.equal(
        paymentInformation,
      );
    });
  });

  describe('eduDirectDepositUiState', () => {
    it('should return the correct part of the state', () => {
      const uiState = {
        foo: 'bar',
      };
      const state = {
        vaProfile: {
          eduPaymentInformationUiState: uiState,
        },
      };

      expect(selectors.eduDirectDepositUiState(state)).to.deep.equal(uiState);
    });
  });

  describe('eduDirectDepositAccountInformation', () => {
    it('should return the correct part of the state', () => {
      const accountInfo = {
        accountNumber: null,
        routingNumber: null,
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            paymentAccount: accountInfo,
          },
        },
      };

      expect(selectors.eduDirectDepositAccountInformation(state)).to.deep.equal(
        accountInfo,
      );
    });
  });

  describe('eduDirectDepositIsSetUp', () => {
    it('returns `true` when an account number is set', () => {
      const accountInfo = {
        accountNumber: '123',
        routingNumber: '456',
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            paymentAccount: accountInfo,
          },
        },
      };

      expect(selectors.eduDirectDepositIsSetUp(state)).to.be.true;
    });

    it('returns `false` when an account number is not set', () => {
      const accountInfo = {
        accountNumber: null,
        routingNumber: null,
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            paymentAccount: accountInfo,
          },
        },
      };

      expect(selectors.eduDirectDepositIsSetUp(state)).to.be.false;
    });
  });

  describe('eduDirectDepositLoadError', () => {
    it('returns any non-403 errors that exist', () => {
      const error = {
        errors: [
          {
            code: '401',
          },
        ],
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            error,
          },
        },
      };

      expect(selectors.eduDirectDepositLoadError(state)).to.deep.equal(error);

      state.vaProfile.eduPaymentInformation.error.errors.push({
        code: '403',
      });

      expect(selectors.eduDirectDepositLoadError(state)).to.deep.equal(error);
    });
    it('returns the error if it is not an object with an errors array', () => {
      const error = {
        code: '500',
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            error,
          },
        },
      };
      expect(selectors.eduDirectDepositLoadError(state)).to.deep.equal(error);
    });
    it('returns undefined if the error data only contains 403 errors', () => {
      const error = {
        errors: [
          {
            code: '403',
          },
        ],
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            error,
          },
        },
      };

      expect(selectors.eduDirectDepositLoadError(state)).to.be.undefined;

      state.vaProfile.eduPaymentInformation.error.errors.push({
        code: '403',
      });

      expect(selectors.eduDirectDepositLoadError(state)).to.be.undefined;
    });

    it('returns `undefined` when there is no error', () => {
      const accountInfo = {
        accountNumber: null,
        routingNumber: null,
      };
      const state = {
        vaProfile: {
          eduPaymentInformation: {
            paymentAccount: accountInfo,
          },
        },
      };

      expect(selectors.eduDirectDepositLoadError(state)).to.be.undefined;
    });
  });

  describe('fullNameLoadError', () => {
    it('should return the error data if it exists', () => {
      const state = {
        vaProfile: {
          hero: {
            errors,
          },
        },
      };
      expect(selectors.fullNameLoadError(state)).to.deep.equal(errors);
    });
    it('should return undefined if there are no errors', () => {
      const state = {
        vaProfile: {
          hero: {},
        },
      };
      expect(selectors.fullNameLoadError(state)).to.be.undefined;
    });
    it('should return undefined if hero info does not exist on the state', () => {
      let state = {};
      expect(selectors.fullNameLoadError(state)).to.be.undefined;
      state = { vaProfile: {} };
      expect(selectors.fullNameLoadError(state)).to.be.undefined;
    });
  });

  describe('personalInformationLoadError', () => {
    it('should return the error data if it exists', () => {
      const state = {
        vaProfile: {
          personalInformation: {
            errors,
          },
        },
      };
      expect(selectors.personalInformationLoadError(state)).to.deep.equal(
        errors,
      );
    });
    it('should return undefined if there are no errors', () => {
      const state = {
        vaProfile: {
          personalInformation: {},
        },
      };
      expect(selectors.personalInformationLoadError(state)).to.be.undefined;
    });
    it('should return undefined if personalInformation info does not exist on the state', () => {
      let state = {};
      expect(selectors.personalInformationLoadError(state)).to.be.undefined;
      state = { vaProfile: {} };
      expect(selectors.personalInformationLoadError(state)).to.be.undefined;
    });
  });

  describe('militaryInformationLoadError', () => {
    it('should return the error data if it exists', () => {
      const state = {
        vaProfile: {
          militaryInformation: {
            serviceHistory: {
              error: errors,
            },
          },
        },
      };
      expect(selectors.militaryInformationLoadError(state)).to.deep.equal(
        errors,
      );
    });
    it('should return undefined if there are no errors', () => {
      const state = {
        vaProfile: {
          militaryInformation: {
            serviceHistory: {},
          },
        },
      };
      expect(selectors.militaryInformationLoadError(state)).to.be.undefined;
    });
    it('should return undefined if militaryInformation info does not exist on the state', () => {
      let state = {};
      expect(selectors.militaryInformationLoadError(state)).to.be.undefined;
      state = { vaProfile: {} };
      expect(selectors.militaryInformationLoadError(state)).to.be.undefined;
    });
  });
});

describe('selectVAProfilePersonalInformation selector', () => {
  let state;
  beforeEach(() => {
    state = {
      vaProfile: {
        personalInformation,
      },
    };
  });
  it('returns preferredName', () => {
    expect(
      selectors.selectVAProfilePersonalInformation(state, 'preferredName'),
    ).to.deep.equal({
      preferredName: 'Wes',
    });
  });

  it('returns genderIdentity', () => {
    expect(
      selectors.selectVAProfilePersonalInformation(state, 'genderIdentity'),
    ).to.deep.equal({
      genderIdentity: ['man'],
    });
  });

  it('returns pronouns and pronounsNotListedText', () => {
    expect(
      selectors.selectVAProfilePersonalInformation(state, 'pronouns'),
    ).to.deep.equal({
      pronouns: ['heHimHis', 'theyThemTheirs'],
      pronounsNotListedText: 'Other/pronouns/here',
    });
  });

  it('returns sexualOrientation and sexualOrientationNotListedText', () => {
    expect(
      selectors.selectVAProfilePersonalInformation(state, 'sexualOrientation'),
    ).to.deep.equal({
      sexualOrientation: ['straightOrHeterosexual'],
      sexualOrientationNotListedText: 'Some other orientation',
    });
  });
});
