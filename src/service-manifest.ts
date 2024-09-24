import { type ZodObject, z } from "zod";
import { zodToTs, printNode, createTypeAlias, withGetType } from "zod-to-ts";
import { visit, get } from "@jondotsoy/utils-js";
import type { ManifestDTO } from "./manifest/dto/manifest";
import { Manifest, toZodObject } from "./manifest/schemas/manifest";

export const createServiceManifest = (incomingManifest: ManifestDTO) => {
  const manifestChecked = Manifest.parse(incomingManifest);

  const manifest = {
    services: [
      ...Array.from(manifestChecked.services, (services) => {
        return {
          ...services,
          input: services.input ? toZodObject(services.input) : undefined,
          output: services.output ? toZodObject(services.output) : undefined,
        };
      }),
    ],
  };

  const createDeclaration = () => {
    let nodes: string[] = [];
    let count = 0;
    let nodesAlreadyMapped = new WeakMap<
      WeakKey,
      { index: number; aliasName: string }
    >();

    for (const service of visit<any, ZodObject<any>>(
      manifest.services,
      (service) => get.string(service, "_def", "typeName") === "ZodObject",
    )) {
      if (!nodesAlreadyMapped.has(service)) {
        const index = count++;
        const aliasName = `__type_${index}`;
        nodesAlreadyMapped.set(service, { index, aliasName });

        const node = zodToTs(service, aliasName).node;
        const typeAlias = createTypeAlias(node, aliasName);

        withGetType(service, (ts) => ts.factory.createIdentifier(aliasName));

        nodes.push(printNode(typeAlias));
      }
    }

    nodes.push("");

    manifest.services.forEach((e) => {
      const fn = z.function(
        z.tuple([e.input ?? z.void()]),
        z.promise(e.output ?? z.void()),
      );

      const node = zodToTs(fn, e.name).node;
      const typeAlias = createTypeAlias(node, e.name);

      nodes.push(`export ${printNode(typeAlias)}`);
    });

    return nodes.join("\n");
  };

  return {
    createDeclaration,
  };
};
