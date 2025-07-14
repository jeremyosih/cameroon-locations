# 🇨🇲 Cameroon Locations

A comprehensive and intuitive TypeScript package for working with Cameroonian administrative
divisions including the complete 6-level hierarchy: **Regions → Divisions → Subdivisions → Cantons →
LocalAreas → Blocks**.

## Features

- 🏗️ **Complete Administrative Hierarchy** - Region → Division → Subdivision → Canton → LocalArea →
  Block
- 🌍 **Bilingual Support** - French and English names for all administrative divisions
- 🔢 **Multiple Code Systems** - Numeric codes, HASC codes, and P-codes support
- 🔍 **Intuitive API** for navigating Cameroon's administrative hierarchy
- 🔎 **Bilingual Search** capabilities across all administrative levels
- 🏛️ **Canton Type Support** - City, rural, traditional (lamidat/sultanate/chefferie) cantons
- 👥 **Population Data** - Optional population statistics for local areas
- 🧩 **TypeScript support** with full type definitions
- 🚀 **Lightning-fast performance** with optimized Maps and pre-computed relationships
- 📊 **Complete data** for all 10 regions, 58 divisions, subdivisions, cantons, local areas, and
  blocks
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
│           └── LocalArea (neighborhoods/villages/localities)
│               └── Block (smallest administrative units)
```

## Usage

### Basic Usage

```typescript
import { CameroonLocations, region } from "cameroon-locations";

// Get all administrative levels
const regions = CameroonLocations.getRegions();
const cantons = CameroonLocations.getCantons();
const localAreas = CameroonLocations.getLocalAreas();
const blocks = CameroonLocations.getBlocks();

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

// Get child administrative levels
const centreDivisions = CameroonLocations.getDivisionsInRegion("Centre");
const mfoundiSubdivisions = CameroonLocations.getSubdivisionsInDivision("Mfoundi");
const yaounde1Cantons = CameroonLocations.getCantonsInSubdivision("Yaoundé I");

// Search across all administrative levels (bilingual)
const results = CameroonLocations.search("Yaoundé");
console.log(results); // Searches both French and English names

// Search by specific type
const regionResults = CameroonLocations.searchByType("Centre", "region");
const cantonResults = CameroonLocations.searchByType("Yaoundé", "canton");
```

### Advanced Usage

```typescript
import { division, subdivision, canton, localArea, block } from "cameroon-locations";

// Chainable API for 6-level navigation
const centreRegion = region("Centre");
const mfoundiDivision = centreRegion.division("Mfoundi");
const yaounde1Subdivision = mfoundiDivision.subdivision("Yaoundé I");
const yaounde1Canton = yaounde1Subdivision.canton("Yaoundé I");
const centreAdminLocalArea = yaounde1Canton.localArea("Centre Administratif");
const blocA = centreAdminLocalArea.block("Bloc A");

// Navigate up the hierarchy
const regionFromBlock = blocA.region();
const cantonFromBlock = blocA.canton();
console.log(regionFromBlock.nameFr); // "Centre"
console.log(cantonFromBlock.type); // "city"

// Direct lookup with relationship functions
const region = CameroonLocations.getRegionOfDivision("Mfoundi");
const division = CameroonLocations.getDivisionOfSubdivision("Yaoundé I");
const subdivision = CameroonLocations.getSubdivisionOfCanton("Yaoundé I");
const canton = CameroonLocations.getCantonOfLocalArea("Centre Administratif");
const localArea = CameroonLocations.getLocalAreaOfBlock("Bloc A");

// Canton type filtering
const cityCantons = CameroonLocations.getCityCantons();
const ruralCantons = CameroonLocations.getRuralCantons();
const traditionalCantons = CameroonLocations.getTraditionalCantons();

// Population data access
const localAreasWithPopulation = CameroonLocations.getLocalAreasWithPopulation();
const centreAdmin = localArea("Centre Administratif");
console.log(centreAdmin.population?.total); // 15420

// Search with options
const limitedResults = CameroonLocations.search("Yaoundé", { limit: 5 });
const cantonOnly = CameroonLocations.search("Centre", { types: ["canton"] });

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

#### `canton(identifier: string): CantonWrapper | undefined`

Find a canton by any identifier. Returns a wrapper with chainable methods.

#### `localArea(identifier: string): LocalAreaWrapper | undefined`

Find a local area by any identifier. Returns a wrapper with chainable methods.

#### `block(identifier: string): BlockWrapper | undefined`

Find a block by any identifier. Returns a wrapper with chainable methods.

### Static Methods

#### `getRegions(): Region[]`

Returns all regions in Cameroon.

#### `getDivisions(): Division[]`

Returns all divisions in Cameroon.

#### `getSubdivisions(): Subdivision[]`

Returns all subdivisions in Cameroon.

#### `getCantons(): Canton[]`

Returns all cantons in Cameroon.

#### `getLocalAreas(): LocalArea[]`

Returns all local areas in Cameroon.

#### `getBlocks(): Block[]`

Returns all blocks in Cameroon.

#### `getDivisionsInRegion(regionIdentifier: string): Division[]`

Get all divisions in a specific region.

#### `getSubdivisionsInDivision(divisionIdentifier: string): Subdivision[]`

Get all subdivisions in a specific division.

#### `getCantonsInSubdivision(subdivisionIdentifier: string): Canton[]`

Get all cantons in a specific subdivision.

#### `getLocalAreasInCanton(cantonIdentifier: string): LocalArea[]`

Get all local areas in a specific canton.

