# 🇨🇲 Cameroon Locations

A comprehensive and intuitive TypeScript package for working with Cameroonian administrative
divisions including the complete 6-level hierarchy: **Regions → Divisions → Subdivisions → Cantons →
NeighborhoodsOrVillages → Blocks**.

## Features

- 🏗️ **Complete Administrative Hierarchy** - Region → Division → Subdivision → Canton →
  NeighborhoodOrVillage → Block
- 🌍 **Bilingual Support** - French and English names for all administrative divisions
- 🔢 **Multiple Code Systems** - Numeric codes, HASC codes, and P-codes support
- 🔍 **Intuitive API** for navigating Cameroon's administrative hierarchy
- 🔎 **Bilingual Search** capabilities across all administrative levels
- 🏛️ **Canton Type Support** - City, rural, traditional (lamidat/sultanate/chiefdom) cantons
- 👥 **Population Data** - Optional population statistics for neighborhoods and villages
- 🧩 **TypeScript support** with full type definitions
- 🚀 **Lightning-fast performance** with optimized Maps and pre-computed relationships
- 📊 **Complete data** for all 10 regions, 58 divisions, subdivisions, cantons,
  neighborhoods/villages, and blocks
- 📱 **Lightweight** with minimal dependencies
- 📖 **Well-documented** API with examples
- ✅ **Well-tested** with comprehensive unit tests

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
│       └── Canton (city/rural/traditional)
│           └── NeighborhoodOrVillage (neighborhoods/villages/localities)
│               └── Block (smallest administrative units)
```

## Usage Examples

### Basic Usage

Get started with simple region and division queries

```typescript
import { getRegions, region, search } from "cameroon-locations";

// Get all regions
const regions = getRegions();

// Get a specific region
const centre = region("Centre");

// Search across all levels
const results = search("Yaoundé");
```

### Chainable API

Navigate the hierarchy with intuitive chaining

```typescript
import { region } from "cameroon-locations";

// Chain through the hierarchy
const centre = region("Centre");
const mfoundi = centre?.division("Mfoundi");
const yaounde1 = mfoundi?.subdivision("Yaoundé I");
const canton = yaounde1?.canton("Yaoundé I");
const neighborhood = canton?.neighborhoodOrVillage("Centre Administratif");
const block = neighborhood?.block("Bloc A");

console.log(block?.name); // "Bloc A"
```

### Hierarchical Navigation

Work with the complete administrative hierarchy

```typescript
import {
  getDivisionsInRegion,
  getSubdivisionsInDivision,
  getCantonsInSubdivision,
  getNeighborhoodOrVillagesInCanton,
  getBlocksInNeighborhoodOrVillage,
  search,
  subdivision,
} from "cameroon-locations";

// Get divisions in a region
const divisions = getDivisionsInRegion("Centre");

// Get subdivisions in a division
const subdivisions = getSubdivisionsInDivision("Mfoundi");

// Get cantons in a subdivision
const cantons = getCantonsInSubdivision("Yaoundé I");

// Enhanced search with type filtering
const results = search("Yaoundé", {
  limit: 10,
  types: ["region", "subdivision"],
});

// Direct subdivision access
const yaounde1 = subdivision("Yaoundé I");
```

### Error Handling & Navigation

Robust error handling and hierarchy navigation

```typescript
import {
  region,
  getNeighborhoodOrVillageByCode,
  getCantonOfNeighborhoodOrVillage,
  NotFoundError,
} from "cameroon-locations";

try {
  // Navigate hierarchy safely
  const centre = region("Centre");
  const mfoundi = centre?.division("Mfoundi");
  const yaounde1 = mfoundi?.subdivision("Yaoundé I");
  const canton = yaounde1?.canton("Yaoundé I");

  // Find parent hierarchy
  const neighborhood = getNeighborhoodOrVillageByCode(123456);
  const parentCanton = getCantonOfNeighborhoodOrVillage("Centre Administratif");

  console.log(`${neighborhood?.name} → ${parentCanton?.name} → ${centre?.name}`);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Location not found:", error.message);
  }
}
```

### Bilingual & Multi-Code Support

Comprehensive language and coding system support

```typescript
import { region, division } from "cameroon-locations";

// Multiple ways to find the same region
const centre1 = region("Centre"); // By French name
const centre2 = region("02"); // By numeric code
const centre3 = region("CM.CE"); // By HASC code
const centre4 = region("CMR002"); // By P-code

// Bilingual access
console.log(centre1?.nameFr); // "Centre"
console.log(centre1?.nameEn); // "Centre"
console.log(centre1?.name); // "Centre" (defaults to French)
console.log(centre1?.getName("en")); // "Centre"

