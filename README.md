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

## Set up instructions to run locally

If the live link does not work or you would prefer to run this locally on your machine please follow these instructions. 

### Prerequisites

- Node.js 18 or higher ([download](https://nodejs.org))
- An Algolia account with the index already populated (see Data setup below)

### Setup

### Step 1 — Clone the project
```bash
git clone https://github.com/simplicityiskey/opentable-algolia-demo
```

### Step 2 — Navigate into the project folder
```bash
cd open-table-algolia-demo
```

### Step 3 — Install dependencies
```bash
npm install
```

### Step 4 — Set up your environment variables
Copy `.env.example` and rename it to `.env`, then fill in your Algolia credentials:
```
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
```

### Step 5 — Start the development server
```bash
npm run dev
```

### Step 6 — Open the app
Go to `http://localhost:5173` in your browser.

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


## Approach & trade-offs

The provided mock-up shows OpenTable's current Elasticsearch experience. Rather than
recreating it, I built directly against their stated pain points and their core business
goal — turning more search and browsing sessions into bookings.

| OpenTable pain point | How this demo addresses it |
|---|---|
| Hard-to-spell names, typos, partial names, alternate spellings | Typo tolerance (1 typo at ≥4 chars, 2 at ≥8), `queryType: prefixLast` for as-you-type, and `removeWordsIfNoResults: allOptional` so partial or awkward queries still return results |
| Multiple chain locations in the same city | Every result card shows neighbourhood, city, and street address beside the name, so identical chain names are immediately distinguishable |
| Discovery isn't supported; few ways to browse or get inspired | A searchable cuisine facet (114 values), disjunctive price / dining-style / payment / badge filters, curated "Hidden Gems" and "Highly Rated" shelves, and an empty-query state that surfaces the most popular restaurants |
| Feels less modern than consumer platforms | Clean card UI, instant as-you-type results with a live result count and timing, replica-backed sort options, and a mobile-responsive layout with a collapsible filter drawer |

### What I prioritised

- **Relevance quality first.** The popularity score is the single biggest lever on perceived
  quality, so I built it as a Bayesian (review-count-weighted) star rating — credibility
  threshold `m = 50`, dataset mean (4.29) as the prior — so a 4.9-from-3-reviews place can't
  outrank a 4.5-from-4,000. It lives in `customRanking` (with `reviews_count` as a second
  tie-breaker), beneath Algolia's text relevance rather than overriding it.
- **Both personas in every decision.** Name-first `searchableAttributes` and typo tolerance
  serve the known-item user; the facets, shelves, and populated empty state serve the
  discovery user. The test for every feature was "does this help someone book a table?"
- **A geo fallback that never dead-ends.** Browser location → IP-based location → manual city
  selector → popularity ranking, with `aroundRadius: 'all'` so distance influences ranking
  without hard-excluding far-away restaurants. The demo stays useful for any reviewer,
  regardless of location or whether they grant permission.

### What I changed during testing

- Expanded the result cards from name / cuisine / price to also include neighbourhood, city,
  and street address, after testing showed chain locations weren't distinguishable.
- Reworked the filter UI — moved price, dining-style, payment, and badge filters into
  collapsible dropdowns and capped long facet lists with a "show more" toggle, keeping cuisine
  as a searchable list — after the initial flat layout surfaced every value at once.
- [PENDING YOUR ANSWER — popularity score: testing surfaced casino-chain restaurants leading
  the popular shelf despite low review counts; EITHER "so I raised the review weighting / m
  threshold, after which well-reviewed places led correctly" OR move this bullet to the
  "left out" section as a documented limitation.]

### Key assumptions & judgment calls

Where the brief was silent, I made and documented these calls:

- **Payments** — exposed only the four allowed values; folded Diners Club and Carte Blanche
  into Discover per the brief; dropped JCB, Cash Only, and Pay with OpenTable as unsupported.
- **Conflicting price fields** — the numeric `price` (1–4) and text `price_range` disagree on
  ~300 records; I treated the numeric field as canonical for the `$`–`$$$$` tier.
- **Cuisine granularity** — kept all 114 `food_type` values rather than inventing a taxonomy,
  and handled the long list with a searchable facet (type "ita" → "Italian").
- **Ranking constant** — `m = 50` means a restaurant needs a meaningful review count before
  its rating is fully trusted; a lower value rewards emerging spots more, a higher one favours
  established ones.
- **Default location** — the data is US-only and NY-heavy, so the demo defaults to New York to
  show well wherever it's opened.
- **Dead media URLs** — some dataset image and booking URLs return 404s, so I added a fallback
  image to keep broken links from making the demo look broken.

### What I deliberately left out for time

- **Click and conversion analytics.** In production, OpenTable's own booking and click data
  would feed back into ranking — `bookings_count` per restaurant would be the ideal
  custom-ranking signal, directly closing the loop between search quality and revenue.
- **A/B testing of relevance configurations.**

### On AI assistance

I used AI assistance to accelerate implementation, and reviewed and adapted all output against
the brief's constraints — JS Helper only, no InstantSearch, no fork. I can explain the
architecture, trade-offs, and every data transformation behind what I built.