#### `getBlocksInLocalArea(localAreaIdentifier: string): Block[]`

Get all blocks in a specific local area.

#### Canton Type Methods

#### `getCityCantons(): Canton[]`

Get all city-type cantons.

#### `getRuralCantons(): Canton[]`

Get all rural-type cantons.

#### `getTraditionalCantons(): Canton[]`

Get all traditional cantons (lamidat, sultanate, chefferie, groupement).

#### Population Methods

#### `getLocalAreasWithPopulation(): LocalArea[]`

Get all local areas that have population data.

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

Each wrapper (RegionWrapper, DivisionWrapper, CantonWrapper, LocalAreaWrapper, BlockWrapper)
provides:

- `getName(language?: Language): string` - Get name in specific language
- `getAllCodes(): object` - Get all available codes
- Navigation methods (e.g., `region.divisions()`, `canton.localAreas()`, `block.region()`)
- Chainable lookup methods (e.g., `region.division("name")`, `canton.localArea("name")`)

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

interface Canton {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "020701")
  type: CantonType; // Canton type (city/rural/traditional)
  subdivision: string; // Parent subdivision name (French)
  subdivisionCode: string; // Parent subdivision code
  get name(): string; // Computed property (returns nameFr)
}

interface LocalArea {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "02070101")
  type: LocalAreaType; // Type (quarter/village/locality)
  population?: PopulationData; // Optional population data
  canton: string; // Parent canton name (French)
  cantonCode: string; // Parent canton code
  get name(): string; // Computed property (returns nameFr)
}

interface Block {
  nameFr: string; // French name
  nameEn: string; // English name
  code: string; // Numeric code (e.g., "0207010101")
  localArea: string; // Parent local area name (French)
  localAreaCode: string; // Parent local area code
  get name(): string; // Computed property (returns nameFr)
}

interface PopulationData {
  total: number;
  male: number;
  female: number;
}

interface SearchResult {
  type: "region" | "division" | "subdivision" | "canton" | "localArea" | "block";
  item: Region | Division | Subdivision | Canton | LocalArea | Block;
}

type SearchType = "region" | "division" | "subdivision" | "canton" | "localArea" | "block";
type CantonType = "city" | "rural" | "lamidat" | "sultanate" | "chefferie" | "groupement";
type LocalAreaType = "neighborhood" | "village" | "locality";
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
  Canton → Centre Administratif LocalArea → Bloc A Block
- **Douala** (Economic Capital): Littoral Region → Wouri Division → Douala I-VI Subdivisions →
  Douala I Canton → Akwa LocalArea → Akwa Centre Block
- **Bamenda**: Northwest Region → Mezam Division → Bamenda I-III Subdivisions → Bamenda Centre
  Canton → Centre Commercial Bamenda LocalArea

### Canton Types

The library supports different types of cantons reflecting Cameroon's diverse administrative
structure:

- **City Cantons** (`city`): Urban administrative units in major cities
- **Rural Cantons** (`rural`): Rural administrative areas
- **Traditional Cantons**:
  - **Lamidat** (`lamidat`): Traditional Islamic administrative units
  - **Sultanate** (`sultanate`): Traditional sultanate territories
  - **Chefferie** (`chefferie`): Traditional chiefdom areas
  - **Groupement** (`groupement`): Traditional community groupings

### Population Data

Local areas can include optional population statistics:

```typescript
const centreAdmin = localArea("Centre Administratif");
console.log(centreAdmin.population?.total); // 15420
console.log(centreAdmin.population?.male); // 7650
console.log(centreAdmin.population?.female); // 7770
```

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

## Migration from v1.x to v2.0

**⚠️ Breaking Changes**: Version 2.0 introduces a new 6-level administrative hierarchy. The old
4-level District system has been replaced with the new Canton → LocalArea → Block structure.

### What Changed

- **Removed**: All District-related functionality
- **Added**: Canton, LocalArea, and Block administrative levels
- **Enhanced**: Canton type support (city/rural/traditional)
- **Added**: Optional population data for LocalAreas

### Migration Guide

```typescript
// ❌ v1.x - Districts no longer exist
const district = district("Centre Administratif"); // Will return undefined

// ✅ v2.0 - Use LocalAreas and Blocks instead
const localArea = localArea("Centre Administratif");
const block = block("Bloc A");

// ❌ v1.x - District methods removed
const districts = getDistricts(); // Method no longer exists
const districtsInSubdivision = getDistrictsInSubdivision("Yaoundé I"); // Removed

// ✅ v2.0 - Use new 6-level methods
const cantons = getCantons();
const localAreas = getLocalAreas();
const blocks = getBlocks();
const cantonsInSubdivision = getCantonsInSubdivision("Yaoundé I");
const localAreasInCanton = getLocalAreasInCanton("Yaoundé I");
const blocksInLocalArea = getBlocksInLocalArea("Centre Administratif");

// ✅ Still works - Core functionality maintained
const regionName = region("Centre").name;
const divisions = getDivisionsInRegion("Centre");
const results = search("Yaoundé");
```

### New Features in v2.0

```typescript
// Canton type filtering
const cityCantons = getCityCantons();
const traditionalCantons = getTraditionalCantons();

// Population data access
const localAreasWithPopulation = getLocalAreasWithPopulation();
const population = localArea("Centre Administratif").population;

// 6-level navigation
const block = region("Centre")
  .division("Mfoundi")
  .subdivision("Yaoundé I")
  .canton("Yaoundé I")
  .localArea("Centre Administratif")
  .block("Bloc A");
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
