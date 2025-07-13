import type { District } from "../types";

export const districts: District[] = [
  // Districts for Yaoundé I subdivision - ordered alphabetically by French name
  {
    nameFr: "Centre Administratif",
    nameEn: "Administrative Centre",
    code: "02070101",
    hasc: "CM.CE.MF.Y1.CA",
    pcode: "CMR002007001001",
    subdivision: "Yaoundé I",
    subdivisionCode: "020701",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nlongkak",
    nameEn: "Nlongkak",
    code: "02070102",
    hasc: "CM.CE.MF.Y1.NL",
    subdivision: "Yaoundé I",
    subdivisionCode: "020701",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Tsinga",
    nameEn: "Tsinga",
    code: "02070103",
    hasc: "CM.CE.MF.Y1.TS",
    subdivision: "Yaoundé I",
    subdivisionCode: "020701",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Yaoundé II subdivision - ordered alphabetically by French name
  {
    nameFr: "Biyem-Assi",
    nameEn: "Biyem-Assi",
    code: "02070201",
    hasc: "CM.CE.MF.Y2.BA",
    subdivision: "Yaoundé II",
    subdivisionCode: "020702",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mvan",
    nameEn: "Mvan",
    code: "02070202",
    hasc: "CM.CE.MF.Y2.MV",
    subdivision: "Yaoundé II",
    subdivisionCode: "020702",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nkolbisson",
    nameEn: "Nkolbisson",
    code: "02070203",
    hasc: "CM.CE.MF.Y2.NK",
    subdivision: "Yaoundé II",
    subdivisionCode: "020702",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Yaoundé III subdivision - ordered alphabetically by French name
  {
    nameFr: "Efoulan",
    nameEn: "Efoulan",
    code: "02070301",
    hasc: "CM.CE.MF.Y3.EF",
    subdivision: "Yaoundé III",
    subdivisionCode: "020703",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Madagascar",
    nameEn: "Madagascar",
    code: "02070302",
    hasc: "CM.CE.MF.Y3.MG",
    subdivision: "Yaoundé III",
    subdivisionCode: "020703",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mfandena",
    nameEn: "Mfandena",
    code: "02070303",
    hasc: "CM.CE.MF.Y3.MF",
    subdivision: "Yaoundé III",
    subdivisionCode: "020703",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Douala I subdivision - ordered alphabetically by French name
  {
    nameFr: "Akwa",
    nameEn: "Akwa",
    code: "05040101",
    hasc: "CM.LT.WR.D1.AK",
    pcode: "CMR005004001001",
    subdivision: "Douala I",
    subdivisionCode: "050401",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bonanjo",
    nameEn: "Bonanjo",
    code: "05040102",
    hasc: "CM.LT.WR.D1.BN",
    subdivision: "Douala I",
    subdivisionCode: "050401",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Deido",
    nameEn: "Deido",
    code: "05040103",
    hasc: "CM.LT.WR.D1.DD",
    subdivision: "Douala I",
    subdivisionCode: "050401",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Douala II subdivision - ordered alphabetically by French name
  {
    nameFr: "Bassa",
    nameEn: "Bassa",
    code: "05040201",
    hasc: "CM.LT.WR.D2.BS",
    subdivision: "Douala II",
    subdivisionCode: "050402",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Ndogbong",
    nameEn: "Ndogbong",
    code: "05040202",
    hasc: "CM.LT.WR.D2.ND",
    subdivision: "Douala II",
    subdivisionCode: "050402",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "New Bell",
    nameEn: "New Bell",
    code: "05040203",
    hasc: "CM.LT.WR.D2.NB",
    subdivision: "Douala II",
    subdivisionCode: "050402",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Buea subdivision - ordered alphabetically by French name
  {
    nameFr: "Buea Central",
    nameEn: "Buea Central",
    code: "10010101",
    hasc: "CM.SW.FK.BU.BC",
    pcode: "CMR010001001001",
    subdivision: "Buea",
    subdivisionCode: "100101",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Buea Town",
    nameEn: "Buea Town",
    code: "10010102",
    hasc: "CM.SW.FK.BU.BT",
    subdivision: "Buea",
    subdivisionCode: "100101",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Great Soppo",
    nameEn: "Great Soppo",
    code: "10010103",
    hasc: "CM.SW.FK.BU.GS",
    subdivision: "Buea",
    subdivisionCode: "100101",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Molyko",
    nameEn: "Molyko",
    code: "10010104",
    hasc: "CM.SW.FK.BU.ML",
    subdivision: "Buea",
    subdivisionCode: "100101",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Bamenda I subdivision - ordered alphabetically by French name
  {
    nameFr: "Commercial Avenue",
    nameEn: "Commercial Avenue",
    code: "07050301",
    hasc: "CM.NW.MZ.B1.CA",
    pcode: "CMR007005003001",
    subdivision: "Bamenda I",
    subdivisionCode: "070503",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Ntarikon",
    nameEn: "Ntarikon",
    code: "07050302",
    hasc: "CM.NW.MZ.B1.NT",
    subdivision: "Bamenda I",
    subdivisionCode: "070503",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Old Town",
    nameEn: "Old Town",
    code: "07050303",
    hasc: "CM.NW.MZ.B1.OT",
    subdivision: "Bamenda I",
    subdivisionCode: "070503",
    get name() {
      return this.nameFr;
    },
  },

  // Districts for Bamenda II subdivision - ordered alphabetically by French name
  {
    nameFr: "Mankon",
    nameEn: "Mankon",
    code: "07050401",
    hasc: "CM.NW.MZ.B2.MK",
    subdivision: "Bamenda II",
    subdivisionCode: "070504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mendankwe",
    nameEn: "Mendankwe",
    code: "07050402",
    hasc: "CM.NW.MZ.B2.MD",
    subdivision: "Bamenda II",
    subdivisionCode: "070504",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nkwen",
    nameEn: "Nkwen",
    code: "07050403",
    hasc: "CM.NW.MZ.B2.NK",
    subdivision: "Bamenda II",
    subdivisionCode: "070504",
    get name() {
      return this.nameFr;
    },
  },
];
