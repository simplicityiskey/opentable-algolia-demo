import json
import csv
import argparse

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def load_csv(path):
    records = {}
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            records[row["objectID"]] = row
    return records

PAYMENT_MAP = {
    "Visa":             "Visa",
    "MasterCard":       "MasterCard",
    "American Express": "American Express",
    "AMEX":             "American Express",
    "Discover":         "Discover",
    "Diners Club":      "Discover",
    "Carte Blanche":    "Discover",
}

def normalize_payments(raw):
    if not raw:
        return []
    seen = set()
    result = []
    for p in raw:
        p = p.strip()
        mapped = PAYMENT_MAP.get(p)
        if mapped and mapped not in seen:
            seen.add(mapped)
            result.append(mapped)
    return result

def popularity_score(stars, reviews, m=50, C=4.29):
    try:
        stars = float(stars)
        reviews = int(reviews)
    except (ValueError, TypeError):
        return 0.0
    return (reviews / (reviews + m)) * stars + (m / (reviews + m)) * C

def assign_badges(record):
    badges = []
    score = record.get("popularity_score", 0)
    reviews = record.get("reviews_count", 0)
    stars = record.get("stars_count", 0)
    if score >= 4.5 and reviews >= 500:
        badges.append("Highly Rated")
    if score >= 4.0 and reviews < 100:
        badges.append("Hidden Gem")
    if stars >= 4.7:
        badges.append("Top Rated")
    return badges

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", required=True)
    parser.add_argument("--csv",  required=True)
    parser.add_argument("--out",  required=True)
    args = parser.parse_args()

    restaurants = load_json(args.json)
    info_map    = load_csv(args.csv)

    unmatched = 0
    output = []

    for r in restaurants:
        oid = str(r.get("objectID", ""))
        info = info_map.get(oid)

        if not info:
            unmatched += 1
            continue

        r["food_type"]    = info.get("food_type", "")
        r["cuisine"]      = info.get("food_type", "")
        r["dining_style"] = info.get("dining_style", "")
        r["neighborhood"] = info.get("neighborhood", "")
        r["phone_number"] = info.get("phone_number", "")
        r["price_range"]  = info.get("price_range", "")

        try:
            r["stars_count"] = float(info.get("stars_count", 0))
        except ValueError:
            r["stars_count"] = 0.0
        try:
            r["reviews_count"] = int(info.get("reviews_count", 0))
        except ValueError:
            r["reviews_count"] = 0

        price_num = r.get("price", 0)
        r["price_tier"] = "$" * int(price_num) if price_num else "$"

        r["payment_methods"] = normalize_payments(r.get("payment_options", []))

        r["popularity_score"] = round(
            popularity_score(r["stars_count"], r["reviews_count"]), 4
        )
        r["badges"] = assign_badges(r)

        output.append(r)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Records written : {len(output)}")
    print(f"Unmatched rows  : {unmatched}")

if __name__ == "__main__":
    main()
