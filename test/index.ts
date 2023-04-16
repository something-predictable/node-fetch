import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { Agent } from 'node:https'
import { fetchOK, fetchText, thrownHasStatus } from '../index.js'

const init: RequestInit = {
    keepalive: false,
    dispatcher: new Agent({
        keepAlive: false,
    }) as any,
}

describe('fetch', () => {
    let server: Awaited<ReturnType<typeof mock>>
    before('start server', async () => {
        server = await mock()
    })
    after('close server', async () => {
        await server.close()
    })
    beforeEach('clear server', () => {
        server.clear()
    })

    it('ok succeeds', async () => {
        server.setup('GET', 'ok', '', () => ({ status: 200 }))
        await fetchOK(`${server.baseUrl}ok`, init, 'ok did not succeed')
    })

    it('ok throws', async () => {
        await assert.rejects(() =>
            fetchOK(`${server.baseUrl}fail`, { keepalive: false }, 'ok failed'),
        )
    })

    it('text succeeds', async () => {
        server.setup('GET', 'ok', '', () => ({ status: 200, body: 'hello 💮' }))
        const text = await fetchText(`${server.baseUrl}ok`, init, 'text did not succeed')
        assert.strictEqual(text, 'hello 💮')
    })

    it('text throws', async () => {
        await assert.rejects(() => fetchOK(`${server.baseUrl}fetchText`, init, 'text rejected'))
    })

    it('json succeeds', async () => {
        server.setup('GET', 'ok', '', () => ({ status: 200, body: 'hello 💮' }))
        const text = await fetchText(`${server.baseUrl}ok`, init, 'text did not succeed')
        assert.strictEqual(text, 'hello 💮')
    })

    it('json throws', async () => {
        await assert.rejects(
            () => fetchOK(`${server.baseUrl}fetchText`, init, 'text rejected'),
            e => thrownHasStatus(e, 404),
        )
    })
})

async function mock() {
    const port = 12000 + Math.floor(Math.random() * 53000)
    const responses: {
        method: string
        url: string
        body: string
        response: () => { status: number; body?: string }
    }[] = []
    const server = await new Promise<ReturnType<typeof createServer>>(resolve => {
        const s = createServer((request, response) => {
            try {
                request.setEncoding('utf-8')
                let str = ''
                request.on('data', chunk => {
                    str += chunk
                })
                request.on('end', () => {
                    const match = responses
                        .filter(
                            r =>
                                r.method === request.method &&
                                r.url === request.url &&
                                r.body === str,
                        )
                        .at(-1)
                    if (!match) {
                        response.statusCode = 404
                        response.end()
                        return
                    }
                    const r = match.response()
                    response.statusCode = r.status
                    if (r.body) {
                        response.write(r.body)
                    }
                    response.end()
                })
            } catch (ex) {
                response.statusCode = 500
            }
        }).listen(port, '127.0.0.1', () => resolve(s))
    })
    return {
        baseUrl: `http://127.0.0.1:${port}/`,
        setup: (
            method: string,
            url: string,
            body: string,
            response: () => { status: number; body?: string },
        ) => responses.push({ method, url: '/' + url, body, response }),
        clear: () => {
            responses.splice(0)
        },
        close: () =>
            new Promise<void>((resolve, reject) => {
                server.close(err => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                })
            }),
    }
}
