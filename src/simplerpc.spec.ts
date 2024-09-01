import { createHTTPClient, createHTTPServer } from "./simplerpc.js";
import { expect, test, mock } from "bun:test";

test("", async () => {
  const service = {
    foo: mock(() => "bar"),
  };
  const router = await createHTTPServer(service);
  Bun.serve({
    port: 3000,
    fetch: async (r) =>
      (await router.fetch(r)) ?? new Response(null, { status: 404 }),
  });
  const srv = createHTTPClient<typeof service>("http://localhost:3000/");
  expect(await srv.foo()).toBe("bar");
  expect(service.foo).toBeCalled();
});
