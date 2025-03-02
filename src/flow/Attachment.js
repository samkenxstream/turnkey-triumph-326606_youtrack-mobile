/* @flow */

import type {Visibility} from './Visibility';

export type Attachment = {
  filename?: string,
  path: string,
  mime: string,
  width: number,
  height: number,
}

export type NormalizedAttachment = {
  url: string,
  name: string,
  mimeType: string,
  dimensions: {
    width: number,
    height: number,
  },
  visibility?: Visibility,
}
