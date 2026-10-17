---
"cameroon-locations": minor
---

`cameroon-locations/effect` is now schema-first. `RegionFromString`, `DivisionFromString` and `ArrondissementFromString` decode a P-code, HASC code or name (with the core's lookup rules) into the bundled record, and fail with a schema issue that names what was not found or lists the P-codes an ambiguous name matches; the `*FromPcode` decoders accept P-codes only. Every record schema is checked against the core types at build time. The Effect lookups (`getRegion`, `getDivision`, `getArrondissement`, `getUnit`), their `*Option` variants, the `LocationNotFound` and `AmbiguousLocation` errors and the `CameroonLocations` service are removed: use the core lookups, `Option.fromUndefinedOr(getRegion(q))` or `Schema.decodeUnknownEffect(RegionFromString)(q)`.
