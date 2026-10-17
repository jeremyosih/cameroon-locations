/**
 * Simple script to convert a PDF file to text
 * Usage: bun run pdf-to-text.ts <input-pdf-path> [output-text-path]
 * 
 * If output-text-path is not provided, it will use the input filename with .txt extension
 */

// Import core modules
import { basename, dirname, join } from "path";
import pdfParse from "./pdf-parse-wrapper";

/**
 * Extract text from a PDF file and save it to a text file
 */
async function pdfToText(pdfPath: string, outputPath?: string): Promise<string> {
  try {
    console.log(`Reading PDF file: ${pdfPath}`);
    
    // Check if PDF file exists
    const pdfFile = Bun.file(pdfPath);
    const exists = await pdfFile.exists();
    
    if (!exists) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
    
    // Read the PDF file
    const dataBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(dataBuffer);
    
    console.log("Parsing PDF content...");
    
    // Parse the PDF file
    const pdfData = await pdfParse(buffer);
    
    // Determine output path if not provided
    if (!outputPath) {
      const fileNameWithoutExt = basename(pdfPath, ".pdf");
      outputPath = join(dirname(pdfPath), `${fileNameWithoutExt}.txt`);
    }
    
    console.log(`Extracted ${pdfData.text.length} characters from PDF`);
    console.log(`Writing text to: ${outputPath}`);
    
    // Write the text to the output file
    await Bun.write(outputPath, pdfData.text);
    
    console.log("Conversion completed successfully!");
    return outputPath;
  } catch (error) {
    console.error("Error converting PDF to text:", error);
    throw error;
  }
}

// Simplified JSON location structure generator
async function generateLocationSample() {
  try {
    // Just create a representative sample JSON structure
    const sampleLocations: { [key: string]: any } = {
      "region_1": {
        englishName: "Adamaoua",
        name: "ADAMAOUA",
        geojson: {},
        createdBy: { source: "ADMIN" },
        position: 1,
        capital: false,
        locationId: 1,
        code: "",
        city: false,
        locationType: "REGION",
        parentLocationId: 0,
        population: 884289
      },
      "division_1": {
        englishName: "Djerem",
        name: "DJEREM",
        geojson: {},
        createdBy: { source: "ADMIN" },
        position: 1,
        capital: false,
        locationId: 1,
        code: "",
        city: false,
        locationType: "DIVISION",
        parentLocationId: 1,
        population: 124948
      },
      "district_1": {
        englishName: "Ngaoundal",
        name: "NGAOUNDAL",
        geojson: {},
        createdBy: { source: "ADMIN" },
        position: 1,
        capital: false,
        locationId: 1,
        code: "",
        city: false,
        locationType: "DISTRICT",
        parentLocationId: 1,
        population: 52867
      },
      "village_1": {
        englishName: "Ngaoundal Ville",
        name: "NGAOUNDAL VILLE",
        geojson: {},
        createdBy: { source: "ADMIN" },
        position: 1,
        capital: false,
        locationId: 1,
        code: "",
        city: true,
        locationType: "VILLAGE_OR_NEIGHBORHOOD",
        parentLocationId: 1,
        population: 25853
      },
      "locality_1": {
        englishName: "Baya Hadjida",
        name: "BAYA HADJIDA",
        geojson: {},
        createdBy: { source: "ADMIN" },
        position: 1,
        capital: false,
        locationId: 1,
        code: "",
        city: false,
        locationType: "LOCALITY_OR_BLOCK",
        parentLocationId: 1,
        population: 1949
      }
    };
    
    // Write the sample JSON file
    await Bun.write('./locations_format_sample.json', JSON.stringify(sampleLocations, null, 2));
    console.log("Created sample location JSON structure in locations_format_sample.json");
    
    return true;
  } catch (error) {
    console.error("Failed to generate location sample:", error);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  // Check if we should generate a sample JSON
  if (args.length > 0 && args[0] === "--sample") {
    await generateLocationSample();
    return;
  }
  
  if (args.length === 0) {
    console.error("Error: Please provide the path to the PDF file");
    console.error("Usage: bun run pdf-to-text.ts <input-pdf-path> [output-text-path]");
    console.error("       bun run pdf-to-text.ts --sample (to generate a sample JSON structure)");
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1]; // Optional
  
  try {
    const resultPath = await pdfToText(inputPath, outputPath);
    console.log(`✓ PDF converted to text: ${resultPath}`);
  } catch (error) {
    console.error("Failed to convert PDF to text:", error);
    process.exit(1);
  }
}

// Run the main function
main();