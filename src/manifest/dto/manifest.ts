import type z from "zod";
import type { Manifest } from "../schemas/manifest.js";

export type ManifestDTO = z.infer<typeof Manifest>;
