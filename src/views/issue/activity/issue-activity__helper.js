/* @flow */

import {ActivityCategory} from 'components/activity/activity__category';
import {checkVersion} from 'components/feature/feature';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {getActivityAllTypes} from 'components/activity/activity-helper';

import type {ActivityType} from 'flow/Activity';
import type {StorageState} from 'components/storage/storage';

export function isIssueActivitiesAPIEnabled(): any {
  return checkVersion('2018.3');
}

export function getIssueActivitiesEnabledTypes(): Array<ActivityType> {
  let enabledTypes: Array<ActivityType> = getStorageState().issueActivitiesEnabledTypes || [];
  const activityAllTypes: Array<ActivityType> = getActivityAllTypes();
  if (!enabledTypes.length) {
    enabledTypes = activityAllTypes;
    saveIssueActivityEnabledTypes(enabledTypes);
  }
  if (!getStorageState().vcsChanges && !enabledTypes.find(
    (it: ActivityType) => it.id === ActivityCategory.Source?.VCS_ITEM
  )) {
    const vcs: ?ActivityType = activityAllTypes.find((it: ActivityType) => it.id === ActivityCategory.Source?.VCS_ITEM);
    vcs && enabledTypes.push(vcs);
    flushStoragePart({vcsChanges: true});
  }
  return enabledTypes;
}

export function saveIssueActivityEnabledTypes(enabledTypes: Array<ActivityType>) {
  enabledTypes && flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

export async function toggleIssueActivityEnabledType(type: ActivityType, enable: boolean): Promise<StorageState> {
  let enabledTypes: Array<ActivityType> = getIssueActivitiesEnabledTypes();

  if (enable) {
    enabledTypes.push(type);
  } else {
    enabledTypes = enabledTypes.filter(it => it.id !== type.id);
  }

  return flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

