import { LokAPIAbstract, e, t, RestExc } from '@lokavaluto/lokapi'
import { httpRequest as nodeHttpRequest } from '@0k/browser-request'
import { t as RequestTypes } from '@0k/types-request'


class LocalStore implements t.IPersistentStore {

  prefix: string

  constructor (prefix: string) {
    this.prefix = prefix
  }

  get (key: string, defaultValue?: string): string {
    const value = localStorage.getItem(`${this.prefix}${key}`)
    if (value === null) return defaultValue
    return value
  }

  set (key: string, value: string): void {
    localStorage.setItem(`${this.prefix}${key}`, value)
  }

  del (key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`)
  }
}


abstract class LokAPIBrowserAbstract extends LokAPIAbstract {

  persistentStore = new LocalStore("LokAPI")

  base64Encode = (s: string) => Buffer.from(s).toString('base64')

  httpRequest: RequestTypes.HttpRequest = nodeHttpRequest

}


export {
  LokAPIBrowserAbstract, e, t,
  RestExc,
  LocalStore
}
