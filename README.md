# SimpleRPC

> [!WARNING]
> STATE: Proposal

SimpleRPC is a lightweight RPC (Remote Procedure Call) framework written in TypeScript. It allows you to expose services over HTTP and establish communication between different applications.

> **Note:** This project is designed to work with TypeScript projects. If you need to connect between other languages, please consider using gRCP or other RPC options.

## Features

- Expose services over HTTP using `create-http-serve`
- Establish client connections using `create-http-client`

## Getting Started

To get started with SimpleRPC, follow these steps:

1. Install the required dependencies: `npm install @jondotsoy/simplerpc`
2. Create a new TypeScript file to define your services (e.g., `my-services.ts`)
3. Use the `create-http-serve` function to expose your services over HTTP
4. On the client side, use the `create-http-client` function to connect to the exposed service

## Example Usage

Here's an example of how to use SimpleRPC:

**Server Side (exposing a service)**

```ts
import { createHTTPServer } from "@jondotsoy/simplerpc";
import * as MyServices from "./my-services.js";

const router = await createHTTPServer(MyServices);

serve({
  port: 3000,
  fetch: async (r) =>
    (await router.fetch(r)) ?? new Response(null, { status: 404 }),
});
```

**Client Side (connecting to a service)**

```ts
import { createHTTPClient } from "@jondotsoy/simplerpc";

const MyServices = await createHTTPClient<typeof import("./my-services.js")>(
  "http://localhost:3000",
);
```

## License

SimpleRPC is released under the MIT license. Please see [LICENSE](./LICENSE) for more information.
