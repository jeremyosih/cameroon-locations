import { getElectoralDataBySubdivisionCode } from "./data";
import type { Council } from "./types";

/**
 * Get electoral data for a subdivision by its code
 */
export function getElectoralData(subdivisionCode: string): Council | undefined {
  return getElectoralDataBySubdivisionCode(subdivisionCode);
}



// Export types for external use
export type { 
  Council, 
  PollingCenter, 
  PollingStation, 
  VoterStats, 
  ElectoralData, 
  ElectoralMetadata 
} from "./types";

// Export data access
export { electoralData } from "./data";