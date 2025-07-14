# 🇨🇲 Cameroon Locations

A comprehensive and intuitive TypeScript package for working with Cameroonian administrative
divisions including the complete hierarchy: **Regions → Divisions → Subdivisions → Districts**.

## Features

- 🏗️ **Complete Administrative Hierarchy** - Region → Division → Subdivision → District
- 🌍 **Bilingual Support** - French and English names for all administrative divisions
- 🔢 **Multiple Code Systems** - Numeric codes, HASC codes, and P-codes support
- 🔍 **Intuitive API** for navigating Cameroon's administrative hierarchy
- 🔎 **Bilingual Search** capabilities across all administrative levels
- 🧩 **TypeScript support** with full type definitions
- 🚀 **Lightning-fast performance** with optimized Maps and pre-computed relationships
- 📊 **Complete data** for all 10 regions, 58 divisions, subdivisions, and districts
- 📱 **Lightweight** with minimal dependencies
- 📖 **Well-documented** API with examples
- ✅ **Well-tested** with comprehensive unit tests
- 🔄 **Backward Compatible** - existing code continues to work

## Installation

```bash
npm install cameroon-locations
```

## Hierarchy

The library supports the complete Cameroonian administrative hierarchy:

```
Region (10 regions)
├── Division (58 divisions)
│   └── Subdivision (arrondissements)
│       └── District (smallest units)
```

## Usage

### Basic Usage

```typescript
import { CameroonLocations, region } from "cameroon-locations";

// Get all regions
const regions = CameroonLocations.getRegions();
console.log(regions); // Array of all 10 regions

// Find a specific region (multiple ways)
const centre1 = region("Centre"); // By French name
const centre2 = region("02"); // By numeric code
const centre3 = region("CM.CE"); // By HASC code
const centre4 = region("CMR002"); // By P-code

// Access bilingual names
console.log(centre1.nameFr); // "Centre"
console.log(centre1.nameEn); // "Centre"
console.log(centre1.name); // "Centre" (defaults to French)
console.log(centre1.getName("en")); // "Centre"

// Get all codes for a location
console.log(centre1.getAllCodes());
// { code: "02", hasc: "CM.CE", pcode: "CMR002" }

// Get divisions in a region
const centreDivisions = CameroonLocations.getDivisionsInRegion("Centre");
console.log(centreDivisions); // Array of divisions in Centre region

// Search across all administrative levels (bilingual)
const results = CameroonLocations.search("Yaoundé");
console.log(results); // Searches both French and English names

// Search by specific type
const regionResults = CameroonLocations.searchByType("Centre", "region");
console.log(regionResults); // Array of regions matching 'Centre'
```

### Advanced Usage

```typescript
import { division, subdivision, district } from "cameroon-locations";

// Chainable API for navigation
const centreRegion = region("Centre");
const mfoundiDivision = centreRegion.division("Mfoundi");
const yaounde1Subdivision = mfoundiDivision.subdivision("Yaoundé I");
const centreAdminDistrict = yaounde1Subdivision.district("Centre Administratif");

// Navigate up the hierarchy
const regionFromDistrict = centreAdminDistrict.region();
console.log(regionFromDistrict.nameFr); // "Centre"

// Direct lookup with relationship functions
const region = CameroonLocations.getRegionOfDivision("Mfoundi");
const division = CameroonLocations.getDivisionOfSubdivision("Yaoundé I");
const subdivision = CameroonLocations.getSubdivisionOfDistrict("Centre Administratif");

// Search with options
const limitedResults = CameroonLocations.search("Yaoundé", { limit: 5 });
const regionOnly = CameroonLocations.search("Centre", { types: ["region"] });

// Language-specific operations
const yaounde = subdivision("Yaoundé I");
console.log(yaounde.getName("fr")); // "Yaoundé I"
console.log(yaounde.getName("en")); // "Yaoundé I"
```

## API Reference

### Wrapper Functions

#### `region(identifier: string): RegionWrapper | undefined`

Find a region by any identifier (name, code, HASC, P-code). Returns a wrapper with chainable
methods.

#### `division(identifier: string): DivisionWrapper | undefined`

Find a division by any identifier. Returns a wrapper with chainable methods.

#### `subdivision(identifier: string): SubdivisionWrapper | undefined`

Find a subdivision by any identifier. Returns a wrapper with chainable methods.

#### `district(identifier: string): DistrictWrapper | undefined`

Find a district by any identifier. Returns a wrapper with chainable methods.

### Static Methods

#### `getRegions(): Region[]`

Returns all regions in Cameroon.

#### `getDivisions(): Division[]`

Returns all divisions in Cameroon.

#### `getSubdivisions(): Subdivision[]`

Returns all subdivisions in Cameroon.

#### `getDistricts(): District[]`

Returns all districts in Cameroon.

#### `getDivisionsInRegion(regionIdentifier: string): Division[]`

Get all divisions in a specific region.

#### `getSubdivisionsInDivision(divisionIdentifier: string): Subdivision[]`

Get all subdivisions in a specific division.

#### `getDistrictsInSubdivision(subdivisionIdentifier: string): District[]`

Get all districts in a specific subdivision.

