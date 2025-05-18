# Changelog

All notable changes to the Kenya Locations package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4]

### Changed

- **BREAKING**: Renamed functions to remove "all" prefix:
  - `getAllCounties()` → `getCounties()`
  - `getAllSubCounties()` → `getSubCounties()`
  - `getAllWards()` → `getWards()`
  - `getAllConstituencies()` → `getConstituencies()`
  - `getAllWardsInCounty()` → `getWardsInCounty()`
- Updated all tests to use new function names
- Updated `Constituency` interface to use `county` object instead of `countyCode` string
- Updated constituency data structure to reference county objects directly
- Updated ConstituencyWrapper class with `getCounty()` method instead of `county()`
- Updated internal relationship maps and search utilities to support new constituency structure

### Fixed

- Fixed `getSubCountiesInCounty` to properly handle both county codes and names
- Improved sub-county lookup performance by using county maps


## [0.0.3]

### Added

- Comprehensive test suite for all functionality
- Test coverage for sub-counties and related functions
- Vitest setup for running tests
- Testing badges in README

### Changed

- **BREAKING**: Updated `SubCounty` interface to use `county` (name) instead of `countyCode`
- Updated sub-counties data structure to use county names directly
- Updated internal relationship maps to support new sub-county structure
- Enhanced README with sub-county functionality documentation
- Improved the implementation of `getSubCountiesInCounty` and `getCountyOfSubCounty` functions

### Fixed

- Fixed imports in test files

## [0.0.2]

Fixed Docs

## [0.0.1]

Initial public release.
