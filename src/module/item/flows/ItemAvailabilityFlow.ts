/**
 * Handling of automations around the items availability code.
 */
export const ItemAvailabilityFlow = {
    
    /**
     * Separate a availability string into its parts:
     * - Availability Rating
     * - Restriction Rating
     *
     * @param avail A string like this: 12R or 12F. Other languages are supported.
     */
    parseAvailibility(avail: string) {
        // Remove the computed modifier at the end, if present.
        avail = avail.replace(/\([+-]\d{1,2}\)$/, '');

        // Separates the availability value and any potential restriction
        const availParts = avail.match(/^(\d+)(.*)$/);

        if(!availParts) return null;

        const availability = parseInt(availParts[1], 10);
        const restriction = availParts[2];

        return {availability, restriction}
    },

    /**
     * Prepare availability data based on base availability code.
     * 
     * This allows items to define a rating and a base availability, which will be altered by the rating.
     * 
     * @param technology Technology data to be altered in place.
     * @param rating The rating of the technology item
     */
    prepareAvailabilityValue(availability: string, adjusted: boolean, rating: number) {
        const availParts = ItemAvailabilityFlow.parseAvailibility(availability);

        if (!availParts) {
            adjusted = false;
            ui.notifications?.error("Availability must be in the format: Number-Letter (e.g., '12R') for calculation.");
            return {adjusted, value: availability};
        }

        const actualAvailibility = adjusted ? availParts.availability * rating : availParts.availability;
        const value = `${actualAvailibility}${availParts.restriction}`;

        return {adjusted, value}
    }
};