# Customer Question Answers

---

## Q1 — George

Hi George,

Happy to walk you through these — great questions.

**What is a record?**
A record is a single item in your Algolia index. For OpenTable, each restaurant is one record — a structured object containing everything Algolia needs to find, rank, and display it: the restaurant's name, cuisine type, neighbourhood, price tier, star rating, and location. Think of it like one row in a spreadsheet, but structured specifically for search.

**What does indexing mean?**
Indexing is the process of sending your records to Algolia so it can organise and store them in a way that enables near-instant search. Once indexed, Algolia can search across thousands of restaurant records and return results in single-digit milliseconds. There are no servers for you to manage — Algolia handles all of that infrastructure.

**What are custom ranking metrics?**
By default, Algolia ranks results by how well the search query matches each record. Custom ranking lets you break ties using signals that matter to your business. For OpenTable, that means surfacing restaurants with the strongest combination of star rating and review volume — so when two restaurants both match "Italian in Manhattan," the genuinely popular and well-reviewed one appears first, not just the one whose name happens to be a closer text match.

One important nuance: a restaurant with a 4.9-star rating from 3 reviews should not outrank one with a 4.5 average from 4,000 reviews. A review-count-weighted score handles this correctly and keeps results trustworthy for your users.

**References:**
- [What is a record?](https://support.algolia.com/hc/en-us/articles/4406981906833-What-is-a-record)
- [Custom ranking](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking)

---

## Q2 — Matt

Hi Matt,

Thank you for flagging this — that kind of friction adds up quickly when you're iterating, and I want to make sure you have the fastest path available while I pass this feedback to the product team.

The quickest way to clear or delete indexes during development is through the API or the Algolia CLI, which bypasses the dashboard entirely:

**Clear an index (removes all records but keeps your settings):**
```js
await index.clearObjects();
```

**Delete an index entirely:**
```js
await client.deleteIndex('your-index-name');
```

**Or via the Algolia CLI:**
```bash
algolia index clear your-index-name
algolia index delete your-index-name
```

These take effect immediately and are a single command — no navigation required. The CLI is particularly useful during the kind of rapid iteration you're describing.

I'll make sure your dashboard feedback gets to the product team with enough detail to be actionable. If you can share the specific steps that feel slow, that will help make the report as useful as possible.

**References:**
- [Algolia CLI commands](https://www.algolia.com/doc/tools/cli/commands/algolia-settings/)
- [Send and update your data](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data)

---

## Q3 — Leo

Hi Leo,

Good news — integrating Algolia is typically lighter than teams expect, and you don't need to do everything at once. It's incremental at every stage.

Here's the high-level process:

1. **Structure your data into records.** Shape your existing data into JSON objects — one record per item. Each record contains the attributes Algolia needs to find, rank, and display it. For OpenTable, that means one record per restaurant with name, cuisine, location, price, and rating.

2. **Push records to an Algolia index.** Send the records to Algolia using the API or one of the official client libraries (JavaScript, Python, and others are available). Algolia hosts everything — there are no servers to provision or maintain on your end.

3. **Configure relevance.** Set which attributes are searchable, which are used for filtering, and how results should be ranked. This is where you shape the quality of the experience — and it can be adjusted at any time without re-indexing.

4. **Build the search UI.** Connect your front end to Algolia using the search client. This can be as lightweight or as rich as you need — from a basic search box to a full discovery interface with filters, geo-ranking, and sorting.

5. **Test, tune, and ship.** Try representative searches, inspect the results, adjust your configuration where needed, and deploy. Algolia's dashboard makes it straightforward to experiment with relevance settings without touching code.

Most teams have a working prototype within a day or two. Production integration depends on data complexity and front-end scope, but because the infrastructure is fully hosted, you are never blocked waiting on servers or infrastructure setup.

**References:**
- [Send and update your data](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data)
- [Prepare your records for indexing](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data)