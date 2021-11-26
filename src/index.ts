import http from 'http'
import https from 'https'

import { LokAPIAbstract, e, t, RestExc } from '@lokavaluto/lokapi'


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


const requesters: any = { http, https }


abstract class LokAPIBrowserAbstract extends LokAPIAbstract {

  persistentStore = new LocalStore("LokAPI")

  base64Encode = (s: string) => Buffer.from(s).toString('base64')

  httpRequest = (opts: t.coreHttpOpts) => {
    const httpsOpts = {
      host: opts.host,
      path: opts.path,
      method: opts.method,
      ...opts.headers && { headers: opts.headers },
      ...opts.port && { port: opts.port }
    }
    const requester = requesters[opts.protocol]
    if (!requester) {
      throw new Error(`Protocol ${opts.protocol} unsupported by this implementation`)
    }
    return new Promise((resolve, reject) => {
      let req = requester.request(httpsOpts, (res: any) => {
        const { statusCode } = res
        let rawData = ''

        res.on('data', (chunk: any) => { rawData += chunk })
        res.on('end', () => {
          if (!statusCode || statusCode.toString().slice(0, 1) !== '2') {
            res.resume()
            reject(new RestExc.HttpError(statusCode, res.statusMessage, rawData, res))
            return
          } else {
            if (opts.responseHeaders) {
              for (const header in res.headers) {
                opts.responseHeaders[header] = res.headers[header]
              }
            }
            resolve(rawData)
          }
        })
      })

      if (opts.data) {
        if (typeof opts.data !== "string")
          opts.data = JSON.stringify(opts.data)
        req.write(opts.data)
      }
      req.end()

      req.on('error', (err: any) => {
        console.error(`Encountered an error trying to make a request: ${err.message}`)
        reject(new RestExc.RequestFailed(err.message))
      })
    })
  }
}


export { LokAPIBrowserAbstract, e, t, RestExc }
