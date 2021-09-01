/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  'id',
  'name',
  'text',
  'color(id)',
]);

const ISSUE_PROJECT_FIELDS = toField([
  'shortName',
]);

const ISSUE_WORK_ITEMS_FIELDS = toField([
  '$type',
  'date',
  {
    type: ['id,name'],
    duration: ['presentation'],
  },
]);

const VCS_INTEGRATION_PROCESSOR_FIELDS = toField([
  '$type',
  'id',
]);

const PULL_REQUEST_FIELDS = toField([
  'id',
  'noUserReason(id)',
  'noHubUserReason(id)',
  'fetched',
  'files',
  'userName',
  'date',
  'fetched',
  'url',
  'text',
  'title',
  'idExternal',
  'user(@user)',
  'author(@user)',
]);

const VCS_INTEGRATION_FIELDS = toField([
  {
    commands: [
      'hasError',
      'errorText',
      'start',
      'end',
    ],
  },
  'created',
  'date',
  'fetched',
  'files',
  'id',
  'noHubUserReason(id)',
  'noUserReason(id)',
  'reopened',
  'state(id)',
  'user(@user)',
  'userName',
  'version',
  {
    processors: [VCS_INTEGRATION_PROCESSOR_FIELDS],
  },
  'urls',
]);

const ISSUE_ACTIVITIES_FIELDS = toField([
  'id',
  'timestamp',
  'targetMember',
  'targetSubMember',
  {
    authorGroup: ['icon', 'name'],
    author: ['@user'],
    category: ['id'],
    target: ['id', 'created', 'usesMarkdown'],
    field: [
      'linkId',
      'id',
      'presentation',
      {
        customField: [
          'id',
          {
            fieldType: [
              'isMultiValue',
              'valueType',
            ],
          },
        ],
      },
    ],
    pullRequest: PULL_REQUEST_FIELDS,
    added: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.issueComment,

      IssueFields.ISSUE_XSHORT_FIELDS,

      ISSUE_WORK_ITEMS_FIELDS,

      'reactionOrder',
      {
        reactions: [
          'id',
          'reaction',
          'author(@user)',
        ],
      },

      VCS_INTEGRATION_FIELDS,
    ],
    removed: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_REMOVED_FIELDS,

      IssueFields.ISSUE_XSHORT_FIELDS,
    ],
  },
]);


export const ISSUE_ATTACHMENT_FIELDS: Object = IssueFields.attachments;

export default (toField([
  {
    activities: ISSUE_ACTIVITIES_FIELDS,
  },
  'cursor',
  `till;@user:${IssueFields.ISSUE_USER_FIELDS}`,
]): any);
