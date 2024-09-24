import {
  array,
  lazy,
  object,
  optional,
  record,
  string,
  union,
  instanceof as instanceof_,
  ZodType,
  z,
  literal,
} from "zod";

const requireTransform = new WeakSet();

namespace ZodJsonSchema {
  type ZodJsonObjectSchema = { $object: Record<string, ZodJsonSchema> };
  type ZodJsonStringSchema = { $string: true };
  type ZodJsonNumberSchema = { $number: true };
  type ZodJsonBooleanSchema = { $boolean: true };
  type ZodJsonOptionalSchema = { $optional: ZodJsonSchema };
  type ZodJsonArraySchema = { $array: ZodJsonSchema };
  type ZodJsonSchema =
    | ZodJsonObjectSchema
    | ZodJsonStringSchema
    | ZodJsonNumberSchema
    | ZodJsonBooleanSchema
    | ZodJsonOptionalSchema
    | ZodJsonArraySchema;

  export const ZodJsonStringSchema: ZodType<any> = object({
    $string: literal(true),
  });

  export const ZodJsonNumberSchema: ZodType<any> = object({
    $number: literal(true),
  });

  export const ZodJsonBooleanSchema: ZodType<any> = object({
    $boolean: literal(true),
  });

  export const ZodJsonObjectSchema: ZodType<any> = object({
    $object: record(
      string(),
      lazy(() => ZodJsonSchema),
    ),
  });

  export const ZodJsonArraySchema: ZodType<any> = object({
    $array: lazy(() => ZodJsonSchema),
  });

  export const ZodJsonOptionalSchema: ZodType<any> = object({
    $optional: lazy(() => ZodJsonSchema),
  });

  export const ZodJsonSchema: ZodType<ZodJsonSchema> = union([
    ZodJsonObjectSchema,
    ZodJsonStringSchema,
    ZodJsonNumberSchema,
    ZodJsonBooleanSchema,
    ZodJsonArraySchema,
    ZodJsonOptionalSchema,
  ]).transform((e) => {
    requireTransform.add(e);
    return e;
  });

  export const isZodJsonSchema = (value: unknown): value is ZodJsonSchema => {
    return (
      typeof value === "object" && value !== null && requireTransform.has(value)
    );
  };
}

const Schema = union([ZodJsonSchema.ZodJsonSchema, instanceof_(ZodType)]);

export const toZodObject = (value: z.infer<typeof Schema>) => {
  if (!ZodJsonSchema.isZodJsonSchema(value)) return value;

  const parseZodObject = (
    value: z.infer<typeof ZodJsonSchema.ZodJsonSchema>,
  ): z.ZodSchema => {
    if ("$object" in value) {
      return z.object(
        Object.fromEntries(
          Array.from(Object.entries(value.$object), ([key, field]) => [
            key,
            parseZodObject(field),
          ]),
        ),
      );
    }
    if ("$string" in value) return z.string();
    if ("$number" in value) return z.number();
    if ("$boolean" in value) return z.boolean();
    if ("$optional" in value)
      return z.optional(parseZodObject(value.$optional));
    if ("$array" in value) return z.array(parseZodObject(value.$array));

    throw new Error("Cannot parse zod schema");
  };

  return parseZodObject(value);
};

export const Service = object({
  name: string(),
  input: optional(Schema),
  output: optional(Schema),
});

export const Manifest = object({
  services: array(Service),
});

export default Manifest;