#### `search(query: string, options?: SearchOptions): SearchResult[]`

Search across all administrative divisions (bilingual).

```typescript
interface SearchOptions {
  limit?: number; // Maximum results (default: 10)
  types?: SearchType[]; // Filter by types
}
```

#### `searchByType(query: string, type: SearchType, limit?: number): SearchResult[]`

Search within a specific administrative type.

### Wrapper Methods

Each wrapper (RegionWrapper, DivisionWrapper, etc.) provides:

- `getName(language?: Language): string` - Get name in specific language
- `getAllCodes(): object` - Get all available codes
- Navigation methods (e.g., `region.divisions()`, `division.region()`)
- Chainable lookup methods (e.g., `region.division("name")`)

## Types

```typescript
interface Region {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "02")
  hasc?: string; // HASC code (e.g., "CM.CE")
  pcode?: string; // P-code (e.g., "CMR002")
  get name(): string; // Computed property (returns nameFr)
}

interface Division {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "0207")
  hasc?: string; // HASC code (e.g., "CM.CE.MF")
  pcode?: string; // P-code (e.g., "CMR002007")
  region: string; // Parent region name (French)
  regionCode: string; // Parent region code
  get name(): string; // Computed property (returns nameFr)
}

interface Subdivision {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "020701")
  hasc?: string; // HASC code (optional)
  pcode?: string; // P-code (optional)
  division: string; // Parent division name (French)
  divisionCode: string; // Parent division code
  get name(): string; // Computed property (returns nameFr)
}

interface District {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "02070101")
  hasc?: string; // HASC code (optional)
  pcode?: string; // P-code (optional)
  subdivision: string; // Parent subdivision name (French)
  subdivisionCode: string; // Parent subdivision code
  get name(): string; // Computed property (returns nameFr)
}

interface SearchResult {
  type: "region" | "division" | "subdivision" | "district";
  item: Region | Division | Subdivision | District;
}

type SearchType = "region" | "division" | "subdivision" | "district";
type Language = "fr" | "en";
```

## Administrative Structure

### Regions (10)

| French Name  | English Name | Code | HASC  | P-Code |
| ------------ | ------------ | ---- | ----- | ------ |
| Adamaoua     | Adamawa      | 01   | CM.AD | CMR001 |
| Centre       | Centre       | 02   | CM.CE | CMR002 |
| Est          | East         | 03   | CM.ES | CMR003 |
| Extrême-Nord | Far North    | 04   | CM.EN | CMR004 |
| Littoral     | Littoral     | 05   | CM.LT | CMR005 |
| Nord         | North        | 06   | CM.NO | CMR006 |
| Nord-Ouest   | Northwest    | 07   | CM.NW | CMR007 |
| Ouest        | West         | 08   | CM.OU | CMR008 |
| Sud          | South        | 09   | CM.SU | CMR009 |
| Sud-Ouest    | Southwest    | 10   | CM.SW | CMR010 |

### Major Cities and Their Administrative Locations

- **Yaoundé** (Capital): Centre Region → Mfoundi Division → Yaoundé I-VII Subdivisions
- **Douala** (Economic Capital): Littoral Region → Wouri Division → Douala I-VI Subdivisions
- **Bamenda**: Northwest Region → Mezam Division → Bamenda I-III Subdivisions
- **Buea**: Southwest Region → Fako Division → Buea Subdivision

## Bilingual Support

This package provides comprehensive bilingual support for French and English:

### Language Access

```typescript
const region = region("Centre");

// Direct property access
console.log(region.nameFr); // "Centre"
console.log(region.nameEn); // "Centre"
console.log(region.name); // "Centre" (defaults to French)

// Method access with language parameter
console.log(region.getName("fr")); // "Centre"
console.log(region.getName("en")); // "Centre"
console.log(region.getName()); // "Centre" (defaults to French)
```

### Bilingual Search

Search works across both French and English names:

```typescript
// These will all find Yaoundé-related locations
const results1 = search("Yaoundé"); // French name
const results2 = search("Yaounde"); // English variant
const results3 = search("Centre"); // Works for both languages
```

### Multiple Code Systems

The package supports multiple coding systems used in Cameroon:

```typescript
const region = region("02"); // Numeric code
const region2 = region("CM.CE"); // HASC (Hierarchical Administrative Subdivision Codes)
const region3 = region("CMR002"); // P-codes (Place codes)

// Get all codes for a location
console.log(region.getAllCodes());
// Output: { code: "02", hasc: "CM.CE", pcode: "CMR002" }
```

## Migration & Backward Compatibility

This package maintains full backward compatibility. Existing code will continue to work:

```typescript
// ✅ This still works (returns French name)
const regionName = region("Centre").name;

// ✅ This still works
const divisions = getDivisionsInRegion("Centre");

// ✅ Search still works as before
const results = search("Yaoundé");
```

## Examples

Check out the `examples/` directory for complete usage examples including:

- Basic administrative hierarchy navigation
- Bilingual search functionality
- Multiple code system usage
- HTML/JavaScript integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Data Sources

Administrative division data is based on official Cameroonian government sources and may be updated
periodically to reflect administrative changes.
