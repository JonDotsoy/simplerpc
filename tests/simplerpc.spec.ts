import { createHTTPClient, createHTTPServer } from "../src/simplerpc.js";
import { expect, test, mock, afterAll } from "bun:test";

const ends = new Set<() => Promise<any>>();

afterAll(async () => {
  for (const end of ends) {
    await end();
  }
});

test("", async () => {
  const service = {
    foo: mock(() => "bar"),
  };
  const router = await createHTTPServer(service);
  const server = Bun.serve({
    port: 3000,
    fetch: async (r) =>
      (await router.fetch(r)) ?? new Response(null, { status: 404 }),
  });
  ends.add(async () => server.stop());
  const srv = createHTTPClient<typeof service>("http://localhost:3000/");
  expect(await srv.foo()).toBe("bar");
  expect(service.foo).toBeCalled();
});
