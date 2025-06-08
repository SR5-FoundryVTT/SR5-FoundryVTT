/**
 * Flow for handling item cost calculations.
 */
export const ItemCostFlow = {
    /**
     * Prepare cost data based on the bast cost.
     * 
     * @param cost Base cost value of the technology item.
     * @param adjusted Does the user want to use base or cost or adjusted cost?
     * @param rating The rating of the technology item
     * @returns 
     */
    prepareCostValue(cost: number, adjusted: boolean, rating: number) {
        const value = adjusted ? cost * rating : cost;
        return { adjusted, value }
    }
}