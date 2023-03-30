This is a OpenDOSM - PriceCatcher project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Advanced result with GraphQL

    query GetItemGroups {
    	itemGroups
    }

    query GetItemCategoriess {
	    itemCategories
    }

	query GetPremisesLocations {
		premisesNestedLocations {
			state,
			district,
			premise_type
		}
	}

	query SearchItems {
		searchItems(item_group: "BARANGAN SEGAR", item_category: "AYAM", limit: 2) {
			item_code
			item
			unit
			item_group
			item_category
		}
	}

	query SearchPremises {
		searchPremises(limit: 10) {
			premises  {
				premise_code
				premise
				address
				premise_type
				state
				district
			}
			previous
			current
			next
			total
			limit
		}
	}

	query SearchPriceListJoinPremises {
		getPriceListJoinPremises(item_code: 2) {
			date
			premise_code
			item_code
			price
			premise
			address
			premise_type
			state
			district
		}
	}

	query SearchPriceListJoinItems {
		getPriceListJoinItems(premise_code: 2 {
			premise_code
			date
			price
			item_code
			item
			unit
			item_group
			item_category
		}
	}
