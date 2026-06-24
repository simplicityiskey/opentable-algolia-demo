import "./style.css";
import algoliasearch from "algoliasearch";
import algoliasearchHelper from "algoliasearch-helper";

const client = algoliasearch("KMVF3Z9TC7", "502665b736b1d7005a47462971af9499");
const helper = algoliasearchHelper(client, "restaurants", {
  disjunctiveFacets: ["cuisine", "dining_style", "price_tier", "payment_methods", "badges"],
  hitsPerPage: 20
});

window.helper = helper;
let isLoadingMore = false;

const SORTS = {
  relevance: "restaurants",
  popular:   "restaurants_popular_desc",
  rating:    "restaurants_rating_desc",
  price:     "restaurants_price_asc",
};
let currentSort = "relevance";

function renderHits(hits) {
  const container = document.getElementById("hits");
  const template = document.getElementById("result-template").innerHTML;

  if (hits.length === 0 && !isLoadingMore) {
    container.innerHTML = document.getElementById("no-results-template").innerHTML;
    return;
  }

  const html = hits.map(hit => {
    return template
      .replace("{{name}}", hit._highlightResult?.name?.value || hit.name || "")
      .replace("{{food_type}}", hit.food_type || "")
      .replace("{{neighborhood}}", hit.neighborhood || "")
      .replace("{{price_range}}", hit.price_range || "")
      .replace("{{address}}", hit.address || "")   
      .replace("{{city}}", hit.city || "")        
      .replace("{{stars_count}}", hit.stars_count || "")
      .replace("{{reviews_count}}", hit.reviews_count || "");
  }).join("");

  if (isLoadingMore) {
    container.innerHTML += html;
  } else {
    container.innerHTML = html;
  }
}

function renderCuisineFacet(results) {
  const list = document.getElementById("cuisine-list");
  const values = results.getFacetValues("cuisine", { sortBy: ["count:desc"] }).slice(0, 10);

  list.innerHTML = values.map(facet => {
    const active = facet.isRefined ? "active" : "";
    return `
      <li class="facet-item ${active}" data-facet="cuisine" data-value="${facet.name}">
        ${facet.name} (${facet.count})
      </li>
    `;
  }).join("");
}

function renderFacet(results, attribute, listId) {
  const list = document.getElementById(listId);
  const values = results.getFacetValues(attribute, { sortBy: ["count:desc"] });

  list.innerHTML = values.map(facet => {
    const active = facet.isRefined ? "active" : "";
    return `
      <li class="facet-item ${active}" data-facet="${attribute}" data-value="${facet.name}">
        ${facet.name} (${facet.count})
      </li>
    `;
  }).join("");
}

function renderCuisineSearchResults(facetHits) {
  const list = document.getElementById("cuisine-list");
  list.innerHTML = facetHits.map(facet => {
    const active = facet.isRefined ? "active" : "";
    return `
      <li class="facet-item ${active}" data-facet="cuisine" data-value="${facet.value}">
        ${facet.value} (${facet.count})
      </li>
    `;
  }).join("");
}

function renderStats(nbHits, processingTimeMS) {
  document.getElementById("stats").textContent =
    `${nbHits.toLocaleString()} results in ${processingTimeMS} ms`;
}

helper.on("result", ({ results }) => {
  const isEmptyQuery = results.query === "";
  document.querySelector(".results-heading").textContent =
    isEmptyQuery ? "Popular Restaurants" : `${results.nbHits} results`;

  renderHits(results.hits);
  renderCuisineFacet(results);
  renderFacet(results, "price_tier", "price-list");
  renderFacet(results, "dining_style", "dining-list");
  renderFacet(results, "payment_methods", "payment-list");
  renderFacet(results, "badges", "badges-list");

  renderStats(results.nbHits, results.processingTimeMS);

  isLoadingMore = false;

  document.querySelectorAll(".sort-pill").forEach(p => {
  p.classList.toggle("active", p.dataset.sort === currentSort);
  });

  const loadMoreBtn = document.getElementById("load-more");
  if (results.page >= results.nbPages - 1) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }
});

helper.on("error", (err) => {
  const container = document.getElementById("hits");
  container.innerHTML = `<p style="color: red; padding: 1rem;">Something went wrong — please try again.</p>`;
  console.error(err);
});

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", (e) => {
  helper.setQuery(e.target.value).search();
});

