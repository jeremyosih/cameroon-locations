import type { Division } from "../types";

export const divisions: Division[] = [
  // Adamaoua Region (5 divisions) - ordered alphabetically by French name
  {
    nameFr: "Djérem",
    nameEn: "Djerem",
    code: "0101",
    hasc: "CM.AD.DJ",
    pcode: "CMR001001",
    region: "Adamaoua",
    regionCode: "01",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Faro-et-Déo",
    nameEn: "Faro and Deo",
    code: "0102",
    hasc: "CM.AD.FD",
    region: "Adamaoua",
    regionCode: "01",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Banyo",
    nameEn: "Mayo-Banyo",
    code: "0103",
    hasc: "CM.AD.MB",
    region: "Adamaoua",
    regionCode: "01",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mbéré",
    nameEn: "Mbere",
    code: "0104",
    hasc: "CM.AD.MR",
    region: "Adamaoua",
    regionCode: "01",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Vina",
    nameEn: "Vina",
    code: "0105",
    hasc: "CM.AD.VI",
    region: "Adamaoua",
    regionCode: "01",
    get name() {
      return this.nameFr;
    },
  },

  // Centre Region (10 divisions) - ordered alphabetically by French name
  {
    nameFr: "Haute-Sanaga",
    nameEn: "Upper Sanaga",
    code: "0201",
    hasc: "CM.CE.HS",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Lékié",
    nameEn: "Lekie",
    code: "0202",
    hasc: "CM.CE.LK",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mbam-et-Inoubou",
    nameEn: "Mbam and Inoubou",
    code: "0203",
    hasc: "CM.CE.MI",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mbam-et-Kim",
    nameEn: "Mbam and Kim",
    code: "0204",
    hasc: "CM.CE.MK",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Méfou-et-Afamba",
    nameEn: "Mefou and Afamba",
    code: "0205",
    hasc: "CM.CE.MA",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Méfou-et-Akono",
    nameEn: "Mefou and Akono",
    code: "0206",
    hasc: "CM.CE.MO",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mfoundi",
    nameEn: "Mfoundi",
    code: "0207",
    hasc: "CM.CE.MF",
    pcode: "CMR002007",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nyong-et-Kéllé",
    nameEn: "Nyong and Kelle",
    code: "0208",
    hasc: "CM.CE.NK",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nyong-et-Mfoumou",
    nameEn: "Nyong and Mfoumou",
    code: "0209",
    hasc: "CM.CE.NM",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nyong-et-So'o",
    nameEn: "Nyong and So'o",
    code: "0210",
    hasc: "CM.CE.NS",
    region: "Centre",
    regionCode: "02",
    get name() {
      return this.nameFr;
    },
  },

  // Est Region (4 divisions) - ordered alphabetically by French name
  {
    nameFr: "Boumba-et-Ngoko",
    nameEn: "Boumba and Ngoko",
    code: "0301",
    hasc: "CM.ES.BN",
    region: "Est",
    regionCode: "03",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Haut-Nyong",
    nameEn: "Upper Nyong",
    code: "0302",
    hasc: "CM.ES.HN",
    region: "Est",
    regionCode: "03",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Kadey",
    nameEn: "Kadey",
    code: "0303",
    hasc: "CM.ES.KD",
    region: "Est",
    regionCode: "03",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Lom-et-Djerem",
    nameEn: "Lom and Djerem",
    code: "0304",
    hasc: "CM.ES.LD",
    region: "Est",
    regionCode: "03",
    get name() {
      return this.nameFr;
    },
  },

  // Extrême-Nord Region (6 divisions) - ordered alphabetically by French name
  {
    nameFr: "Diamaré",
    nameEn: "Diamare",
    code: "0401",
    hasc: "CM.EN.DM",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Logone-et-Chari",
    nameEn: "Logone and Chari",
    code: "0402",
    hasc: "CM.EN.LC",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Danay",
    nameEn: "Mayo-Danay",
    code: "0403",
    hasc: "CM.EN.MD",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Kani",
    nameEn: "Mayo-Kani",
    code: "0404",
    hasc: "CM.EN.MK",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Sava",
    nameEn: "Mayo-Sava",
    code: "0405",
    hasc: "CM.EN.MS",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Tsanaga",
    nameEn: "Mayo-Tsanaga",
    code: "0406",
    hasc: "CM.EN.MT",
    region: "Extrême-Nord",
    regionCode: "04",
    get name() {
      return this.nameFr;
    },
  },

  // Littoral Region (4 divisions) - ordered alphabetically by French name
  {
    nameFr: "Moungo",
    nameEn: "Moungo",
    code: "0501",
    hasc: "CM.LT.MG",
    region: "Littoral",
    regionCode: "05",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Nkam",
    nameEn: "Nkam",
    code: "0502",
    hasc: "CM.LT.NK",
    region: "Littoral",
    regionCode: "05",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Sanaga-Maritime",
    nameEn: "Sanaga-Maritime",
    code: "0503",
    hasc: "CM.LT.SM",
    region: "Littoral",
    regionCode: "05",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Wouri",
    nameEn: "Wouri",
    code: "0504",
    hasc: "CM.LT.WR",
    pcode: "CMR005004",
    region: "Littoral",
    regionCode: "05",
    get name() {
      return this.nameFr;
    },
  },

  // Nord Region (4 divisions) - ordered alphabetically by French name
  {
    nameFr: "Bénoué",
    nameEn: "Benoue",
    code: "0601",
    hasc: "CM.NO.BN",
    region: "Nord",
    regionCode: "06",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Faro",
    nameEn: "Faro",
    code: "0602",
    hasc: "CM.NO.FR",
    region: "Nord",
    regionCode: "06",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Louti",
    nameEn: "Mayo-Louti",
    code: "0603",
    hasc: "CM.NO.ML",
    region: "Nord",
    regionCode: "06",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mayo-Rey",
    nameEn: "Mayo-Rey",
    code: "0604",
    hasc: "CM.NO.MR",
    region: "Nord",
    regionCode: "06",
    get name() {
      return this.nameFr;
    },
  },

  // Nord-Ouest Region (7 divisions) - ordered alphabetically by French name
  {
    nameFr: "Boyo",
    nameEn: "Boyo",
    code: "0701",
    hasc: "CM.NW.BY",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Bui",
    nameEn: "Bui",
    code: "0702",
    hasc: "CM.NW.BU",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Donga-Mantung",
    nameEn: "Donga-Mantung",
    code: "0703",
    hasc: "CM.NW.DM",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Menchum",
    nameEn: "Menchum",
    code: "0704",
    hasc: "CM.NW.MC",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mezam",
    nameEn: "Mezam",
    code: "0705",
    hasc: "CM.NW.MZ",
    pcode: "CMR007005",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Momo",
    nameEn: "Momo",
    code: "0706",
    hasc: "CM.NW.MM",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Ngo-Ketunjia",
    nameEn: "Ngo-Ketunjia",
    code: "0707",
    hasc: "CM.NW.NK",
    region: "Nord-Ouest",
    regionCode: "07",
    get name() {
      return this.nameFr;
    },
  },

  // Ouest Region (8 divisions) - ordered alphabetically by French name
  {
    nameFr: "Bamboutos",
    nameEn: "Bamboutos",
    code: "0801",
    hasc: "CM.OU.BM",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Haut-Nkam",
    nameEn: "Upper Nkam",
    code: "0802",
    hasc: "CM.OU.HN",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Hauts-Plateaux",
    nameEn: "High Plateaux",
    code: "0803",
    hasc: "CM.OU.HP",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Koung-Khi",
    nameEn: "Koung-Khi",
    code: "0804",
    hasc: "CM.OU.KK",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Menoua",
    nameEn: "Menoua",
    code: "0805",
    hasc: "CM.OU.MN",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mifi",
    nameEn: "Mifi",
    code: "0806",
    hasc: "CM.OU.MF",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mino",
    nameEn: "Mino",
    code: "0807",
    hasc: "CM.OU.MI",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Ndé",
    nameEn: "Nde",
    code: "0808",
    hasc: "CM.OU.ND",
    region: "Ouest",
    regionCode: "08",
    get name() {
      return this.nameFr;
    },
  },

  // Sud Region (4 divisions) - ordered alphabetically by French name
  {
    nameFr: "Dja-et-Lobo",
    nameEn: "Dja and Lobo",
    code: "0901",
    hasc: "CM.SU.DL",
    region: "Sud",
    regionCode: "09",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Mvila",
    nameEn: "Mvila",
    code: "0902",
    hasc: "CM.SU.MV",
    region: "Sud",
    regionCode: "09",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Océan",
    nameEn: "Ocean",
    code: "0903",
    hasc: "CM.SU.OC",
    region: "Sud",
    regionCode: "09",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Vallée-du-Ntem",
    nameEn: "Ntem Valley",
    code: "0904",
    hasc: "CM.SU.VN",
    region: "Sud",
    regionCode: "09",
    get name() {
      return this.nameFr;
    },
  },

  // Sud-Ouest Region (6 divisions) - ordered alphabetically by French name
  {
    nameFr: "Fako",
    nameEn: "Fako",
    code: "1001",
    hasc: "CM.SW.FK",
    pcode: "CMR010001",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Koupé-Manengouba",
    nameEn: "Koupe-Manengouba",
    code: "1002",
    hasc: "CM.SW.KM",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Lebialem",
    nameEn: "Lebialem",
    code: "1003",
    hasc: "CM.SW.LB",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Manyu",
    nameEn: "Manyu",
    code: "1004",
    hasc: "CM.SW.MY",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Meme",
    nameEn: "Meme",
    code: "1005",
    hasc: "CM.SW.MM",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
  {
    nameFr: "Ndian",
    nameEn: "Ndian",
    code: "1006",
    hasc: "CM.SW.ND",
    region: "Sud-Ouest",
    regionCode: "10",
    get name() {
      return this.nameFr;
    },
  },
];
