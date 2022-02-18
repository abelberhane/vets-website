import profile from '@@profile/reducers';
import { combineReducers } from 'redux';
import claimsAppeals from '~/applications/claims-status/reducers';
import prescriptions from './prescriptions';
import recipients from './recipients';
import folders from './folders';
import unreadCount from './unreadCount';
import appointments from '~/applications/personalization/appointments/reducers';
import { debtsReducer } from '~/applications/debt-letters/reducers';
import payments from '~/applications/disability-benefits/view-payments/reducers';

export default {
  ...claimsAppeals,
  ...profile,
  allPayments: payments.allPayments,
  allDebts: debtsReducer,
  health: combineReducers({
    appointments,
    rx: combineReducers({
      prescriptions,
    }),
    msg: combineReducers({
      unreadCount,
      recipients,
      folders,
    }),
  }),
};
