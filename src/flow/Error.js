/* @flow */

export type CustomError = Error & {
  json: Object,
  status: number,
  error?: string,
  error_message: string,
  error_description: string,
  error_children: Array<{ error: string }>,
  body: string,
  bodyText: string,
  _bodyText: string,
  isIncompatibleYouTrackError: boolean,
  localizedDescription?: string
};

export type HTTPResponse = {
  headers: HTTPHeaders,
  ok: boolean,
  status: number,
  statusText: string,
  type: string,
  url: string,
  _bodyInit?: string,
  _bodyText: string,
  json: () => Object,
}

export type HTTPHeaders = {
    map: {
      'access-control-expose-headers': string,
      'cache-control': string,
      'content-encoding': string,
      'content-length': string,
      'content-type': string,
      'date': string,
      'referrer-policy': string,
      'server': string,
      'status': string,
      'strict-transport-security': string,
      'vary': string,
      'x-content-type-options': string,
      'x-frame-options': string,
      'x-xss-protection': string,
  }
};

export type ErrorMessageData = {
  title: string,
  description?: ?string,
  icon?: Object,
  iconSize?: number
}
