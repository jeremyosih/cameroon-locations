import type { SubCounty } from "../types";
import { counties } from "./counties";

// Create a map for easy lookup of county names by code
const countyMap = new Map(counties.map((county) => [county.code, county.name]));

export const subCounties: SubCounty[] = [
  // Mombasa
  { code: "001", name: "Changamwe", county: "Mombasa" },
  { code: "002", name: "Jomvu", county: "Mombasa" },
  { code: "003", name: "Kisauni", county: "Mombasa" },
  { code: "004", name: "Likoni", county: "Mombasa" },
  { code: "005", name: "Mvita", county: "Mombasa" },
  { code: "006", name: "Nyali", county: "Mombasa" },

  // Kwale
  { code: "007", name: "Kinango", county: "Kwale" },
  { code: "008", name: "Lungalunga", county: "Kwale" },
  { code: "009", name: "Msambweni", county: "Kwale" },
  { code: "010", name: "Mutuga", county: "Kwale" },

  // Kilifi
  { code: "011", name: "Genzw", county: "Kilifi" },
  { code: "012", name: "Kaloleni", county: "Kilifi" },
  { code: "013", name: "Kilifi North", county: "Kilifi" },
  { code: "014", name: "Kilifi South", county: "Kilifi" },
  { code: "015", name: "Magarini", county: "Kilifi" },
  { code: "016", name: "Malindi", county: "Kilifi" },
  { code: "017", name: "Rabai", county: "Kilifi" },

  // Tana River
  { code: "018", name: "Bura", county: "Tana River" },
  { code: "019", name: "Galole", county: "Tana River" },
  { code: "020", name: "Garsen", county: "Tana River" },

  // Lamu
  { code: "021", name: "Lamu East", county: "Lamu" },
  { code: "022", name: "Lamu West", county: "Lamu" },

  // Taita-Taveta
  { code: "023", name: "Mwatate", county: "Taita-Taveta" },
  { code: "024", name: "Taveta", county: "Taita-Taveta" },
  { code: "025", name: "Voi", county: "Taita-Taveta" },
  { code: "026", name: "Wundanyi", county: "Taita-Taveta" },

  // Garissa
  { code: "027", name: "Daadab", county: "Garissa" },
  { code: "028", name: "Fafi", county: "Garissa" },
  { code: "029", name: "Garissa", county: "Garissa" },
  { code: "030", name: "Hulugho", county: "Garissa" },
  { code: "031", name: "Ijara", county: "Garissa" },
  { code: "032", name: "Lagdera Balambala", county: "Garissa" },

  // Wajir
  { code: "033", name: "Eldas", county: "Wajir" },
  { code: "034", name: "Tarbaj", county: "Wajir" },
  { code: "035", name: "Wajir East", county: "Wajir" },
  { code: "036", name: "Wajir North", county: "Wajir" },
  { code: "037", name: "Wajir South", county: "Wajir" },
  { code: "038", name: "Wajir West", county: "Wajir" },

  // Mandera
  { code: "039", name: "Banissa", county: "Mandera" },
  { code: "040", name: "Lafey", county: "Mandera" },
  { code: "041", name: "Mandera East", county: "Mandera" },
  { code: "042", name: "Mandera North", county: "Mandera" },
  { code: "043", name: "Mandera South", county: "Mandera" },
  { code: "044", name: "Mandera West", county: "Mandera" },

  // Marsabit
  { code: "045", name: "Laisamis", county: "Marsabit" },
  { code: "046", name: "Moyale", county: "Marsabit" },
  { code: "047", name: "North Hor", county: "Marsabit" },
  { code: "048", name: "Saku", county: "Marsabit" },

  // Isiolo
  { code: "049", name: "Isiolo", county: "Isiolo" },
  { code: "050", name: "Garba Tula", county: "Isiolo" },
  { code: "051", name: "Merit", county: "Isiolo" },

  // Meru
  { code: "052", name: "Buuri", county: "Meru" },
  { code: "053", name: "Igembe Central", county: "Meru" },
  { code: "054", name: "Igembe North", county: "Meru" },
  { code: "055", name: "Igembe South", county: "Meru" },
  { code: "056", name: "Imenti Central", county: "Meru" },
  { code: "057", name: "Imenti North", county: "Meru" },
  { code: "058", name: "Imenti South", county: "Meru" },
  { code: "059", name: "Tigania East", county: "Meru" },
  { code: "060", name: "Tigania West", county: "Meru" },

  // Tharaka-Nithi
  { code: "061", name: "Chuka", county: "Tharaka-Nithi" },
  { code: "062", name: "Igambangobe", county: "Tharaka-Nithi" },
  { code: "063", name: "Maara", county: "Tharaka-Nithi" },
  { code: "064", name: "Muthambi", county: "Tharaka-Nithi" },
  { code: "065", name: "Tharaka North", county: "Tharaka-Nithi" },
  { code: "066", name: "Tharaka South", county: "Tharaka-Nithi" },

  // Embu
  { code: "067", name: "Manyatta", county: "Embu" },
  { code: "068", name: "Mbeere North", county: "Embu" },
  { code: "069", name: "Mbeere South", county: "Embu" },
  { code: "070", name: "Runyenjes", county: "Embu" },

  // Kitui
  { code: "071", name: "Ikutha", county: "Kitui" },
  { code: "072", name: "Katulani", county: "Kitui" },
  { code: "073", name: "Kisasi", county: "Kitui" },
  { code: "074", name: "Kitui Central", county: "Kitui" },
  { code: "075", name: "Kitui West", county: "Kitui" },
  { code: "076", name: "Lower Yatta", county: "Kitui" },
  { code: "077", name: "Matiyani", county: "Kitui" },
  { code: "078", name: "Migwani", county: "Kitui" },
  { code: "079", name: "Mutitu", county: "Kitui" },
  { code: "080", name: "Mutomo", county: "Kitui" },
  { code: "081", name: "Muumonikyusu", county: "Kitui" },
  { code: "082", name: "Mwingi Central", county: "Kitui" },
  { code: "083", name: "Mwingi East", county: "Kitui" },
  { code: "084", name: "Nzambani", county: "Kitui" },
  { code: "085", name: "Tseikuru", county: "Kitui" },

  // Machakos
  { code: "086", name: "Kathiani", county: "Machakos" },
  { code: "087", name: "Machakos Town", county: "Machakos" },
  { code: "088", name: "Masinga", county: "Machakos" },
  { code: "089", name: "Matungulu", county: "Machakos" },
  { code: "090", name: "Mavoko", county: "Machakos" },
  { code: "091", name: "Mwala", county: "Machakos" },
  { code: "092", name: "Yatta", county: "Machakos" },

  // Makueni
  { code: "093", name: "Kaiti", county: "Makueni" },
  { code: "094", name: "Kibwezi West", county: "Makueni" },
  { code: "095", name: "Kibwezi East", county: "Makueni" },
  { code: "096", name: "Kilome", county: "Makueni" },
  { code: "097", name: "Makueni", county: "Makueni" },
  { code: "098", name: "Mbooni", county: "Makueni" },

  // Nyandarua
  { code: "099", name: "Kinangop", county: "Nyandarua" },
  { code: "100", name: "Kipipiri", county: "Nyandarua" },
  { code: "101", name: "Ndaragwa", county: "Nyandarua" },
  { code: "102", name: "Ol Kalou", county: "Nyandarua" },
  { code: "103", name: "Ol Joro Orok", county: "Nyandarua" },

  // Nyeri
  { code: "104", name: "Kieni East", county: "Nyeri" },
  { code: "105", name: "Kieni West", county: "Nyeri" },
  { code: "106", name: "Mathira East", county: "Nyeri" },
  { code: "107", name: "Mathira West", county: "Nyeri" },
  { code: "108", name: "Mkurweni", county: "Nyeri" },
  { code: "109", name: "Nyeri Town", county: "Nyeri" },
  { code: "110", name: "Othaya", county: "Nyeri" },
  { code: "111", name: "Tetu", county: "Nyeri" },

  // Kirinyaga
  { code: "112", name: "Kirinyaga Central", county: "Kirinyaga" },
  { code: "113", name: "Kirinyaga East", county: "Kirinyaga" },
  { code: "114", name: "Kirinyaga West", county: "Kirinyaga" },
  { code: "115", name: "Mwea East", county: "Kirinyaga" },
  { code: "116", name: "Mwea West", county: "Kirinyaga" },

  // Murang'a
  { code: "117", name: "Gatanga", county: "Murang'a" },
  { code: "118", name: "Kahuro", county: "Murang'a" },
  { code: "119", name: "Kandara", county: "Murang'a" },
  { code: "120", name: "Kangema", county: "Murang'a" },
  { code: "121", name: "Kigumo", county: "Murang'a" },
  { code: "122", name: "Kiharu", county: "Murang'a" },
  { code: "123", name: "Mathioya", county: "Murang'a" },
  { code: "124", name: "Murang'a South", county: "Murang'a" },

  // Kiambu
  { code: "125", name: "Gatundu North", county: "Kiambu" },
  { code: "126", name: "Gatundu South", county: "Kiambu" },
  { code: "127", name: "Githunguri", county: "Kiambu" },
  { code: "128", name: "Juja", county: "Kiambu" },
  { code: "129", name: "Kabete", county: "Kiambu" },
  { code: "130", name: "Kiambaa", county: "Kiambu" },
  { code: "131", name: "Kiambu", county: "Kiambu" },
  { code: "132", name: "Kikuyu", county: "Kiambu" },
  { code: "133", name: "Limuru", county: "Kiambu" },
  { code: "134", name: "Ruiru", county: "Kiambu" },
  { code: "135", name: "Thika Town", county: "Kiambu" },
  { code: "136", name: "Lari", county: "Kiambu" },

  // Turkana
  { code: "137", name: "Loima", county: "Turkana" },
  { code: "138", name: "Turkana Central", county: "Turkana" },
  { code: "139", name: "Turkana East", county: "Turkana" },
  { code: "140", name: "Turkana North", county: "Turkana" },
  { code: "141", name: "Turkana South", county: "Turkana" },

  // West Pokot
  { code: "142", name: "Central Pokot", county: "West Pokot" },
  { code: "143", name: "North Pokot", county: "West Pokot" },
  { code: "144", name: "Pokot South", county: "West Pokot" },
  { code: "145", name: "West Pokot", county: "West Pokot" },

  // Samburu
  { code: "146", name: "Samburu East", county: "Samburu" },
  { code: "147", name: "Samburu North", county: "Samburu" },
  { code: "148", name: "Samburu West", county: "Samburu" },

  // Trans Nzoia
  { code: "149", name: "Cherangany", county: "Trans Nzoia" },
  { code: "150", name: "Endebess", county: "Trans Nzoia" },
  { code: "151", name: "Kiminini", county: "Trans Nzoia" },
  { code: "152", name: "Kwanza", county: "Trans Nzoia" },
  { code: "153", name: "Saboti", county: "Trans Nzoia" },

  // Uasin Gishu
  { code: "154", name: "Ainabkoi", county: "Uasin Gishu" },
  { code: "155", name: "Kapseret", county: "Uasin Gishu" },
  { code: "156", name: "Kesses", county: "Uasin Gishu" },
  { code: "157", name: "Moiben", county: "Uasin Gishu" },
  { code: "158", name: "Soy", county: "Uasin Gishu" },
  { code: "159", name: "Turbo", county: "Uasin Gishu" },

  // Elgeyo-Marakwet
  { code: "160", name: "Keiyo North", county: "Elgeyo-Marakwet" },
  { code: "161", name: "Keiyo South", county: "Elgeyo-Marakwet" },
  { code: "162", name: "Marakwet East", county: "Elgeyo-Marakwet" },
  { code: "163", name: "Marakwet West", county: "Elgeyo-Marakwet" },

  // Nandi
  { code: "164", name: "Aldai", county: "Nandi" },
  { code: "165", name: "Chesumei", county: "Nandi" },
  { code: "166", name: "Emgwen", county: "Nandi" },
  { code: "167", name: "Mosop", county: "Nandi" },
  { code: "168", name: "Nandi Hills", county: "Nandi" },
  { code: "169", name: "Tindiret", county: "Nandi" },

  // Baringo
  { code: "170", name: "Baringo Central", county: "Baringo" },
  { code: "171", name: "Baringo North", county: "Baringo" },
  { code: "172", name: "Baringo South", county: "Baringo" },
  { code: "173", name: "Eldama Ravine", county: "Baringo" },
  { code: "174", name: "Mogotio", county: "Baringo" },
  { code: "175", name: "Tiaty", county: "Baringo" },

  // Laikipia
  { code: "176", name: "Laikipia Central", county: "Laikipia" },
  { code: "177", name: "Laikipia East", county: "Laikipia" },
  { code: "178", name: "Laikipia North", county: "Laikipia" },
  { code: "179", name: "Laikipia West", county: "Laikipia" },
  { code: "180", name: "Nyahururu", county: "Laikipia" },

  // Nakuru
  { code: "181", name: "Bahati", county: "Nakuru" },
  { code: "182", name: "Gilgil", county: "Nakuru" },
  { code: "183", name: "Kuresoi North", county: "Nakuru" },
  { code: "184", name: "Kuresoi South", county: "Nakuru" },
  { code: "185", name: "Molo", county: "Nakuru" },
  { code: "186", name: "Naivasha", county: "Nakuru" },
  { code: "187", name: "Nakuru Town East", county: "Nakuru" },
  { code: "188", name: "Nakuru Town West", county: "Nakuru" },
  { code: "189", name: "Njoro", county: "Nakuru" },
  { code: "190", name: "Rongai", county: "Nakuru" },
  { code: "191", name: "Subukia", county: "Nakuru" },

  // Narok
  { code: "192", name: "Narok East", county: "Narok" },
  { code: "193", name: "Narok North", county: "Narok" },
  { code: "194", name: "Narok South", county: "Narok" },
  { code: "195", name: "Narok West", county: "Narok" },
  { code: "196", name: "Transmara East", county: "Narok" },
  { code: "197", name: "Transmara West", county: "Narok" },

  // Kajiado
  { code: "198", name: "Isinya", county: "Kajiado" },
  { code: "199", name: "Kajiado Central", county: "Kajiado" },
  { code: "200", name: "Kajiado North", county: "Kajiado" },
  { code: "201", name: "Loitokitok", county: "Kajiado" },
  { code: "202", name: "Mashuuru", county: "Kajiado" },

  // Kericho
  { code: "203", name: "Ainamoi", county: "Kericho" },
  { code: "204", name: "Belgut", county: "Kericho" },
  { code: "205", name: "Bureti", county: "Kericho" },
  { code: "206", name: "Kipkelion East", county: "Kericho" },
  { code: "207", name: "Kipkelion West", county: "Kericho" },
  { code: "208", name: "Soin Sigowet", county: "Kericho" },

  // Bomet
  { code: "209", name: "Bomet Central", county: "Bomet" },
  { code: "210", name: "Bomet East", county: "Bomet" },
  { code: "211", name: "Chepalungu", county: "Bomet" },
  { code: "212", name: "Konoin", county: "Bomet" },
  { code: "213", name: "Sotik", county: "Bomet" },

  // Kakamega
  { code: "214", name: "Butere", county: "Kakamega" },
  { code: "215", name: "Kakamega Central", county: "Kakamega" },
  { code: "216", name: "Kakamega East", county: "Kakamega" },
  { code: "217", name: "Kakamega North", county: "Kakamega" },
  { code: "218", name: "Kakamega South", county: "Kakamega" },
  { code: "219", name: "Khwisero", county: "Kakamega" },
  { code: "220", name: "Lugari", county: "Kakamega" },
  { code: "221", name: "Lukuyani", county: "Kakamega" },
  { code: "222", name: "Lurambi", county: "Kakamega" },
  { code: "223", name: "Matete", county: "Kakamega" },
  { code: "224", name: "Mumias", county: "Kakamega" },
  { code: "225", name: "Mutungu", county: "Kakamega" },
  { code: "226", name: "Navakholo", county: "Kakamega" },

  // Vihiga
  { code: "227", name: "Emuhaya", county: "Vihiga" },
  { code: "228", name: "Hamisi", county: "Vihiga" },
  { code: "229", name: "Luanda", county: "Vihiga" },
  { code: "230", name: "Sabatia", county: "Vihiga" },
  { code: "231", name: "Vihiga", county: "Vihiga" },

  // Bungoma
  { code: "232", name: "Bumula", county: "Bungoma" },
  { code: "233", name: "Kabuchai", county: "Bungoma" },
  { code: "234", name: "Kanduyi", county: "Bungoma" },
  { code: "235", name: "Kimilil", county: "Bungoma" },
  { code: "236", name: "Mt Elgon", county: "Bungoma" },
  { code: "237", name: "Sirisia", county: "Bungoma" },
  { code: "238", name: "Tongaren", county: "Bungoma" },
  { code: "239", name: "Webuye East", county: "Bungoma" },
  { code: "240", name: "Webuye West", county: "Bungoma" },

  // Busia
  { code: "241", name: "Budalangi", county: "Busia" },
  { code: "242", name: "Butula", county: "Busia" },
  { code: "243", name: "Funyula", county: "Busia" },
  { code: "244", name: "Nambele", county: "Busia" },
  { code: "245", name: "Teso North", county: "Busia" },
  { code: "246", name: "Teso South", county: "Busia" },

  // Siaya
  { code: "247", name: "Alego Usonga", county: "Siaya" },
  { code: "248", name: "Bondo", county: "Siaya" },
  { code: "249", name: "Gem", county: "Siaya" },
  { code: "250", name: "Rarieda", county: "Siaya" },
  { code: "251", name: "Ugenya", county: "Siaya" },
  { code: "252", name: "Unguja", county: "Siaya" },

  // Kisumu
  { code: "253", name: "Kisumu Central", county: "Kisumu" },
  { code: "254", name: "Kisumu East", county: "Kisumu" },
  { code: "255", name: "Kisumu West", county: "Kisumu" },
  { code: "256", name: "Mohoroni", county: "Kisumu" },
  { code: "257", name: "Nyakach", county: "Kisumu" },
  { code: "258", name: "Nyando", county: "Kisumu" },
  { code: "259", name: "Seme", county: "Kisumu" },

  // Homa Bay
  { code: "260", name: "Homabay Town", county: "Homa Bay" },
  { code: "261", name: "Kabondo", county: "Homa Bay" },
  { code: "262", name: "Karachwonyo", county: "Homa Bay" },
  { code: "263", name: "Kasipul", county: "Homa Bay" },
  { code: "264", name: "Mbita", county: "Homa Bay" },
  { code: "265", name: "Ndhiwa", county: "Homa Bay" },
  { code: "266", name: "Rangwe", county: "Homa Bay" },
  { code: "267", name: "Suba", county: "Homa Bay" },

  // Migori
  { code: "268", name: "Awendo", county: "Migori" },
  { code: "269", name: "Kuria East", county: "Migori" },
  { code: "270", name: "Kuria West", county: "Migori" },
  { code: "271", name: "Mabera", county: "Migori" },
  { code: "272", name: "Ntimaru", county: "Migori" },
  { code: "273", name: "Rongo", county: "Migori" },
  { code: "274", name: "Suna East", county: "Migori" },
  { code: "275", name: "Suna West", county: "Migori" },
  { code: "276", name: "Uriri", county: "Migori" },

  // Kisii
  { code: "277", name: "Bobasi", county: "Kisii" },
  { code: "278", name: "Bomachoge Borabu", county: "Kisii" },
  { code: "279", name: "Bomachoge Chache", county: "Kisii" },
  { code: "280", name: "Bonchari", county: "Kisii" },
  { code: "281", name: "Kitutu Chache North", county: "Kisii" },
  { code: "282", name: "Kitutu Chache South", county: "Kisii" },
  { code: "283", name: "Nyaribari Chache", county: "Kisii" },
  { code: "284", name: "Nyaribari Masaba", county: "Kisii" },
  { code: "285", name: "South Mugirango", county: "Kisii" },

  // Nyamira
  { code: "286", name: "Borabu", county: "Nyamira" },
  { code: "287", name: "Manga", county: "Nyamira" },
  { code: "288", name: "Masaba North", county: "Nyamira" },
  { code: "289", name: "Nyamira North", county: "Nyamira" },
  { code: "290", name: "Nyamira South", county: "Nyamira" },

  // Nairobi
  { code: "291", name: "Dagoretti North", county: "Nairobi" },
  { code: "292", name: "Dagoretti South", county: "Nairobi" },
  { code: "293", name: "Embakasi Central", county: "Nairobi" },
  { code: "294", name: "Embakasi East", county: "Nairobi" },
  { code: "295", name: "Embakasi North", county: "Nairobi" },
  { code: "296", name: "Embakasi South", county: "Nairobi" },
  { code: "297", name: "Embakasi West", county: "Nairobi" },
  { code: "298", name: "Kamukunji", county: "Nairobi" },
  { code: "299", name: "Kasarani", county: "Nairobi" },
  { code: "300", name: "Kibra", county: "Nairobi" },
  { code: "301", name: "Lang'ata", county: "Nairobi" },
  { code: "302", name: "Makadara", county: "Nairobi" },
  { code: "303", name: "Mathare", county: "Nairobi" },
  { code: "304", name: "Roysambu", county: "Nairobi" },
  { code: "305", name: "Ruaraka", county: "Nairobi" },
  { code: "306", name: "Starehe", county: "Nairobi" },
  { code: "307", name: "Westlands", county: "Nairobi" },
];
