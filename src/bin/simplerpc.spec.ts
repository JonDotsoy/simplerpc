import { $ } from "bun";
import { expect, test } from "bun:test";
import * as fs from "fs/promises";

const script = new URL("simplerpc.ts", import.meta.url);
const workspaceSample1 = new URL("./__sample__/sample1/", import.meta.url);
const workspaceSample2 = new URL("./__sample__/sample2/", import.meta.url);
const $workspaceSample1 = $.cwd(workspaceSample1.pathname);
const $workspaceSample2 = $.cwd(workspaceSample2.pathname);

test("should call to simplerpc and make a service file", async () => {
  await $workspaceSample1`bun ${script.pathname} init-service manifest.yaml srv.ts`;

  // Expect a srv.ts file generated

  const serviceScript = new URL("srv.ts", workspaceSample1);
  expect(fs.readFile(serviceScript)).toMatchSnapshot();
});

test("should call `simplerpc serve srv.ts` and listener service", async () => {
  await $workspaceSample1`bun ${script.pathname} init-service manifest.yaml srv.ts`;
  await $workspaceSample1`bun ${script.pathname} serve srv.ts`;
});

test("should make a library by a remote service", async () => {
  await $workspaceSample1`bun ${script.pathname} init-service manifest.yaml srv.ts`;
  await $workspaceSample1`bun ${script.pathname} serve srv.ts`;
  await $workspaceSample2`bun ${script.pathname} pull http://localhost:8765/ my-client.ts`;

  // Expect a srv.ts file generated

  const libScript = new URL("my-client.ts", workspaceSample2);
  expect(fs.readFile(libScript)).toMatchSnapshot();
});
