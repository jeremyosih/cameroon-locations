/**
 * Internal to `cameroon-locations/effect`: the transformation behind the
 * `*FromPcode` and `*FromString` schemas, kept apart so the tests can drive
 * it with a lookup that returns several matches (no name is ambiguous in the
 * current data). Not an entry point.
 */
import { Effect, Schema, SchemaGetter, SchemaIssue } from "effect";

/**
 * Decodes `from` into the single unit `lookup` returns, then checks it with
 * `to`, and encodes a unit back to its P-code. No match fails with
 * `notFound(input)`; several fail with the candidate P-codes.
 */
export function lookupSchema<A extends { readonly pcode: string }>(
  from: Schema.Codec<string>,
  to: Schema.declare<A>,
  what: string,
  lookup: (input: string) => readonly A[],
  notFound: (input: string) => string,
) {
  return from.pipe(
    Schema.decodeTo(to, {
      decode: SchemaGetter.transformEffect((input: string) => {
        const matches = lookup(input);
        const [unit] = matches;
        if (unit && matches.length === 1) return Effect.succeed(unit);
        const message = unit
          ? `"${input}" matches ${matches.length} ${what}s: ${matches.map((m) => m.pcode).join(", ")}`
          : notFound(input);
        return Effect.fail(new SchemaIssue.InvalidValue({ message }, input));
      }),
      encode: SchemaGetter.transform((unit: A) => unit.pcode),
    }),
  );
}

/**
 * A record schema for the decoded side of a lookup: values are checked with
 * `schema` but passed through untouched, so decoding yields the frozen
 * record of the bundled dataset (`===` the one the core returns), not a copy.
 */
export const bundled = <A>(schema: Schema.Codec<A>, title: string) =>
  Schema.declare<A>((u): u is A => Schema.is(schema)(u), { title });
