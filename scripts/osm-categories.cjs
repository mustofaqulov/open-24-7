// Maps OpenStreetMap tags to Open24 category keys. Keys must exist in the
// categories table; unmapped records are skipped by the importer.
const SHOP_CATEGORIES = {
  chemist: "pharmacy",
  bakery: "bakery",
  convenience: "convenience",
  supermarket: "supermarket",
  grocery: "grocery",
  greengrocer: "greengrocer",
  farm: "greengrocer",
  butcher: "butcher",
  clothes: "clothing",
  boutique: "clothing",
  shoes: "clothing",
  fashion_accessories: "clothing",
  electronics: "electronics",
  computer: "electronics",
  appliance: "electronics",
  hifi: "electronics",
  mobile_phone: "mobile",
  telecommunication: "mobile",
  doityourself: "hardware",
  hardware: "hardware",
  paint: "hardware",
  trade: "hardware",
  building_materials: "hardware",
  furniture: "furniture",
  houseware: "furniture",
  kitchen: "furniture",
  cosmetics: "cosmetics",
  perfumery: "cosmetics",
  beauty: "cosmetics",
  stationery: "stationery",
  books: "stationery",
  copyshop: "stationery",
};
const AMENITY_CATEGORIES = {
  pharmacy: "pharmacy",
  fuel: "fuel",
  atm: "atm",
  hospital: "medical",
  clinic: "medical",
  restaurant: "restaurant",
  cafe: "cafe",
  marketplace: "bazaar",
};

/**
 * Resolves the Open24 category key for one OSM element.
 * @param {Record<string, string>} tags
 * @returns {string|null}
 */
function categoryFor(tags) {
  if (!tags) return null;
  if (tags.amenity && AMENITY_CATEGORIES[tags.amenity])
    return AMENITY_CATEGORIES[tags.amenity];
  if (tags.shop && SHOP_CATEGORIES[tags.shop]) return SHOP_CATEGORIES[tags.shop];
  if (tags.tourism === "hotel") return "hotel";
  if (tags.shop === "car_repair" || tags.shop === "car_parts") return "repair";
  return null;
}

module.exports = { categoryFor, SHOP_CATEGORIES, AMENITY_CATEGORIES };
