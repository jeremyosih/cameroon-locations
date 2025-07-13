# 🇨🇲 Cameroon Locations

A comprehensive and intuitive TypeScript package for working with Cameroonian administrative
divisions including the complete hierarchy: **Regions → Divisions → Subdivisions → Districts**.

## Features

- 🏗️ **Complete Administrative Hierarchy** - Region → Division → Subdivision → District
- 🔍 **Intuitive API** for navigating Cameroon's administrative hierarchy
- 🔎 **Search capabilities** across all administrative levels
- 🧩 **TypeScript support** with full type definitions
- 🚀 **Lightning-fast performance** with optimized Maps and pre-computed relationships
- 📊 **Complete data** for all 10 regions, 58 divisions, subdivisions, and districts
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
│       └── District (smallest units)
```

## Usage

### Basic Usage

```typescript
import { CameroonLocations } from "cameroon-locations";

// Get all regions
const regions = CameroonLocations.getRegions();
console.log(regions); // Array of all 10 regions

// Find a specific region
const centre = CameroonLocations.getRegion("Centre");
console.log(centre); // { code: 'CE', name: 'Centre' }

// Get divisions in a region
const centreDivisions = CameroonLocations.getDivisionsByRegion("Centre");
console.log(centreDivisions); // Array of divisions in Centre region

// Get subdivisions in a division
const mfoundiSubdivisions = CameroonLocations.getSubdivisionsByDivision("Mfoundi");
console.log(mfoundiSubdivisions); // Array of subdivisions in Mfoundi division

// Search across all administrative levels
const results = CameroonLocations.search("Yaoundé");
console.log(results); // Array of search results containing 'Yaoundé'

// Search by specific type
const regionResults = CameroonLocations.searchByType("region", "Centre");
console.log(regionResults); // Array of regions matching 'Centre'
```

### Advanced Usage

```typescript
// Get the region of a division
const region = CameroonLocations.getRegionOfDivision("Mfoundi");
console.log(region); // Centre region

// Get the division of a subdivision
const division = CameroonLocations.getDivisionOfSubdivision("Yaoundé I");
console.log(division); // Mfoundi division

// Get districts in a subdivision
const districts = CameroonLocations.getDistrictsBySubdivision("Yaoundé I");
console.log(districts); // Array of districts in Yaoundé I

// Search with limit
const limitedResults = CameroonLocations.search("a", 5);
console.log(limitedResults); // Maximum 5 results
```

## API Reference

### Static Methods

#### `getRegions(): Region[]`

Returns all regions in Cameroon.

#### `getRegion(identifier: string): Region`

Find a region by code or name. Throws error if not found.

#### `getDivisions(): Division[]`

Returns all divisions in Cameroon.

#### `getDivision(identifier: string): Division`

Find a division by code or name. Throws error if not found.

#### `getSubdivisions(): Subdivision[]`

Returns all subdivisions in Cameroon.

#### `getSubdivision(identifier: string): Subdivision`

Find a subdivision by code or name. Throws error if not found.

#### `getDistricts(): District[]`

Returns all districts in Cameroon.

#### `getDistrict(identifier: string): District`

Find a district by code or name. Throws error if not found.

#### `getDivisionsByRegion(regionIdentifier: string): Division[]`

Get all divisions in a specific region.

#### `getSubdivisionsByDivision(divisionIdentifier: string): Subdivision[]`

Get all subdivisions in a specific division.

#### `getDistrictsBySubdivision(subdivisionIdentifier: string): District[]`

Get all districts in a specific subdivision.

#### `search(query: string, limit?: number): SearchResult[]`

Search across all administrative divisions.

#### `searchByType(type: SearchType, query: string, limit?: number): SearchResult[]`

Search within a specific administrative type.

## Types

```typescript
interface Region {
  code: string;
  name: string;
}

interface Division {
  code: string;
  name: string;
  region: string;
}

interface Subdivision {
  code: string;
  name: string;
  division: string;
}

interface District {
  code: string;
  name: string;
  subdivision: string;
}

interface SearchResult {
  type: "region" | "division" | "subdivision" | "district";
  item: Region | Division | Subdivision | District;
}

type SearchType = "region" | "division" | "subdivision" | "district";
```

## Administrative Structure

### Regions (10)

- Adamawa (AD)
- Centre (CE)
- East (ES)
- Far North (EN)
- Littoral (LT)
- North (NO)
- Northwest (NW)
- South (SU)
- Southwest (SW)
- West (OU)

### Major Cities and Their Administrative Locations

- **Yaoundé** (Capital): Centre Region → Mfoundi Division → Yaoundé I-VII Subdivisions
- **Douala** (Economic Capital): Littoral Region → Wouri Division → Douala I-VI Subdivisions
- **Bamenda**: Northwest Region → Mezam Division → Bamenda I-III Subdivisions
- **Buea**: Southwest Region → Fako Division → Buea Subdivision

## Examples

Check out the `examples/` directory for complete usage examples including:

- Basic administrative hierarchy navigation
- Search functionality
- HTML/JavaScript integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Data Sources

Administrative division data is based on official Cameroonian government sources and may be updated
periodically to reflect administrative changes.
