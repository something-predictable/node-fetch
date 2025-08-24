# Overview

This package some minor useful functions that make working with the built-in `fetch` slightly more ergonomic.

## High-level

Prefer these functions over built-in `fetch` if they fit the use-case.

```ts
// `fetchOK` passes the first two arguments (url and init) to `fetch`. If response is ok consumes the body to reduce dangling sockets and returns. If not ok throws an error with useful information like the response status and body. Third argument is the message of the thrown error, fourth argument is optional extra context to add to the error.
await fetchOK("https://example.com", { headers: {} }, "Error fetching stuff", { extra: "data" });

// `fetchText` passes the first two arguments (url and init) to `fetch`, checks the response like `fetchOK`, and if ok awaits `text()` and returns the resulting string.
const responseBodyText: string = await fetchText(
    "https://example.com", { headers: {} }
    "Error fetching stuff",
    { extra: "data" },
);

// `fetchJson` passes the first two arguments (url and init) to `fetch`, checks the result like `fetchOK`, and if ok awaits `json()` and returns the resulting string. You can provide a type parameter and it will cast the return value to that type.
const responseJsonText: { message: string } = await fetchJson<{ message: string }>(
    "https://example.com", { headers: {} }
    "Error fetching stuff",
    { extra: "data" },
);
```

## Low-level

**missing**

```ts
// `missing` is a TypeScript helper that can be used an expression and that returns `never`. It always throws an error that says the argument is missing. Use after the `??` operator to make an expression that is possibly undefined well-defined.
fetch(process.env.BASE_URL ?? missing("BASE_URL environment variable"));
```

**throwOnNotOK**

```ts
const response = fetch(...)
// `throwOnNotOK` is similar to `okResponse`, except you've called `fetch` yourself.
await throwOnNotOK(response, 'Error fetching stuff', { extra: 'data' })
```

Examine thrown errors using `thrownHasStatus` like this

```ts
try {
    return await someFunctionThatDoesAFetch();
} catch (e) {
    // returns true if e has status code 404
    if (thrownHasStatus(e, 404)) {
        return [];
    }
    throw e;
}
```

**Response**

```ts
// `okResponse` is similar to `throwOnNotOK`, but will consume the body to avoid dangling sockets.
await okResponse(fetch("https://example.com"), "Error fetching stuff", { extra: "data" });

// `textResponse` checks the response with `throwOnNotOK`, and if ok awaits `text()` and returns the resulting string.
const responseBodyText: string = await textResponse(
    fetch("https://example.com"),
    "Error fetching stuff",
    {
        extra: "data",
    },
);

// `jsonResponse` checks the response with `throwOnNotOK`, and if ok awaits `text()` and returns the resulting string.
const responseJsonText: { message: string } = await jsonResponse<{ message: string }>(
    fetch("https://example.com"),
    "Error fetching stuff",
    { extra: "data" },
);
```
