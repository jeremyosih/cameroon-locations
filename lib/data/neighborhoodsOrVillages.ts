import type { NeighborhoodOrVillageData } from "../types";

export const neighborhoodsOrVillages: NeighborhoodOrVillageData[] = [
  // NeighborhoodsOrVillages for Yaoundé I Canton - urban neighborhoods
  {
    nameFr: "Centre Administratif",
    nameEn: "Administrative Center",
    code: "02070101",
    type: "neighborhood",
    population: {
      total: 15420,
      male: 7650,
      female: 7770,
    },
    canton: "Yaoundé I",
    cantonCode: "020701",
  },
  {
    nameFr: "Centre Ville",
    nameEn: "City Center",
    code: "02070102",
    type: "neighborhood",
    population: {
      total: 22350,
      male: 11200,
      female: 11150,
    },
    canton: "Yaoundé I",
    cantonCode: "020701",
  },
  {
    nameFr: "Nlongkak",
    nameEn: "Nlongkak",
    code: "02070103",
    type: "neighborhood",
    population: {
      total: 18750,
      male: 9400,
      female: 9350,
    },
    canton: "Yaoundé I",
    cantonCode: "020701",
  },

  // NeighborhoodsOrVillages for Yaoundé II Canton
  {
    nameFr: "Tsinga",
    nameEn: "Tsinga",
    code: "02070201",
    type: "neighborhood",
    population: {
      total: 12890,
      male: 6445,
      female: 6445,
    },
    canton: "Yaoundé II",
    cantonCode: "020702",
  },
  {
    nameFr: "Emana",
    nameEn: "Emana",
    code: "02070202",
    type: "neighborhood",
    population: {
      total: 9650,
      male: 4825,
      female: 4825,
    },
    canton: "Yaoundé II",
    cantonCode: "020702",
  },

  // NeighborhoodsOrVillages for Bamenda Centre Canton
  {
    nameFr: "Centre Commercial Bamenda",
    nameEn: "Bamenda Commercial Center",
    code: "01030101",
    type: "neighborhood",
    population: {
      total: 2847,
      male: 1423,
      female: 1424,
    },
    canton: "Bamenda Centre",
    cantonCode: "010301",
  },

  // NeighborhoodsOrVillages for Douala I Canton - urban neighborhoods
  {
    nameFr: "Akwa",
    nameEn: "Akwa",
    code: "05050101",
    type: "neighborhood",
    population: {
      total: 45200,
      male: 22600,
      female: 22600,
    },
    canton: "Douala I",
    cantonCode: "050501",
  },
  {
    nameFr: "Bonanjo",
    nameEn: "Bonanjo",
    code: "05050102",
    type: "neighborhood",
    population: {
      total: 38750,
      male: 19375,
      female: 19375,
    },
    canton: "Douala I",
    cantonCode: "050501",
  },

  // NeighborhoodsOrVillages for Douala II Canton
  {
    nameFr: "New Bell",
    nameEn: "New Bell",
    code: "05050201",
    type: "neighborhood",
    population: {
      total: 52300,
      male: 26150,
      female: 26150,
    },
    canton: "Douala II",
    cantonCode: "050502",
  },
  {
    nameFr: "Deido",
    nameEn: "Deido",
    code: "05050202",
    type: "neighborhood",
    population: {
      total: 41200,
      male: 20600,
      female: 20600,
    },
    canton: "Douala II",
    cantonCode: "050502",
  },

  // Rural/traditional examples
  {
    nameFr: "Bafou Centre",
    nameEn: "Bafou Center",
    code: "08010101",
    type: "village",
    population: {
      total: 2100,
      male: 1050,
      female: 1050,
    },
    canton: "Groupement Bafou",
    cantonCode: "080101",
  },
  {
    nameFr: "Bali Centre",
    nameEn: "Bali Center",
    code: "08010201",
    type: "village",
    population: {
      total: 3500,
      male: 1750,
      female: 1750,
    },
    canton: "Chefferie de Bali",
    cantonCode: "080102",
  },

  // Example without population data
  {
    nameFr: "Zone Traditionnelle",
    nameEn: "Traditional Zone",
    code: "08020101",
    type: "locality",
    // No population data available
    canton: "Groupement Traditionnel",
    cantonCode: "080201",
  },
];
