import { expect, test } from "bun:test";
import { createServiceManifest } from "./service-manifest.js";
import { z, ZodAny, ZodSchema } from "zod";
import { Manifest, toZodObject } from "./manifest/schemas/manifest.js";
import type { ManifestDTO } from "./manifest/dto/manifest.js";

test("should parse json zod on zod object", async () => {
  const manifest = Manifest.parse({
    services: [
      {
        name: "hola",
        input: {
          $object: {
            hola: {
              $string: true,
            },
            a: {
              $array: {
                $number: true,
              },
            },
            b: {
              $optional: {
                $boolean: true,
              },
            },
          },
        },
      },
    ],
  } satisfies ManifestDTO);

  expect(toZodObject(manifest.services[0].input!)).toBeInstanceOf(ZodSchema);
});

test.only("should make a definition to export resources", async () => {
  const profile = z
    .object({
      name: z.string(),
      age: z.union([z.number(), z.string().endsWith("age")]),
    })
    .describe("profile");

  const manifest = createServiceManifest({
    services: [
      {
        name: "read",
        input: z.object({
          per: profile,
        }),
        output: z.object({}),
      },
      {
        name: "list",
        output: z
          .object({
            names: z.array(z.string()),
            profiles: z.array(profile),
          })
          .describe("abc"),
      },
      { name: "echo" },
      {
        name: "rec",
        input: {
          $object: {
            foo: {
              $string: true,
            },
          },
        },
      },
    ],
  });

  expect(manifest.createDeclaration()).toMatchSnapshot();
});
