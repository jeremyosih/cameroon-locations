# 🇰🇪 Kenya Locations

A comprehensive and intuitive TypeScript package for working with Kenyan administrative divisions (counties, sub-counties, constituencies, and wards).

[![Tested with Vitest](https://img.shields.io/badge/Tested_With-Vitest-6E9F18.svg)](https://vitest.dev)
[![Test Coverage](https://img.shields.io/badge/Test_Coverage-100%25-brightgreen.svg)](https://github.com/davidamunga/kenya-locations)

## Author

**David Amunga**  
Website: [https://davidamunga.com](https://davidamunga.com)

## Features

- 🔍 **Intuitive chainable API** for navigating Kenya's administrative hierarchy
- 🔎 **Fuzzy search** capabilities across all administrative levels
- 🧩 **TypeScript support** with full type definitions
- 🚀 **Lightning-fast performance** with optimized Maps and pre-computed relationships
- 📊 **Complete data** for all 47 counties, their sub-counties, constituencies, and wards
- 📱 **Lightweight** with minimal dependencies
- 📖 **Well-documented** API with examples
- ✅ **Well-tested** with comprehensive unit tests

## Installation

```bash
npm install kenya-locations
```

## Usage

### Basic Usage

You can use the standalone functions directly:

```typescript
import {
  getAllCounties,
  county,
  getAllConstituencies,
  getConstituencyByCode,
  getAllWards,
  getWardByCode,
  getAllWardsInCounty,
  getCountyOfWard,
  search,
  getAllSubCounties,
  getSubCountyByCode,
  getSubCountiesInCounty,
  getCountyOfSubCounty,
  getWardsInSubCounty,
} from "kenya-locations";

// Get all counties
const allCounties = getAllCounties();

// Get a specific county by name or code
const mombasa = county("Mombasa"); // or county('001')

// Get all constituencies
const constituencies = getAllConstituencies();

// Get a specific constituency by code
const changamwe = getConstituencyByCode("290");

// Get all wards
const wards = getAllWards();

// Get a specific ward by code
const ward = getWardByCode("123");

// Get all wards in a county
const wardsInMombasa = getAllWardsInCounty("001");

// Get the county a ward belongs to
const wardCounty = getCountyOfWard("123");

// Search across all administrative levels
const results = search("Nairob", 10);

// Get all sub-counties
const allSubCounties = getAllSubCounties();

// Get a specific sub-county by code
const subCounty = getSubCountyByCode("123");

// Get all sub-counties in a county
const subCountiesInMombasa = getSubCountiesInCounty("001");

// Get the county a sub-county belongs to
const subCountyCounty = getCountyOfSubCounty("123");

// Get all wards in a sub-county
const wardsInSubCounty = getWardsInSubCounty("123");
```

### Chainable API

The package provides a chainable API for navigating the administrative hierarchy:

```typescript
import { county } from "kenya-locations";

// Get a county and its constituencies
const mombasa = county("Mombasa");
const constituencies = mombasa?.constituencies();

// Get a specific constituency in a county
const changamwe = mombasa?.constituency("Changamwe");

// Get wards in a constituency
const wards = changamwe?.wards();

// Get a specific ward in a constituency
const ward = changamwe?.ward("Port Reitz");
```

### Fuzzy Search

The package includes a powerful fuzzy search feature to find locations even with typos or partial matches:

```typescript
import { search } from "kenya-locations";

// Search across all administrative levels
const results = search("Nairob");
/*
Results:
[
  { type: 'county', item: { code: '047', name: 'Nairobi' } },
  { type: 'constituency', item: { code: '..', name: 'Nairobi North', countyCode: '047' } },
  { type: 'ward', item: { code: '...', name: 'Nairobi West', constituencyCode: '...' } },
  { type: 'sub-county', item: { code: '...', name: 'Nairobi West', countyCode: '047' } }
]
*/
```

### Utility Functions

```typescript
import {
  getAllWardsInCounty,
  getCountyOfWard,
  getWardsInConstituency,
  getCountyOfConstituency,
  getSubCountiesInCounty,
  getCountyOfSubCounty,
  getWardsInSubCounty,
} from "kenya-locations";

// Get all wards in a county
const wardsInMombasa = getAllWardsInCounty("001");

// Get the county a ward belongs to
const county = getCountyOfWard("0001");

// Get all wards in a constituency
const wardsInConstituency = getWardsInConstituency("290");

// Get the county a constituency belongs to
const constituencyCounty = getCountyOfConstituency("290");

// Get all sub-counties in a county
const subCountiesInMombasa = getSubCountiesInCounty("001");

// Get the county a sub-county belongs to
const subCountyCounty = getCountyOfSubCounty("001001");

// Get all wards in a sub-county
const wardsInSubCounty = getWardsInSubCounty("001001");
```

## Examples

The package includes several examples that demonstrate its usage:

- `examples/basic-usage.html`: A comprehensive example showing the basic functionality of the library in the browser
- More examples coming soon!

To run the examples:

```bash
# Clone the repository
git clone https://github.com/yourusername/kenya-locations.git

# Navigate to the project
cd kenya-locations

# Install dependencies
npm install

# Build the library
npm run build

# Serve the examples (using a simple HTTP server)
npx http-server examples
```

## API Reference

### Main Functions

- `getAllCounties()`: Get all counties
- `county(nameOrCode)`: Get a county by name or code
- `getAllConstituencies()`: Get all constituencies
- `getConstituencyByCode(code)`: Get a constituency by code
- `getAllWards()`: Get all wards
- `getWardByCode(code)`: Get a ward by code
- `getAllWardsInCounty(countyNameOrCode)`: Get all wards in a county
- `getCountyOfWard(wardCode)`: Get the county a ward belongs to
- `getWardsInConstituency(constituencyCode)`: Get all wards in a constituency
- `getCountyOfConstituency(constituencyCode)`: Get the county a constituency belongs to
- `getAllSubCounties()`: Get all sub-counties
- `getSubCountyByCode(code)`: Get a sub-county by code
- `getSubCountiesInCounty(countyCode)`: Get all sub-counties in a county
- `getCountyOfSubCounty(subCountyCode)`: Get the county a sub-county belongs to
- `getWardsInSubCounty(subCountyCode)`: Get all wards in a sub-county
- `search(query, limit?)`: Search across all administrative levels

### CountyWrapper Class

- `code`: Get the county code
- `name`: Get the county name
- `data`: Get all data for the county
- `constituencies()`: Get all constituencies in this county
- `constituency(nameOrCode)`: Get a constituency by name or code
- `wards()`: Get all wards in this county

### ConstituencyWrapper Class

- `code`: Get the constituency code
- `name`: Get the constituency name
- `countyCode`: Get the county code this constituency belongs to
- `data`: Get all data for the constituency
- `county()`: Get the county this constituency belongs to
- `wards()`: Get all wards in this constituency
- `ward(nameOrCode)`: Get a ward by name or code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Data Sources

The data in this package is sourced from official records of the Independent Electoral and Boundaries Commission (IEBC) of Kenya and the Kenya National Bureau of Statistics (KNBS).

## Acknowledgments

- The Independent Electoral and Boundaries Commission (IEBC) of Kenya
- Kenya National Bureau of Statistics (KNBS)
