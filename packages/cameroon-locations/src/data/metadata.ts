import data from "../../generated/metadata.json";
import { getSources, REPOSITORY_URL } from "../sources";
import type { DatasetMetadata, SourceId } from "../types";

/**
 * Name, dataset version, date and sources of the published data. `version`
 * is `<date>+<hash of data/canonical>`; `generated` is the latest retrieval
 * date among the sources.
 */
export const metadata: DatasetMetadata = Object.freeze({
  name: data.name,
  version: data.version,
  generated: data.generated,
  repository: REPOSITORY_URL,
  sources: Object.freeze(getSources(data.sources as SourceId[])),
});
