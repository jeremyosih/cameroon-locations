# location-script

A script to extract and process hierarchical location data from a PDF document. The script extracts text from the PDF, parses regions, divisions, districts, villages, and localities with their population data, and generates a structured JSON output.

## Installation

To install dependencies:

```bash
bun install
```

## Usage

Run the script by providing the path to the PDF file as a command-line argument:

```bash
bun run index.ts /path/to/your/pdf/file.pdf
```

For example, to process the included PDF:

```bash
bun run index.ts ./loc.pdf
```

## Output

The script will:

1. Extract text from the PDF
2. Parse the hierarchical structure
3. Create a `locations.json` file with the structured data
4. Print summary statistics to the console, including:
   - Location count by type
   - Population summary by region
   - Data validation statistics

## Requirements

This project requires [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.
