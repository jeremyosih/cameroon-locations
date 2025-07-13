import type { Subdivision } from "../types";

export const subdivisions: Subdivision[] = [
  // Subdivisions for Mfoundi Division (Yaoundé area) - ordered alphabetically by French name
  {
    nameFr: "Yaoundé I",
    nameEn: "Yaounde I",
    code: "020701",
    hasc: "CM.CE.MF.Y1",
    pcode: "CMR002007001",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé II",
    nameEn: "Yaounde II",
    code: "020702",
    hasc: "CM.CE.MF.Y2",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé III",
    nameEn: "Yaounde III",
    code: "020703",
    hasc: "CM.CE.MF.Y3",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé IV",
    nameEn: "Yaounde IV",
    code: "020704",
    hasc: "CM.CE.MF.Y4",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé V",
    nameEn: "Yaounde V",
    code: "020705",
    hasc: "CM.CE.MF.Y5",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé VI",
    nameEn: "Yaounde VI",
    code: "020706",
    hasc: "CM.CE.MF.Y6",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Yaoundé VII",
    nameEn: "Yaounde VII",
    code: "020707",
    hasc: "CM.CE.MF.Y7",
    division: "Mfoundi",
    divisionCode: "0207",
    get name() {
      return this.nameFr;
    },
  },

  // Subdivisions for Wouri Division (Douala area) - ordered alphabetically by French name
  {
    nameFr: "Douala I",
    nameEn: "Douala I",
    code: "050401",
    hasc: "CM.LT.WR.D1",
    pcode: "CMR005004001",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Douala II",
    nameEn: "Douala II",
    code: "050402",
    hasc: "CM.LT.WR.D2",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Douala III",
    nameEn: "Douala III",
    code: "050403",
    hasc: "CM.LT.WR.D3",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Douala IV",
    nameEn: "Douala IV",
    code: "050404",
    hasc: "CM.LT.WR.D4",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Douala V",
    nameEn: "Douala V",
    code: "050405",
    hasc: "CM.LT.WR.D5",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Douala VI",
    nameEn: "Douala VI",
    code: "050406",
    hasc: "CM.LT.WR.D6",
    division: "Wouri",
    divisionCode: "0504",
    get name() {
      return this.nameFr;
    },
  },

  // Subdivisions for Fako Division - ordered alphabetically by French name
  {
    nameFr: "Buea",
    nameEn: "Buea",
    code: "100101",
    hasc: "CM.SW.FK.BU",
    pcode: "CMR010001001",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Limbe I",
    nameEn: "Limbe I",
    code: "100102",
    hasc: "CM.SW.FK.L1",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Limbe II",
    nameEn: "Limbe II",
    code: "100103",
    hasc: "CM.SW.FK.L2",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Limbe III",
    nameEn: "Limbe III",
    code: "100104",
    hasc: "CM.SW.FK.L3",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Tiko",
    nameEn: "Tiko",
    code: "100105",
    hasc: "CM.SW.FK.TK",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "West Coast",
    nameEn: "West Coast",
    code: "100106",
    hasc: "CM.SW.FK.WC",
    division: "Fako",
    divisionCode: "1001",
    get name() {
      return this.nameFr;
    },
  },

  // Subdivisions for Mezam Division - ordered alphabetically by French name
  {
    nameFr: "Bafut",
    nameEn: "Bafut",
    code: "070501",
    hasc: "CM.NW.MZ.BF",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bali",
    nameEn: "Bali",
    code: "070502",
    hasc: "CM.NW.MZ.BL",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bamenda I",
    nameEn: "Bamenda I",
    code: "070503",
    hasc: "CM.NW.MZ.B1",
    pcode: "CMR007005003",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bamenda II",
    nameEn: "Bamenda II",
    code: "070504",
    hasc: "CM.NW.MZ.B2",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bamenda III",
    nameEn: "Bamenda III",
    code: "070505",
    hasc: "CM.NW.MZ.B3",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Santa",
    nameEn: "Santa",
    code: "070506",
    hasc: "CM.NW.MZ.ST",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Tubah",
    nameEn: "Tubah",
    code: "070507",
    hasc: "CM.NW.MZ.TB",
    division: "Mezam",
    divisionCode: "0705",
    get name() {
      return this.nameFr;
    },
  },
];