const cuisineSearch = document.getElementById("cuisine-search");

cuisineSearch.addEventListener("input", (e) => {
  const query = e.target.value;
  if (query.trim() === "") {
    helper.search();
    return;
  }
  helper.searchForFacetValues("cuisine", query).then(({ facetHits }) => {
    renderCuisineSearchResults(facetHits);
  });
});

document.getElementById("facets").addEventListener("click", (e) => {
  const item = e.target.closest(".facet-item");
  if (!item) return;
  const facet = item.dataset.facet;
  const value = item.dataset.value;
  helper.toggleFacetRefinement(facet, value).search();
});

document.getElementById("load-more").addEventListener("click", () => {
  isLoadingMore = true;
  helper.nextPage().search();
});

document.getElementById("sort-pills").addEventListener("click", (e) => {
  const pill = e.target.closest(".sort-pill");
  if (!pill) return;

  document.querySelectorAll(".sort-pill").forEach(p => p.classList.remove("active"));
  pill.classList.add("active");

  currentSort = pill.dataset.sort;
  helper.setIndex(SORTS[currentSort]).setPage(0).search();
});

// --- NEAR ME ---
const nearMeBtn = document.getElementById('near-me-btn');
let geoActive = false;

nearMeBtn.addEventListener('click', () => {
  if (geoActive) {
    geoActive = false;
    nearMeBtn.classList.remove('active');
    nearMeBtn.setAttribute('aria-pressed', 'false');
    helper
      .setQueryParameter('aroundLatLng', undefined)
      .setQueryParameter('aroundLatLngViaIP', undefined)
      .search();
    return;
  }

  if (!navigator.geolocation) {
    console.error('Geolocation not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geoActive = true;
      nearMeBtn.classList.add('active');
      nearMeBtn.setAttribute('aria-pressed', 'true');
      helper
        .setQueryParameter('aroundLatLng', `${pos.coords.latitude},${pos.coords.longitude}`)
        .setQueryParameter('aroundRadius', 'all')
        .search();
    },
    () => {
      helper
        .setQueryParameter('aroundLatLngViaIP', true)
        .search();
    }
  );
});
// --- /NEAR ME ---

// --- CITY SELECTOR ---
const citySelect = document.getElementById('city-select');

citySelect.addEventListener('change', () => {
  const value = citySelect.value;

  if (!value) {
    // "All cities" — clear geo entirely
    helper
      .setQueryParameter('aroundLatLng', undefined)
      .setQueryParameter('aroundLatLngViaIP', undefined)
      .search();
    // Also reset Near me button if it was active
    geoActive = false;
    nearMeBtn.classList.remove('active');
    nearMeBtn.setAttribute('aria-pressed', 'false');
    return;
  }

  // City selected — disable Near me, set city centre coords
  geoActive = false;
  nearMeBtn.classList.remove('active');
  nearMeBtn.setAttribute('aria-pressed', 'false');

  helper
    .setQueryParameter('aroundLatLng', value)
    .setQueryParameter('aroundRadius', 'all')
    .search();
});
// --- /CITY SELECTOR ---

function loadShelf(badgeValue, containerId) {
  helper.searchOnce({
    filters: `badges:"${badgeValue}"`,
    hitsPerPage: 4,
    page: 0
  }).then(({ content }) => {
    const container = document.querySelector(`#${containerId} .shelf__items`);
    container.innerHTML = content.hits.map(hit => `
      <div class="shelf-card">
        <div class="shelf-card__name">${hit.name}</div>
        <div class="shelf-card__meta">${hit.food_type || ""} | ${hit.neighborhood || ""}</div>
        <div class="shelf-card__rating">⭐ ${hit.stars_count} (${hit.reviews_count} reviews)</div>
      </div>
    `).join("");
  });
}

helper.search();

loadShelf("Hidden Gem", "shelf-hidden-gems");
loadShelf("Highly Rated", "shelf-highly-rated");

// --- FILTER DRAWER ---
document.addEventListener("DOMContentLoaded", () => {
  const filterToggle = document.getElementById("filter-toggle");
  const facetsDiv = document.getElementById("facets");

  filterToggle.addEventListener("click", () => {
    const isOpen = facetsDiv.classList.toggle("filters-open");
    filterToggle.textContent = isOpen ? "🔼 Hide Filters" : "🔽 Filters";
  });
});
