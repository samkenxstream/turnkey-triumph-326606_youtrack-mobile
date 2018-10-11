/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './inbox-action-types';

export type InboxState = {
  loading: boolean,
  inbox: Array<Object>
};

const initialState: InboxState = {
  loading: false,
  inbox: []
};

export default createReducer(initialState, {
  [types.SET_INBOX_LOADING](state, {loading}): InboxState {
    return {...state, loading};
  },

  [types.UPDATE_INBOX](state, {inbox}): InboxState {
    return {...state, inbox};
  }
});
