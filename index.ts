import * as undici from './lib/undici/fetch.js'
import * as formData from './lib/undici/formData.js'

declare global {
    export const { FormData }: typeof import('./lib/undici/formData.js')
    export const { fetch, Headers, Request, Response }: typeof import('./lib/undici/fetch.js')

    type FormData = formData.FormData
    type Headers = undici.Headers
    type HeadersInit = undici.HeadersInit
    type BodyInit = undici.BodyInit
    type Request = undici.Request
    type RequestInit = undici.RequestInit
    type RequestInfo = undici.RequestInfo
    type RequestMode = undici.RequestMode
    type RequestRedirect = undici.RequestRedirect
    type RequestCredentials = undici.RequestCredentials
    type RequestDestination = undici.RequestDestination
    type ReferrerPolicy = undici.ReferrerPolicy
    type Response = undici.Response
    type ResponseInit = undici.ResponseInit
    type ResponseType = undici.ResponseType
}

export async function fetchOK(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    await okResponse(fetch(url, init), errorMessage, errorData)
}

export function fetchJson<T>(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    return jsonResponse<T>(fetch(url, withType(init, 'application/json')), errorMessage, errorData)
}

export function fetchText(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    return textResponse(fetch(url, withType(init, 'text/*')), errorMessage, errorData)
}

export async function okResponse(
    response: Promise<{
        ok?: boolean
        status?: number
        text: () => Promise<string>
        arrayBuffer?: () => Promise<unknown>
    }>,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    const r = await throwOnNotOK(response, errorMessage, errorData)
    await (r.arrayBuffer ?? r.text).bind(r)()
}

export async function jsonResponse<T>(
    response: Promise<{
        ok?: boolean
        status?: number
        text?: () => Promise<string>
        json: () => Promise<unknown>
    }>,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    const r = await throwOnNotOK(response, errorMessage, errorData)
    return (await r.json()) as T
}

export async function textResponse(
    response: Promise<{
        ok?: boolean
        status?: number
        text: () => Promise<string>
    }>,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    const r = await throwOnNotOK(response, errorMessage, errorData)
    return await r.text()
}

export async function throwOnNotOK<
    T extends { ok?: boolean; status?: number; text?: () => Promise<string> },
>(response: Promise<T> | T, message: string, data?: { [key: string]: unknown }) {
    const r = await response
    if (r.ok === false) {
        throw Object.assign(new Error(message), {
            response: {
                status: r.status,
                body: limitSize(await r.text?.()),
            },
            ...data,
        })
    }
    return response
}

export function thrownHasStatus(e: unknown, status: number) {
    return (e as { response?: { status?: number } } | undefined)?.response?.status === status
}

export function missing(what?: string): never {
    throw new Error(what ? `Missing ${what}.` : 'Missing.')
}

function withType(init: RequestInit | undefined, mimeType: string) {
    if ((init?.headers as { accept?: string } | undefined)?.accept) {
        return init
    }
    return {
        ...init,
        headers: {
            ...init?.headers,
            accept: mimeType,
        },
    }
}

function limitSize(text: string | undefined) {
    if ((text?.length ?? 0) > 2048) {
        return text?.substring(0, 2048)
    }
    return text
}
