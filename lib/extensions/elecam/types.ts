/**
 * ELECAM Electoral Data Types
 */

export interface ElectoralMetadata {
  version: string;
  generatedAt: string;
  totalCouncils: number;
  totalCenters: number;
  totalStations: number;
  totalVoters: number;
  coverage: string;
  source: string;
}

export interface PollingStation {
  stationName: string;
  voterCount: number;
}

export interface PollingCenter {
  centerName: string;
  totalVoters: number;
  stations: PollingStation[];
}

export interface Council {
  subdivisionCode: number;
  councilName: string;
  totalVoters: number;
  totalCenters: number;
  totalStations: number;
  votersPerStation: number;
  pollingCenters: PollingCenter[];
}

export interface ElectoralData {
  metadata: ElectoralMetadata;
  councils: Council[];
}

export interface VoterStats {
  totalVoters: number;
  totalCenters: number;
  totalStations: number;
  votersPerStation: number;
}
