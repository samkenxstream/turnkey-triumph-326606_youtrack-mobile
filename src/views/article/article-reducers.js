/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';
import {ON_NAVIGATE_BACK} from 'actions/action-types';
import {routeMap} from '../../app-routes';

import type {ActivityItem} from 'flow/Activity';
import type {Article, ArticlesList} from 'flow/Article';
import type {CustomError} from 'flow/Error';
import type {IssueComment} from 'flow/CustomFields';

export type ArticleState = {
  activityPage: Array<ActivityItem> | null,
  article: Article,
  articleCommentDraft: IssueComment | null,
  articlesList: ArticlesList,
  error: CustomError,
  isLoading: boolean,
  isProcessing: boolean,
  issuePermissions: IssuePermissions,
  prevArticleState: ?ArticleState
};

export const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  articleCommentDraft: null,
  articlesList: [],
  error: null,
  isLoading: false,
  isProcessing: false,
  issuePermissions: issuePermissionsNull,
  prevArticleState: null,
};

const {reducer, actions} = (createSlice({
  name: 'article',
  initialState: articleInitialState,
  reducers: {
    setLoading(state: ArticleState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setProcessing(state: ArticleState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state: ArticleState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setArticle(state: ArticleState, action: PayloadAction<Article>) {
      state.article = action.payload;
    },
    setActivityPage(state: ArticleState, action: PayloadAction<Array<ActivityItem>>) {
      state.activityPage = action.payload;
    },
    setPrevArticle(state: ArticleState, action: PayloadAction<ArticleState>) {
      state.prevArticleState = action.payload;
    },
    setArticleCommentDraft(state: ArticleState, action: PayloadAction<Article>) {
      state.articleCommentDraft = action.payload;
    },
  },
  extraReducers: {
    [ON_NAVIGATE_BACK]: (
      state: ArticleState,
      action: { closingView: { routeName: string, params: { articlePlaceholder: Article } } }
    ): ArticleState => {
      if (action.closingView.routeName === routeMap.Article) {
        return state.prevArticleState ? state.prevArticleState : articleInitialState;
      }
      return state;
    },
  },
}): any);


export const {
  setLoading,
  setError,
  setArticle,
  setActivityPage,
  setProcessing,
  setPrevArticle,
  setArticleCommentDraft,
} = actions;

export default reducer;
