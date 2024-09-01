import { get } from "./utils/get.js";

type LikeURL = { toString(): string };

type RPCService<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends (...args: infer A) => infer R
        ? (...args: A) => Promise<Awaited<R>>
        : never;
      // T[K] //(...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
    }
  : never;

export const createHTTPClient = <T>(url: LikeURL): RPCService<T> => {
  const baseURL = new URL(url.toString());
  const invokeFunction = async (functionName: string, args: any[]) => {
    const url = new URL("./invoke", baseURL);
    url.searchParams.set("function", functionName);
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ args }),
    });

    const payload = await res.json();
    const error = get.string(payload, "error");
    const result = get(payload, "result");
    if (error) throw new Error(error);
    return result;
  };

  const t: any = new Proxy(
    {},
    {
      get(_, functionName: string) {
        if (functionName === "then") return;
        if (typeof functionName !== "string") return;

        return (...args: any[]) => invokeFunction(functionName, args);
      },
    },
  );

  return t;
};
