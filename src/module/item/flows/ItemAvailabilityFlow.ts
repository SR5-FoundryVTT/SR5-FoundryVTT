import { TestCreator } from "../../tests/TestCreator";


export const ItemAvailabilityFlow = {
    
    async parseAvailibility(avail: string) {
        // Remove the computed modifier at the end, if present.
        avail = avail.replace(/\([+-]\d{1,2}\)$/, '');

        // Separates the availability value and any potential restriction
        const availParts = avail.match(/^(\d+)(.*)$/);

        if(!availParts) return null;

        const availability = parseInt(availParts[1], 10);
        const restriction = availParts[2];

        return {availability, restriction}
    }
};