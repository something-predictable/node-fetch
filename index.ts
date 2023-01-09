import fetch, { RequestInit } from 'node-fetch'

export * from 'node-fetch'

export async function fetchJson<T>(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    const response = await throwOnNotOK(await fetch(url, init), errorMessage, errorData)
    return (await response.json()) as T
}

export async function fetchText(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    const response = await throwOnNotOK(await fetch(url, init), errorMessage, errorData)
    return await response.text()
}

export async function throwOnNotOK<
    T extends { ok?: boolean; status?: number; text?: () => Promise<string> },
>(response: T, message: string, data?: { [key: string]: unknown }) {
    if (response.ok === false) {
        throw Object.assign(new Error(message), {
            response: {
                status: response.status,
                body: limitSize(await response.text?.()),
            },
            ...data,
        })
    }
    return response
}

export function missing(what?: string) {
    throw new Error(what ? `Missing ${what}.` : 'Missing.')
}

function limitSize(text: string | undefined) {
    if ((text?.length ?? 0) > 2048) {
        return text?.substring(0, 2048)
    }
    return text
}
