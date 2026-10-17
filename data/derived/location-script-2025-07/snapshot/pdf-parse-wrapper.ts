/**
 * Bun-compatible pdf-parse wrapper that avoids the problematic debug mode.
 * 
 * This wrapper directly imports the core pdf-parse functionality without 
 * running the debug code in the main module.
 */

// Import the PDF parsing function directly from the core implementation
// and bypass the problematic auto-executing debug code
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

/**
 * Parse a PDF file using the pdf-parse library
 * @param dataBuffer A Buffer or ArrayBuffer containing the PDF data
 * @returns An object with the parsed PDF data
 */
async function parsePdf(dataBuffer: Buffer | ArrayBuffer): Promise<any> {
  // Ensure we have a Buffer (pdf-parse expects a Buffer)
  const buffer = dataBuffer instanceof ArrayBuffer 
    ? Buffer.from(dataBuffer) 
    : dataBuffer;
    
  try {
    return await pdfParse(buffer);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default parsePdf;