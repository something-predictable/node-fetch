// Based on https://github.com/nodejs/undici/blob/87fa73498d6014a33989179cfaa4347dcb29600f/types/fetch.d.ts (MIT license)

import type { Blob } from 'node:buffer'
import type { Agent } from 'node:https'
import type { URL, URLSearchParams } from 'node:url'
import type { ReadableStream } from 'stream/web'
import Dispatcher from './dispatcher.js'
import type { FormData } from './formData.js'

export type RequestInfo = string | URL | Request

export declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>

export type BodyInit =
    | ArrayBuffer
    | AsyncIterable<Uint8Array>
    | Blob
    | FormData
    | Iterable<Uint8Array>
    | NodeJS.ArrayBufferView
    | URLSearchParams
    | null
    | string

export type BodyMixin = {
    readonly body: ReadableStream | null
    readonly bodyUsed: boolean

    readonly arrayBuffer: () => Promise<ArrayBuffer>
    readonly blob: () => Promise<Blob>
    readonly formData: () => Promise<FormData>
    readonly json: () => Promise<unknown>
    readonly text: () => Promise<string>
}

type SpecIterator<T, TReturn = unknown, TNext = undefined> = {
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>
}

type SpecIterableIterator<T> = {
    [Symbol.iterator](): SpecIterableIterator<T>
} & SpecIterator<T>

type SpecIterable<T> = {
    [Symbol.iterator](): SpecIterator<T>
}

export type HeadersInit = string[][] | { [key: string]: string | readonly string[] } | Headers

export declare class Headers implements SpecIterable<[string, string]> {
    constructor(init?: HeadersInit)
    readonly append: (name: string, value: string) => void
    readonly delete: (name: string) => void
    readonly get: (name: string) => string | null
    readonly has: (name: string) => boolean
    readonly set: (name: string, value: string) => void
    readonly getSetCookie: () => string[]
    readonly forEach: (
        callbackfn: (value: string, key: string, iterable: Headers) => void,
        thisArg?: unknown,
    ) => void

    readonly keys: () => SpecIterableIterator<string>
    readonly values: () => SpecIterableIterator<string>
    readonly entries: () => SpecIterableIterator<[string, string]>;
    readonly [Symbol.iterator]: () => SpecIterator<[string, string]>
}

export type RequestCache =
    | 'default'
    | 'force-cache'
    | 'no-cache'
    | 'no-store'
    | 'only-if-cached'
    | 'reload'

export type RequestCredentials = 'omit' | 'include' | 'same-origin'

export type RequestDestination =
    | ''
    | 'audio'
    | 'audioworklet'
    | 'document'
    | 'embed'
    | 'font'
    | 'image'
    | 'manifest'
    | 'object'
    | 'paintworklet'
    | 'report'
    | 'script'
    | 'sharedworker'
    | 'style'
    | 'track'
    | 'video'
    | 'worker'
    | 'xslt'

export type RequestInit = {
    method?: string
    keepalive?: boolean
    headers?: HeadersInit
    body?: BodyInit
    redirect?: RequestRedirect
    integrity?: string
    signal?: AbortSignal
    credentials?: RequestCredentials
    mode?: RequestMode
    referrer?: string
    referrerPolicy?: ReferrerPolicy
    window?: null
    duplex?: RequestDuplex
    dispatcher?: Dispatcher
    agent?: Agent
}

export type ReferrerPolicy =
    | ''
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'

export type RequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin'

export type RequestRedirect = 'error' | 'follow' | 'manual'

export type RequestDuplex = 'half'

export declare class Request implements BodyMixin {
    constructor(input: RequestInfo, init?: RequestInit)

    readonly cache: RequestCache
    readonly credentials: RequestCredentials
    readonly destination: RequestDestination
    readonly headers: Headers
    readonly integrity: string
    readonly method: string
    readonly mode: RequestMode
    readonly redirect: RequestRedirect
    readonly referrerPolicy: string
    readonly url: string

    readonly keepalive: boolean
    readonly signal: AbortSignal
    readonly duplex: RequestDuplex

    readonly body: ReadableStream | null
    readonly bodyUsed: boolean

    readonly arrayBuffer: () => Promise<ArrayBuffer>
    readonly blob: () => Promise<Blob>
    readonly formData: () => Promise<FormData>
    readonly json: () => Promise<unknown>
    readonly text: () => Promise<string>

    readonly clone: () => Request
}

export type ResponseInit = {
    readonly status?: number
    readonly statusText?: string
    readonly headers?: HeadersInit
}

export type ResponseType = 'basic' | 'cors' | 'default' | 'error' | 'opaque' | 'opaqueredirect'

export type ResponseRedirectStatus = 301 | 302 | 303 | 307 | 308

export declare class Response implements BodyMixin {
    constructor(body?: BodyInit, init?: ResponseInit)

    readonly headers: Headers
    readonly ok: boolean
    readonly status: number
    readonly statusText: string
    readonly type: ResponseType
    readonly url: string
    readonly redirected: boolean

    readonly body: ReadableStream | null
    readonly bodyUsed: boolean

    readonly arrayBuffer: () => Promise<ArrayBuffer>
    readonly blob: () => Promise<Blob>
    readonly formData: () => Promise<FormData>
    readonly json: () => Promise<unknown>
    readonly text: () => Promise<string>

    readonly clone: () => Response

    static error(): Response
    static json(data: unknown, init?: ResponseInit): Response
    static redirect(url: string | URL, status: ResponseRedirectStatus): Response
}
