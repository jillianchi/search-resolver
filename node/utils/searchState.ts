/**
 * Parse `searchState` string into a `object`.
 * We treat `searchState` as a stringified javascript object.
 * Parsing errors are returned as an empty object
 *
 * ```
 *       { location: "l:-1:1", utm_source: "xxx" }
 * ```
 * @private
 * @param {string} state
 * @returns {{ [key: string]: string }}
 * @memberof BiggySearchClient
 */
export const parseState = (state?: string): { [key: string]: string } => {
  if (!state) {
    return {}
  }

  try {
    const parsed = JSON.parse(decodeURI(state))
    if (typeof parsed === 'object') {
      return parsed
    }
  } catch (err) {
    /* ignore parsing errors */
  }

  return {}
}
