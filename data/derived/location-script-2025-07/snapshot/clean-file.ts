import { basename, extname } from "path";

async function cleanFile(inputPath: string) {
  try {
    // Get the file name without extension and the extension
    const ext = extname(inputPath);
    const baseNameWithoutExt = basename(inputPath, ext);
    const outputPath = `${baseNameWithoutExt}_cleaned${ext}`;

    // Verify the input file exists
    const file = Bun.file(inputPath);
    const exists = await file.exists();
    if (!exists) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    // Read the file content
    const content = await file.text();
    if (!content || content.length === 0) {
      throw new Error("Input file is empty");
    }

    // Split content into lines and filter out page number lines
    const lines = content.split('\n');
    const cleanedLines = lines.filter(line => {
      // Skip lines that only contain "Page" followed by a number
      return !(/^\s*Page\s+\d+\s*$/).test(line);
    });

    // Join cleaned lines and write to output file
    const cleanedContent = cleanedLines.join('\n');
    await Bun.write(outputPath, cleanedContent);

    console.log(`Cleaned file saved to ${outputPath}`);
  } catch (error) {
    console.error("Error cleaning file:", error);
    throw error;
  }
}

// Get input file from command line argument
const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Please provide an input file path");
  process.exit(1);
}

// Run the cleaning function
cleanFile(inputFile).catch(error => {
  console.error("Error in execution:", error);
  process.exit(1);
}); 