// Get all codes
console.log(centre1?.getAllCodes());
// { code: 2, hasc: "CM.CE", pcode: "CMR002" }

// Works for Adamawa/Adamaoua region too
const adamawa1 = region("Adamaoua"); // French name
const adamawa2 = region("Adamawa"); // English name
const adamawa3 = region("01"); // Numeric code
```

### Canton Types & Population Data

Work with canton classifications and demographic information

```typescript
import {
  getCityCantons,
  getRuralCantons,
  getTraditionalCantons,
  getNeighborhoodOrVillagesWithPopulation,
  neighborhoodOrVillage,
} from "cameroon-locations";

// Get cantons by type
const cityCantons = getCityCantons();
const ruralCantons = getRuralCantons();
const traditionalCantons = getTraditionalCantons();

// Population data access
const withPopulation = getNeighborhoodOrVillagesWithPopulation();
const centreAdmin = neighborhoodOrVillage("Centre Administratif");
console.log(centreAdmin?.population?.total); // Population count if available
```

### TypeScript Support

Full type safety with comprehensive interfaces

```typescript
interface Region {
  code: number;
  nameFr: string;
  nameEn: string;
  hasc?: string;
  pcode?: string;
  readonly name: string;
}

interface SearchResult {
  type: "region" | "division" | "subdivision" | "canton" | "neighborhoodOrVillage" | "block";
  item: Region | Division | Subdivision | Canton | NeighborhoodOrVillage | Block;
}

