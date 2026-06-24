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
By default, Algolia ranks results by how well the search query matches each record. Custom ranking lets you choose what you would like the ranking metric to be. For OpenTable, that means surfacing restaurants with the strongest combination of star rating and review volume — so when two restaurants both match "Italian in Manhattan," the genuinely popular and well-reviewed one appears first, not just the one whose name happens to be a closer text match.

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

**The examples above are in JavaScript — if you're working in a different language, I can share the equivalent for Python, PHP, or whichever client you're using.**

**References:**
- [Algolia CLI commands](https://www.algolia.com/doc/tools/cli/commands/algolia-settings/)
- [Send and update your data](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data)

---

## Q3 — Leo

Hi Leo,

Good news ntegrating Algolia is generally straightforward, and you don't need to do everything at once.

Here's the high-level process:

1. **Prepare your data.** Take the information you already have and organise it so Algolia can read it — one record per item, containing the details you want users to be able to search by, such as a name, category, or price.

2. **Send your data to Algolia.** Once your data is ready, you upload it to Algolia. Algolia stores and manages everything on its end — you don't need to set up any servers.

3. **Set up your search settings.** Tell Algolia which fields users can search by, and how results should be ordered. This can be changed at any time without having to start over.

4. **Add search to your website.** Connect Algolia to your website's front end. This can be as simple as a basic search box, or more advanced with filters and sorting — it's up to you.

5. **Test and launch.** Try out some searches, make any adjustments, and go live.

Most people have something working within a day or two. How long the full build takes depends on how much data you have and how you want search to look on your site.

Please have a look at the links below.

**References:**
- [Send and update your data](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data)
- [Prepare your records for indexing](https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data)
