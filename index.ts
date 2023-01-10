import * as nf from 'node-fetch'

export const fetch = nf.default
export type Response = nf.Response

export async function fetchOK(
    url: string,
    init: nf.RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    await okResponse(fetch(url, init), errorMessage, errorData)
}

export function fetchJson<T>(
    url: string,
    init: nf.RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    return jsonResponse<T>(fetch(url, withType(init, 'application/json')), errorMessage, errorData)
}

export function fetchText(
    url: string,
    init: nf.RequestInit | undefined,
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
    await (r.arrayBuffer ?? r.text)()
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

export function missing(what?: string): never {
    throw new Error(what ? `Missing ${what}.` : 'Missing.')
}

function withType(init: nf.RequestInit | undefined, mimeType: string) {
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