const results: SearchResult[] = search("Yaoundé", {
  limit: 10,
  types: ["region", "subdivision"],
});
```

## API Reference

### Wrapper Functions

#### `region(nameOrCode: string | number): RegionWrapper | undefined`

Find a region by any identifier (name, code, HASC, P-code). Returns a wrapper with chainable
methods.

#### `division(nameOrCode: string | number): DivisionWrapper | undefined`

Find a division by any identifier. Returns a wrapper with chainable methods.

#### `subdivision(nameOrCode: string | number): SubdivisionWrapper | undefined`

Find a subdivision by any identifier. Returns a wrapper with chainable methods.

#### `canton(nameOrCode: string | number): CantonWrapper | undefined`

Find a canton by any identifier. Returns a wrapper with chainable methods.

#### `neighborhoodOrVillage(nameOrCode: string | number): NeighborhoodOrVillageWrapper | undefined`

Find a neighborhood or village by any identifier. Returns a wrapper with chainable methods.

#### `block(nameOrCode: string | number): BlockWrapper | undefined`

Find a block by any identifier. Returns a wrapper with chainable methods.

### Data Access Functions

#### `getRegions(): Region[]`

Returns all regions in Cameroon.

#### `getDivisions(): Division[]`

Returns all divisions in Cameroon.

#### `getSubdivisions(): Subdivision[]`

Returns all subdivisions in Cameroon.

#### `getCantons(): Canton[]`

Returns all cantons in Cameroon.

#### `getNeighborhoodOrVillages(): NeighborhoodOrVillage[]`

Returns all neighborhoods and villages in Cameroon.

#### `getBlocks(): Block[]`

Returns all blocks in Cameroon.

### Hierarchical Query Functions

#### `getDivisionsInRegion(regionNameOrCode: string): Division[]`

Get all divisions in a specific region.

#### `getSubdivisionsInDivision(divisionNameOrCode: string): Subdivision[]`

Get all subdivisions in a specific division.

#### `getCantonsInSubdivision(subdivisionNameOrCode: string): Canton[]`

Get all cantons in a specific subdivision.

#### `getNeighborhoodOrVillagesInCanton(cantonNameOrCode: string): NeighborhoodOrVillage[]`

Get all neighborhoods and villages in a specific canton.

#### `getBlocksInNeighborhoodOrVillage(neighborhoodOrVillageNameOrCode: string): Block[]`

Get all blocks in a specific neighborhood or village.

### Cross-Level Relationships

#### `getSubdivisionsInRegion(regionNameOrCode: string): Subdivision[]`

Get all subdivisions in a specific region (across divisions).

#### `getCantonsInDivision(divisionNameOrCode: string): Canton[]`

Get all cantons in a specific division (across subdivisions).

#### `getCantonsInRegion(regionNameOrCode: string): Canton[]`

Get all cantons in a specific region (across divisions and subdivisions).

### Parent Lookup Functions

#### `getRegionOfDivision(divisionNameOrCode: string): Region | undefined`

Get the parent region of a division.

#### `getDivisionOfSubdivision(subdivisionNameOrCode: string): Division | undefined`

Get the parent division of a subdivision.

#### `getSubdivisionOfCanton(cantonNameOrCode: string): Subdivision | undefined`

Get the parent subdivision of a canton.

#### `getCantonOfNeighborhoodOrVillage(neighborhoodOrVillageNameOrCode: string): Canton | undefined`

Get the parent canton of a neighborhood or village.

#### `getNeighborhoodOrVillageOfBlock(blockNameOrCode: string): NeighborhoodOrVillage | undefined`

Get the parent neighborhood or village of a block.

### Canton Type Methods

#### `getCityCantons(): Canton[]`

Get all city-type cantons.

#### `getRuralCantons(): Canton[]`

Get all rural-type cantons.

#### `getTraditionalCantons(): Canton[]`

Get all traditional cantons (lamidat, sultanate, chiefdom).

#### `getCantonsByType(type: CantonType): Canton[]`

Get cantons by specific type.

### Population Methods

#### `getNeighborhoodOrVillagesWithPopulation(): NeighborhoodOrVillage[]`

Get all neighborhoods and villages that have population data.

### Search Functions

#### `search(query: string, options?: SearchOptions): SearchResult[]`

Search across all administrative divisions (bilingual).

```typescript
interface SearchOptions {
  limit?: number; // Maximum results (default: 10)
  types?: SearchType[]; // Filter by types
  language?: Language | "both"; // Language preference
}
```

#### `searchByType(query: string, type: SearchType, limit?: number): SearchResult[]`

Search within a specific administrative type.

### Individual Lookup Functions

#### `getRegionByCode(code: string | number): Region | undefined`

Get region by any code type (numeric, HASC, P-code).

#### `getDivisionByCode(code: string | number): Division | undefined`

Get division by any code type.

#### `getSubdivisionByCode(code: string | number): Subdivision | undefined`

Get subdivision by any code type.

#### `getCantonByCode(code: string | number): Canton | undefined`

Get canton by code.

#### `getNeighborhoodOrVillageByCode(code: string | number): NeighborhoodOrVillage | undefined`

Get neighborhood or village by code.

#### `getBlockByCode(code: string | number): Block | undefined`

Get block by code.

### Wrapper Methods

Each wrapper (RegionWrapper, DivisionWrapper, SubdivisionWrapper, CantonWrapper,
NeighborhoodOrVillageWrapper, BlockWrapper) provides:

- `getName(language?: Language): string` - Get name in specific language ('fr' or 'en')
- `getAllCodes(): object` - Get all available codes
- Navigation methods (e.g., `region.divisions()`, `canton.neighborhoodsOrVillages()`,
  `block.region()`)
- Chainable lookup methods (e.g., `region.division("name")`, `canton.neighborhoodOrVillage("name")`)

## Types

```typescript
interface Region {
  nameFr: string; // French name
  nameEn: string; // English name
  code: number; // Numeric code (e.g., 2)
  hasc?: string; // HASC code (e.g., "CM.CE")
  pcode?: string; // P-code (e.g., "CMR002")
  readonly name: string; // Computed property (returns nameFr)
}

interface Division {
  nameFr: string; // French name
  nameEn: string; // English name
  code: number; // Numeric code
  hasc?: string; // HASC code (e.g., "CM.CE.MF")
  pcode?: string; // P-code (e.g., "CMR002007")
  region: string; // Parent region name (French)
  regionCode: number; // Parent region code
  readonly name: string; // Computed property (returns nameFr)
}

interface Subdivision {
  nameFr: string; // French name
  nameEn: string; // English name
  councilNameFr?: string; // French council name (optional)
  councilNameEn?: string; // English council name (optional)
  code: number; // Numeric code
  hasc?: string; // HASC code (optional)
  pcode?: string; // P-code (optional)
  division: string; // Parent division name (French)
  divisionCode: number; // Parent division code
  readonly name: string; // Computed property (returns nameFr)
}

interface Canton {
  nameFr: string; // French name
  nameEn: string; // English name
  code: number; // Numeric code
  type: CantonType; // Canton type
  subdivision: string; // Parent subdivision name (French)
  subdivisionCode: number; // Parent subdivision code
  readonly name: string; // Computed property (returns nameFr)
}

interface NeighborhoodOrVillage {
  nameFr: string; // French name
  nameEn: string; // English name
  code: number; // Numeric code
  type: string; // Type (neighborhood/village/locality)
  population?: PopulationData; // Optional population data
  canton: string; // Parent canton name (French)
  cantonCode: number; // Parent canton code
  readonly name: string; // Computed property (returns nameFr)
}

