# OpenTable × Algolia — Restaurant Search Demo

A restaurant search and discovery prototype built for the Algolia Solutions Engineer hiring assignment. Demonstrates how Algolia could help OpenTable replace their ageing Elasticsearch stack with a faster, more modern search and discovery experience.

## Links

**Live demo:** https://calebopentable.netlify.app/

**Repository:** https://github.com/simplicityiskey/opentable-algolia-demo

---

## What this is

This prototype shows how Algolia could power OpenTable's search experience for two user types:

- **Known-item searchers** — users who know the restaurant name and want to find it fast, even with typos, partial names, or chains with multiple locations
- **Discovery browsers** — users exploring without a specific place in mind, who want to browse, filter, and get inspired

The demo is built on a dataset of ~5,000 US restaurants, using the Algolia JS Helper (no InstantSearch.js) and a Vite front end.

---

## How to run locally

### Prerequisites

- Node.js 18 or higher ([download](https://nodejs.org))
- An Algolia account with the index already populated (see Data setup below)

### Steps


git clone https://github.com/simplicityiskey/opentable-algolia-demo
cd open-table-algolia-demo
npm install
```

Create an `.env` file in the root of the project (copy `.env.example`):

```
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:5173

---

## Data setup (one-time)

The indexing script requires your Admin API key. Add it to your `.env` file (never commit this):

```
ALGOLIA_ADMIN_KEY=your_admin_key
```

Then run:

```bash
node index-data.js
```

This joins the two dataset files, normalises the data, and pushes ~5,000 records to your Algolia index with all relevance settings applied.

---

## Data preparation

The dataset is split across two files:

- `restaurants_list.json` — ~5,000 records with name, address, geolocation, and payment options
- `restaurants_info.csv` — additional fields (cuisine, stars, reviews, dining style) keyed by `objectID`

### How the files were joined

Both files share `objectID` as a common key. 
The preparation script performs a 1:1 join on this field.
All 5,000 records match cleanly with no orphans.


### What transformations were performed
- **Payment normalisation:** The brief specifies four allowed values. The script keeps Visa, MasterCard, American Express, and Discover; merges Diners Club and Carte Blanche into Discover; and drops JCB, Cash Only, and Pay with OpenTable entirely.
- **Price field:** Where the numeric `price` field (1–4) and the text `price_range` field disagreed on ~300 records, the numeric field was treated as canonical for the `$`–`$$$$` display tier.
- **Popularity score:** Each record receives a Bayesian (review-count-weighted) star rating using a credibility threshold of m=50 and the dataset mean (4.29) as the prior. This prevents a 4.9-star restaurant with 3 reviews from outranking a 4.5-star restaurant with 4,000 reviews.
- **Badges:** Records are tagged with `Hidden Gem` (high score, lower review count) and `Highly Rated` (high score, high review count) to power curated discovery shelves.

### Which attributes were indexed
All fields needed to support search, filtering, display, and ranking: `name`, `food_type`, `cuisine`, `neighborhood`, `city`, `area`, `state`, `address`, `price_tier`, `price_range`, `dining_style`, `payment_methods`, `stars_count`, `reviews_count`, `popularity_score`, `badges`, `_geoloc`, `objectID`.

### Which attributes were made searchable, facetable, or ranking-related
See the Search configuration section below.

### Assumptions made about the data
- Diners Club and Carte Blanche treated as Discover per the brief
- JCB, Cash Only, and Pay with OpenTable dropped as they are not in the four allowed values
- Numeric `price` field treated as canonical where it conflicts with `price_range` text
- All 114 `food_type` values kept as-is — handled with a searchable facet rather than manual consolidation
- Popularity score credibility threshold set at m=50 so restaurants need a meaningful number of reviews before their rating is fully trusted
- Default location set to New York — the dataset is US-only and NY-heavy, so this ensures the demo looks good wherever a reviewer opens it

---

## Search configuration

### Searchable attributes (in priority order)
1. `name` (unordered) known-item users search by name; `unordered` means a match anywhere in the name scores equally
2. `cuisine` the primary discovery dimension
3. `neighborhood`, `city`, `area` (same tier) this was used to help disambiguate chain locations

### Custom ranking

`desc(popularity_score)`, then `desc(reviews_count)` as tiebreaker. Applied after text relevance so a highly-reviewed restaurant wins ties but does not beat an exact name match.

### Facets

- `cuisine` — searchable facet (114 values; users can type to filter the list)
- `price_tier`, `dining_style`, `payment_methods`, `badges` — disjunctive (OR within a facet, AND across facets)
- `city`, `neighborhood` — searchable facets for location browsing
- `state` — filterOnly

### Query behaviour

- `typoTolerance: true` — critical for hard-to-spell restaurant names
- `queryType: prefixLast` — enables as-you-type results
- `removeWordsIfNoResults: allOptional` — partial or awkward queries still return results
- `ignorePlurals: true` — "steakhouses" matches "steakhouse"
- `minWordSizefor1Typo: 4`, `minWordSizefor2Typos: 8`

### Geo-search fallback chain

1. Browser geolocation (precise, user-triggered via "Near me" button)
2. IP-based location (`aroundLatLngViaIP`) if permission is denied
3. Manual city selector (also useful for planning trips to other cities)
4. No location — falls back to relevance + popularity ranking; never broken, never empty

### Sort options

Implemented via replica indices:

| Option | Replica index | Ranking |
|---|---|---|
| Best match | `restaurants` | Default relevance |
| Most popular | `restaurants_popular_desc` | `desc(popularity_score)` |
| Highest rated | `restaurants_rating_desc` | `desc(stars_count)` |
| Price | `restaurants_price_asc` | `asc(price_tier)` |

---

## Approach & trade-offs

### What I built and why

The provided mock-up represents OpenTable's current Elasticsearch experience. Rather than recreating it, I focused on directly addressing their stated pain points and business goals:

| OpenTable pain point | How this demo addresses it |
|---|---|
| Hard-to-spell names, typos, partial names | Typo tolerance configured for 1 and 2 typos; prefix search enabled |
| Multiple chain locations in the same city | Every card shows cuisine, neighbourhood, and address for clear disambiguation |
| Discovery experience doesn't support browsing | Curated shelves (Hidden Gems, Highly Rated), disjunctive facets, empty-state shows popular restaurants |
| Feels less modern than consumer platforms | Clean card UI, as-you-type search, sort options, mobile-responsive layout with filter drawer |

### What I prioritised

- Ranking quality first — the weighted popularity score is the single most impactful thing for perceived result quality
- Two-persona design throughout — every feature decision was asked "does this help someone book a table?"
- Geo fallback chain — so the demo works gracefully for any reviewer regardless of location or browser permissions

### What I left out for time

- Analytics events — in production, click and booking conversion data would feed back into ranking signals; `bookings_count` per restaurant would be the ideal custom ranking signal for OpenTable
- A/B testing configuration

### On AI assistance

I used AI assistance to accelerate implementation.
I reviewed and adapted all output to the required parameters in the brief.
---

## Deliverables

- [Live demo]([ADD YOUR LIVE URL HERE])
- [Git repository]([ADD YOUR REPO URL HERE])
- [Customer answers](./customer-answers.md)
- Setup instructions — see "How to run locally" above
- Approach write-up — see "Approach & trade-offs" above
