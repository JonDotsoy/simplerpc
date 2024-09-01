import { cors, Router } from "artur";
import { get } from "./utils/get.js";

const resultOrError = <T>(
  promise: T | Promise<T>,
): Promise<[unknown, never] | [null, T]> =>
  Promise.resolve(promise)
    .then((r) => [null, r])
    .catch((e) => [e, null]) as any;

export const createHTTPServer = async <T>(service: T | Promise<T>) => {
  const serviceAwaited = await service;

  const router = new Router({
    middlewares: [cors()],
  });

  router.use("POST", "/invoke", {
    fetch: async (req) => {
      const url = new URL(req.url);

      const serviceName = url.searchParams.get("function");
      if (!serviceName)
        return Response.json(
          { error: "Missing function name" },
          { status: 400 },
        );

      const body = await req.json();

      const args = get.array(body, "args") ?? [];
      const service = get.function(serviceAwaited, serviceName);
      if (!service)
        return Response.json(
          { error: `Function ${serviceName} not found` },
          { status: 404 },
        );

      const [error, result] = await resultOrError(service(...args));

      if (error) {
        console.error(error);
        if (error instanceof Error)
          return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ error: "unknown error" }, { status: 500 });
      }

      return Response.json({ result });
    },
  });

  return router;
};
