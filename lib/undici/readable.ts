// Based on https://github.com/nodejs/undici/blob/a3ce745b0c5d7c837ecae2359434ab4550a6e0ea/types/readable.d.ts (MIT)

import { Blob } from 'node:buffer'
import { Readable } from 'node:stream'

export default BodyReadable

declare class BodyReadable extends Readable {
    constructor(
        resume?: (this: Readable, size: number) => void | null,
        abort?: () => void | null,
        contentType?: string,
    )

    /** Consumes and returns the body as a string
     *  https://fetch.spec.whatwg.org/#dom-body-text
     */
    text(): Promise<string>

    /** Consumes and returns the body as a JavaScript Object
     *  https://fetch.spec.whatwg.org/#dom-body-json
     */
    json(): Promise<unknown>

    /** Consumes and returns the body as a Blob
     *  https://fetch.spec.whatwg.org/#dom-body-blob
     */
    blob(): Promise<Blob>

    /** Consumes and returns the body as an ArrayBuffer
     *  https://fetch.spec.whatwg.org/#dom-body-arraybuffer
     */
    arrayBuffer(): Promise<ArrayBuffer>

    /** Not implemented
     *
     *  https://fetch.spec.whatwg.org/#dom-body-formdata
     */
    formData(): Promise<never>

    /** Returns true if the body is not null and the body has been consumed
     *
     *  Otherwise, returns false
     *
     * https://fetch.spec.whatwg.org/#dom-body-bodyused
     */
    readonly bodyUsed: boolean

    /** Throws on node 16.6.0
     *
     *  If body is null, it should return null as the body
     *
     *  If body is not null, should return the body as a ReadableStream
     *
     *  https://fetch.spec.whatwg.org/#dom-body-body
     */
    readonly body: never | undefined

    /** Dumps the response body by reading `limit` number of bytes.
     * @param opts.limit Number of bytes to read (optional) - Default: 262144
     */
    dump(opts?: { limit: number }): Promise<void>
}
