import assert from 'assert';

// Function to clean the loc.txt file
async function cleanLocFile() {
  const inputPath = './locv2.txt';
  const outputPath = './cleaned-loc.txt';

  try {
    // Verify the input file exists
    const file = Bun.file(inputPath);
    const exists = await file.exists();
    assert(exists, `Input file does not exist: ${inputPath}`);

    // Read the file content
    const content = await file.text();
    assert(content && content.length > 0, "Input file is empty");

    // Split content into lines
    const lines = content.split('\n');

    // Define patterns to remove
    const footerPatterns = [
      /^BUCREP, \d+$/,
      /^ème$/,
      /^RGPH 2005 – Répertoire actualisé des villages du Cameroun$/,
      /^Page \d+$/,
      /^Page/
    ];
    const headerPattern = /Quartiers \/ Villages|Sexe|Total Masculin Féminin/;

    // Filter lines
    const cleanedLines = [];
    let skipLines = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`Processing line: ${line}`); // Debugging output

      // Check for footer patterns
      if (footerPatterns.some(pattern => pattern.test(line))) {
        console.log(`Skipping footer line: ${line}`); // Debugging output
        skipLines = true;
        continue;
      }

      // If a footer line was detected, skip subsequent lines until a non-footer line is found
      if (skipLines) {
        if (!footerPatterns.some(pattern => pattern.test(line))) {
          skipLines = false;
        } else {
          console.log(`Skipping subsequent footer line: ${line}`); // Debugging output
          continue;
        }
      }

      // Remove lines matching header patterns or empty lines
      if (headerPattern.test(line) || line.trim().length === 0) {
        console.log(`Skipping header or empty line: ${line}`); // Debugging output
        continue;
      }

      // Add the line to cleanedLines if it doesn't match any patterns
      cleanedLines.push(line);
    }

    // Join cleaned lines and write to output file
    const cleanedContent = cleanedLines.join('\n');
    await Bun.write(outputPath, cleanedContent);

    console.log(`Cleaned file saved to ${outputPath}`);
  } catch (error) {
    console.error("Error cleaning file:", error);
    throw error;
  }
}

// Main function to execute the cleaning
async function main() {
  await cleanLocFile();
}

// Run the main function
main().catch(error => {
  console.error("Error in main execution:", error);
  process.exit(1);
});