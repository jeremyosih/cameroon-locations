import { getSources, REPOSITORY_URL } from "../sources";
import type { DatasetMetadata } from "../types";

// Owner: data generation. Replaced by generated/metadata.json.
export const metadata: DatasetMetadata = Object.freeze({
  name: "cameroon-locations",
  version: "0.0.0",
  generated: "",
  repository: REPOSITORY_URL,
  sources: getSources(["ocha-cod-ab-cmr"]),
});
