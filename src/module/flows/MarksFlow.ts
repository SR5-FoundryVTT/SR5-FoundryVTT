import { MatrixRules } from '../rules/MatrixRules';

/**
 * Options for the setMarks method.
 */
export interface SetMarksOptions {
    // Instead of adding marks, set the given amount.
    overwrite?: boolean
    // If not target is given, use this name to indicate mark placement without document present.
    name?: string
}

/**
 * General functionality around marks without shadowrun rules.
 * 
 * Mark placement is a bit complicated, as it's split into
 * - actor mark placement => ActorMarksFlow
 * - item mark placement => ItemMarksFlow
 * - test mark placement => MarkPlacementFlow
 * 
 * Everything abstracted across those is placed here to avoid duplication.
 */
export const MarkFlow = {
    /**
     * Set a specific mark while overwriting a documents place marks fully.
     * 
     * @param marksData The current marks data to be altered.
     * @param target The document that is marked.
     * @param currentMarks The current amount of marks on the document.
     * @param marks The amount of marks to be added or set.
     * 
     * @returns marksData, altered in place.
     */
    setMarks(marksData: Shadowrun.MatrixMarks, target: Shadowrun.NetworkDevice | undefined, currentMarks: number, marks: number, options: SetMarksOptions={}) {
        // TODO: Allow for no target
        if (!target) return [];

        // Reset marks instead of added additional.
        currentMarks = options.overwrite ? 0 : currentMarks;

        let mark = marksData.find(mark => mark.uuid === target?.uuid);

        // Either alter the existing mark or create a new one.
        if (mark) {
            mark.marks = MatrixRules.getValidMarksCount(currentMarks + marks);
        } else {
            mark = {
                uuid: target.uuid,
                name: target.name ?? '',
                marks: MatrixRules.getValidMarksCount(currentMarks + marks)
            }
            marksData.push(mark);
        }

        return marksData;
    },

    /**
     * Retrieve a mark placement for a possibly marked document.
     * 
     * @param marksData The marks data to be searched.
     * @param uuid The icons uuid
     */
    getMark(marksData: Shadowrun.MatrixMarks, uuid: string) {
        return marksData.find(mark => mark.uuid === uuid)?.marks ?? 0;
    }
}