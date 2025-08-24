export async function fetchOK(
    url: string,
    init: RequestInit | undefined,
    errorMessage: string,
    errorData?: { [key: string]: unknown },
) {
    await okResponse(fetch(url, withoutBrowserHeaders(init)), errorMessage, errorData)
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
    T extends { ok?: boolean; status?: number; url?: string; text?: () => Promise<string> },
>(response: Promise<T> | T, message: string, data?: { [key: string]: unknown }) {
    const r = await response
    if (r.ok === false) {
        throw Object.assign(new Error(message), {
            response: {
                url: r.url,
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
    const headers = init?.headers
    if (!headers) {
        return {
            ...init,
            headers: {
                accept: mimeType,
            },
            dispatcher: fetchAgent,
        } as unknown as RequestInit
    }
    if ((headers as { accept?: string }).accept) {
        return withoutBrowserHeaders(init)
    }
    if (Array.isArray(headers)) {
        return withType(
            { ...init, headers: Object.fromEntries(headers as [string, string][]) },
            mimeType,
        )
    }
    if (headers instanceof Headers) {
        return withType({ ...init, headers: Object.fromEntries(headers.entries()) }, mimeType)
    }
    return {
        ...init,
        headers: {
            ...headers,
            accept: mimeType,
        },
        dispatcher: fetchAgent,
    } as unknown as RequestInit
}

function withoutBrowserHeaders(init: RequestInit | undefined) {
    return {
        ...init,
        dispatcher: fetchAgent,
    } as unknown as RequestInit
}

function limitSize(text: string | undefined) {
    if (!text) {
        return text
    }
    if (text.length > 2048) {
        return text.slice(0, 2048 - 129) + '…' + text.slice(-128)
    }
    return text
}

// spell-checker: ignore undici
// eslint-disable-next-line no-void, unicorn/prefer-top-level-await, @typescript-eslint/no-empty-function
void fetch('').catch(() => {})
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
class FetchAgent extends (globalThis as any)[Symbol.for('undici.globalDispatcher.1')].constructor {
    dispatch(opts: { headers: { [x: string]: unknown } }, handler: unknown) {
        delete opts.headers['sec-fetch-mode']
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return super.dispatch(opts, handler)
    }
}
const fetchAgent = new FetchAgent()
