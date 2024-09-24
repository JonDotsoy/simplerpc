#!/usr/bin/env bun
import { flag, flags, isStringAt, rule, type Rule } from "@jondotsoy/flags";
import * as YAML from "yaml";
import * as fs from "fs/promises";

const cwd = new URL(`${process.cwd()}/`, "file://");
const args = process.argv.slice(2);

const main = async (args: string[]) => {
  type Options = {
    manifest: string;
  };
  const rules: Rule<Options>[] = [
    rule((_, ctx) => {
      if (!ctx.flags.manifest) {
        ctx.argValue = _;
        return true;
      }
      return false;
    }, isStringAt("manifest")),
  ];

  const options = flags(args, {}, rules);

  if (!options.manifest) throw new Error(`Missing manifest file`);

  const manifest = new URL(options.manifest, cwd);

  const data = YAML.parse(await fs.readFile(manifest, "utf-8"));
  console.log("🚀 ~ main ~ data:", data);
};

await main(args);
