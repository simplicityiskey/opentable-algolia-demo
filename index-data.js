import "dotenv/config";
import algoliasearch from "algoliasearch";
import { readFileSync } from "fs";

const records = JSON.parse(
  readFileSync("./dataset/restaurants_index.json", "utf-8")
);
console.log(`Loaded ${records.length} records.`);

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

const index = client.initIndex("restaurants");

const settings = {
  searchableAttributes: [
    "unordered(name)",
    "unordered(cuisine)",
    "neighborhood,city,area",
    "state"
  ],
  attributesForFaceting: [
    "searchable(cuisine)",
    "dining_style",
    "price_tier",
    "payment_methods",
    "badges",
    "searchable(city)",
    "searchable(neighborhood)",
    "filterOnly(state)"
  ],
  customRanking: [
    "desc(popularity_score)",
    "desc(reviews_count)"
  ],
  typoTolerance: true,
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8,
  ignorePlurals: true,
  removeWordsIfNoResults: "allOptional",
  queryType: "prefixLast",
  hitsPerPage: 20
};

await index.setSettings(settings);
console.log("Settings applied.");

await index.saveObjects(records);
console.log(`Indexed ${records.length} records successfully.`);