interface Block {
  nameFr: string; // French name
  nameEn: string; // English name
  code: number; // Numeric code
  neighborhoodOrVillage: string; // Parent neighborhood/village name (French)
  neighborhoodOrVillageCode: number; // Parent neighborhood/village code
  readonly name: string; // Computed property (returns nameFr)
}

interface PopulationData {
  total: number;
  male: number;
  female: number;
}

interface SearchResult {
  type: "region" | "division" | "subdivision" | "canton" | "neighborhoodOrVillage" | "block";
  item: Region | Division | Subdivision | Canton | NeighborhoodOrVillage | Block;
}

type SearchType =
  | "region"
  | "division"
  | "subdivision"
  | "canton"
  | "neighborhoodOrVillage"
  | "block";
type CantonType =
  | "city"
  | "rural"
  | "group"
  | "lamidat"
  | "sultanate"
  | "sector"
  | "chiefdom"
  | "canton";
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

- **Yaoundé** (Capital): Centre Region → Mfoundi Division → Yaoundé I-VII Subdivisions → Yaoundé I
  Canton → Centre Administratif NeighborhoodOrVillage → Bloc A Block
- **Douala** (Economic Capital): Littoral Region → Wouri Division → Douala I-VI Subdivisions →
  Douala I Canton → Akwa NeighborhoodOrVillage → Akwa Centre Block
- **Bamenda**: Northwest Region → Mezam Division → Bamenda I-III Subdivisions → Bamenda Centre
  Canton → Centre Commercial Bamenda NeighborhoodOrVillage

### Canton Types

The library supports different types of cantons reflecting Cameroon's diverse administrative
structure:

- **City Cantons** (`city`): Urban administrative units in major cities
- **Rural Cantons** (`rural`): Rural administrative areas
- **Traditional Cantons**:
  - **Lamidat** (`lamidat`): Traditional Islamic administrative units
  - **Sultanate** (`sultanate`): Traditional sultanate territories
  - **Chiefdom** (`chiefdom`): Traditional chiefdom areas
  - **Group** (`group`): Traditional community groupings
  - **Sector** (`sector`): Administrative sectors
  - **Canton** (`canton`): General canton classification

### Population Data

Neighborhoods and villages can include optional population statistics:

```typescript
const centreAdmin = neighborhoodOrVillage("Centre Administratif");
console.log(centreAdmin?.population?.total); // Total population if available
console.log(centreAdmin?.population?.male); // Male population
console.log(centreAdmin?.population?.female); // Female population
```

## Bilingual Support

This package provides comprehensive bilingual support for French and English:

### Language Access

```typescript
const region = region("Centre");

// Direct property access
console.log(region?.nameFr); // "Centre"
console.log(region?.nameEn); // "Centre"
console.log(region?.name); // "Centre" (defaults to French)

// Method access with language parameter
console.log(region?.getName("fr")); // "Centre"
console.log(region?.getName("en")); // "Centre"
console.log(region?.getName()); // "Centre" (defaults to French)
```

### Bilingual Search

Search works across both French and English names:

```typescript
// These will all find Yaoundé-related locations
const results1 = search("Yaoundé"); // French name
const results2 = search("Yaounde"); // English variant
const results3 = search("Adamaoua"); // French name
const results4 = search("Adamawa"); // English name
```

### Multiple Code Systems

The package supports multiple coding systems used in Cameroon:

```typescript
const region1 = region("02"); // Numeric code
const region2 = region("CM.CE"); // HASC (Hierarchical Administrative Subdivision Codes)
const region3 = region("CMR002"); // P-codes (Place codes)

// Get all codes for a location
console.log(region1?.getAllCodes());
// Output: { code: 2, hasc: "CM.CE", pcode: "CMR002" }
```

## Extensions

### Electoral Data (ELECAM Integration)

Access electoral polling station data for subdivisions:

```typescript
const subdivision = subdivision("Yaoundé I");
const electoralData = subdivision?.getElectoralData();
// Returns polling stations and voter statistics if available
```

### GeoJSON Integration

Access geographic boundary data:

```typescript
const region = region("Centre");
const geoData = region?.getGeoJson();
// Returns GeoJSON feature with geographic boundaries if available
```

## Examples

Check out the `examples/` directory for complete usage examples including:

- 6-level administrative hierarchy navigation
- Canton type filtering and population data access
- Bilingual search functionality across all levels
- Multiple code system usage
- HTML/JavaScript integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Data Sources

Administrative division data is based on official Cameroonian government sources and may be updated
periodically to reflect administrative changes.
