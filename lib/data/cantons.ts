import type { CantonData } from "../types";

export const cantons: CantonData[] = [
  // Cantons for Mfoundi Division (Yaoundé area) - ordered alphabetically by French name
  {
    nameFr: "Yaoundé I",
    nameEn: "Yaounde I",
    code: "020701",
    type: "city",
    subdivision: "Yaoundé I",
    subdivisionCode: "020701",
  },
  {
    nameFr: "Yaoundé II",
    nameEn: "Yaounde II",
    code: "020702",
    type: "city",
    subdivision: "Yaoundé II",
    subdivisionCode: "020702",
  },
  {
    nameFr: "Yaoundé III",
    nameEn: "Yaounde III",
    code: "020703",
    type: "city",
    subdivision: "Yaoundé III",
    subdivisionCode: "020703",
  },
  {
    nameFr: "Yaoundé IV",
    nameEn: "Yaounde IV",
    code: "020704",
    type: "city",
    subdivision: "Yaoundé IV",
    subdivisionCode: "020704",
  },
  {
    nameFr: "Yaoundé V",
    nameEn: "Yaounde V",
    code: "020705",
    type: "city",
    subdivision: "Yaoundé V",
    subdivisionCode: "020705",
  },
  {
    nameFr: "Yaoundé VI",
    nameEn: "Yaounde VI",
    code: "020706",
    type: "city",
    subdivision: "Yaoundé VI",
    subdivisionCode: "020706",
  },
  {
    nameFr: "Yaoundé VII",
    nameEn: "Yaounde VII",
    code: "020707",
    type: "city",
    subdivision: "Yaoundé VII",
    subdivisionCode: "020707",
  },

  // Cantons for Bamenda I Subdivision (additional example)
  {
    nameFr: "Bamenda Centre",
    nameEn: "Bamenda Center",
    code: "010301",
    type: "city",
    subdivision: "Bamenda I",
    subdivisionCode: "070503",
  },

  // Cantons for Wouri Division (Douala area) - urban cantons
  {
    nameFr: "Douala I",
    nameEn: "Douala I",
    code: "050501",
    type: "city",
    subdivision: "Douala I",
    subdivisionCode: "050501",
  },
  {
    nameFr: "Douala II",
    nameEn: "Douala II",
    code: "050502",
    type: "city",
    subdivision: "Douala II",
    subdivisionCode: "050502",
  },
  {
    nameFr: "Douala III",
    nameEn: "Douala III",
    code: "050503",
    type: "city",
    subdivision: "Douala III",
    subdivisionCode: "050503",
  },
  {
    nameFr: "Douala IV",
    nameEn: "Douala IV",
    code: "050504",
    type: "city",
    subdivision: "Douala IV",
    subdivisionCode: "050504",
  },
  {
    nameFr: "Douala V",
    nameEn: "Douala V",
    code: "050505",
    type: "city",
    subdivision: "Douala V",
    subdivisionCode: "050505",
  },
  {
    nameFr: "Douala VI",
    nameEn: "Douala VI",
    code: "050506",
    type: "city",
    subdivision: "Douala VI",
    subdivisionCode: "050506",
  },

  // Rural cantons examples
  {
    nameFr: "Groupement Bafou",
    nameEn: "Bafou Group",
    code: "080101",
    type: "group",
    subdivision: "Bamenda I",
    subdivisionCode: "080101",
  },
  {
    nameFr: "Chefferie de Bali",
    nameEn: "Bali Chiefdom",
    code: "080102",
    type: "chiefdom",
    subdivision: "Bamenda II",
    subdivisionCode: "080102",
  },

  // Traditional administrative units - using existing subdivisions
  {
    nameFr: "Groupement Traditionnel",
    nameEn: "Traditional Group",
    code: "080201",
    type: "group",
    subdivision: "Bamenda II",
    subdivisionCode: "070504",
  },
];
