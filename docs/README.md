# VTEX GraphQL Resolver

Forked from vtex.search-resolver@1.71.0. Main changes: Add CHEAPEST_AVAILABLE logic to ItemsFilterEnum in node/resolvers/search/product.ts

BEFORE
node/resolvers/search/product.ts

enum ItemsFilterEnum {
 ALL = 'ALL',
 FIRST_AVAILABLE = 'FIRST_AVAILABLE',
 ALL_AVAILABLE = 'ALL_AVAILABLE',
}
....
export const resolvers = {
 Product: {
   ...
   items: ({ items: searchItems, skuSpecifications = [] }: SearchProduct, { filter }: ItemArg) => {

     const searchItemsWithVariations = searchItems.map(item => ({ ...item, skuSpecifications }))

     if (filter === ItemsFilterEnum.ALL) {
       return searchItemsWithVariations
     }

     if (filter === ItemsFilterEnum.FIRST_AVAILABLE) {
       const firstAvailable = searchItemsWithVariations.find(isAvailable)
       return firstAvailable ? [firstAvailable] : [searchItemsWithVariations[0]]
     }

     if (filter === ItemsFilterEnum.ALL_AVAILABLE) {
       const onlyAvailable = searchItemsWithVariations.filter(isAvailable)
       return onlyAvailable.length > 0 ? onlyAvailable : [searchItemsWithVariations[0]]
     }

     return searchItemsWithVariations
   },
   ...
}


AFTER
node/resolvers/search/product.ts

enum ItemsFilterEnum {
 ALL = 'ALL',
 FIRST_AVAILABLE = 'FIRST_AVAILABLE',
 ALL_AVAILABLE = 'ALL_AVAILABLE',
 CHEAPEST_AVAILABLE = 'CHEAPEST_AVAILABLE'
}
...
export const resolvers = {
 Product: {
   ...
   items: ({ items: searchItems, skuSpecifications = [] }: SearchProduct, { filter }: ItemArg) => {
      const searchItemsWithVariations = searchItems.map(item => ({ ...item, skuSpecifications }))
      
      if (filter === ItemsFilterEnum.ALL) {
        return searchItemsWithVariations
      }
    
      if (filter === ItemsFilterEnum.FIRST_AVAILABLE) {
        const firstAvailable = searchItemsWithVariations.find(isAvailable)
        return firstAvailable ? [firstAvailable] : [searchItemsWithVariations[0]]
      }
    
      if (filter === ItemsFilterEnum.ALL_AVAILABLE) {
        const onlyAvailable = searchItemsWithVariations.filter(isAvailable)
        return onlyAvailable.length > 0 ? onlyAvailable : [searchItemsWithVariations[0]]
      }
    
      if (filter === ItemsFilterEnum.CHEAPEST_AVAILABLE) {
        const availableItems = searchItemsWithVariations.filter(isAvailable)
        
        if (availableItems.length > 0) {
          // Find the cheapest available item based on seller prices from sellers with stock
          const cheapestAvailableItem = availableItems.reduce<SearchItem | null>((cheapest, currentItem) => {
            // Filter sellers with available stock and get the lowest price among them
            const currentItemPrice = Math.min(
              ...currentItem.sellers
                .filter(seller => seller.commertialOffer.AvailableQuantity > 0) // Only consider sellers with available stock
                .map(seller => seller.commertialOffer.Price)
            )
    
            // Filter sellers with available stock for the current cheapest item and get the lowest price
            const cheapestItemPrice = cheapest
              ? Math.min(
                  ...cheapest.sellers
                    .filter(seller => seller.commertialOffer.AvailableQuantity > 0) // Only consider sellers with available stock
                    .map(seller => seller.commertialOffer.Price)
                )
              : Infinity
    
            return currentItemPrice < cheapestItemPrice ? currentItem : cheapest
          }, null)
          
          return cheapestAvailableItem ? [cheapestAvailableItem] : [searchItemsWithVariations[0]]
        }
    
        // Fallback to the first item if no available item is found
        return [searchItemsWithVariations[0]]
      }
    
      return searchItemsWithVariations
    },
   ...
}
