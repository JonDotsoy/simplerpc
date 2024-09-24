import * as path from "path";
import * as fs from "fs/promises";
import { zodToJsonSchema } from "zod-to-json-schema";

const cwd = new URL(`${process.cwd()}/`, "file://");

const [, , incomingScriptSchema, outputSchema] = process.argv;
const incomingScriptSchemaURL = new URL(incomingScriptSchema, cwd);
const outputSchemaURL = new URL(outputSchema, cwd);

// @ts-ignore
const module = await import(incomingScriptSchemaURL);

const out = zodToJsonSchema(module.default, {
  name: path.basename(
    incomingScriptSchemaURL.pathname,
    path.extname(incomingScriptSchemaURL.pathname),
  ),
  nameStrategy: "title",
});

await fs.mkdir(new URL("./", outputSchemaURL), { recursive: true });
await fs.writeFile(outputSchemaURL, JSON.stringify(out, null, 2));
