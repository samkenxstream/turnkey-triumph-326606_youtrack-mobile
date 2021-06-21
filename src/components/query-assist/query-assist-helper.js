/* @flow */

import log from '../log/log';
import {checkVersion} from '../feature/feature';
import {getStorageState} from '../storage/storage';
import {until} from '../../util/util';

import type Api from '../api/api';
import type {Folder} from '../../flow/User';
import type {TransformedSuggestion} from '../../flow/Issue';

type CachedQueries = {
  id: string,
  name: string,
  query: string,
};

export function getCachedUserQueries(): Array<CachedQueries> {
  return (getStorageState().lastQueries || []).map(
    (query: string, index: number) => ({
      id: `lastQueries-${index}`,
      name: query,
      query,
    }));
}

export const getAssistSuggestions = async (
  api: Api,
  query: string,
  caret: number,
): Promise<Array<TransformedSuggestion>> => {
  let suggestions: Array<{ title: string | null, data: Array<TransformedSuggestion> }> = [{title: null, data: []}];
  const folder: Folder | null = getStorageState().searchContext || null;
  const promise: Promise<Array<TransformedSuggestion>> = (
    checkVersion('2020.1')
      ? api.getQueryAssistSuggestions(query, caret, folder && folder.id ? [folder] : null)
      : api.getQueryAssistSuggestionsLegacy(query, caret)
  );
  const [error, assistSuggestions] = await until(promise);

  if (error) {
    log.warn('Failed loading assist suggestions');
  } else {
    suggestions = [{
      title: null,
      data: assistSuggestions,
    }];

    const cachedUserQueries: Array<CachedQueries> = getCachedUserQueries();
    if (cachedUserQueries.length) {
      suggestions.push({
        title: 'Recent searches',
        data: cachedUserQueries,
      });
    }
  }
  return suggestions;
};
