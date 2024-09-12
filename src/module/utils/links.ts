import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";

/**
 * Utils used for opening links
 */

export class LinksHelpers {
    /**
     * Determine if given string contains a url pattern.
     * 
     * @param candidate The string that might contain a url
     * @returns true, when candidate contains a url pattern
     */
    static isURL(candidate: string | undefined): boolean {
        if (!candidate) return false;
        return candidate.startsWith('http') || candidate.startsWith('https');
    }

    static async checkUuid(source: string | undefined): Promise<{document: any, resolvedUuid: any, anchor: string | undefined} | undefined> {
        if (!source) return;

        // @ts-expect-error // parseUuid is not defined in the @league-of-foundry-developers/foundry-vtt-types package
        let resolvedUuid = foundry.utils.parseUuid(source);

        const uuid = resolvedUuid.uuid.split('#')[0];
        const anchor = resolvedUuid.uuid.split('#')[1];

        const doc = await fromUuid(uuid);

        if(!doc) return;
        return {document: doc, resolvedUuid: resolvedUuid, anchor: anchor}
    }

    /**
     * Use the items source field to open it as another browser tab.
     * 
     * This is meant to allow for wikis to be used as sources.
     */
    static openSourceURL(source: string | undefined) {
        if (source === '') {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
        }

        window.open(source);
    }

    /**
     * Use the items source field to try matching it against a PDF document and display that within FoundryVTT.
     */
    static openSourcePDF(source: string | undefined) {
        // Check for pdfpager module hook: https://github.com/farling42/fvtt-pdf-pager
        if (!ui['pdfpager']) {
            ui.notifications?.warn('SR5.DIALOG.MissingModuleContent', { localize: true });
            return;
        }

        if (!source) {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        const [code, page] = source.split(' ');

        //@ts-expect-error 
        ui.pdfpager.openPDFByCode(code, { page: parseInt(page) });
    }

    static async openSourceByUuid({document, resolvedUuid, anchor}: {document: any, resolvedUuid: any, anchor: string | undefined}) {

        if (!document) {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        try {             

            if (document instanceof SR5Item || document instanceof SR5Actor || document instanceof JournalEntry) {
                document.sheet?.render(true);
                return;
            // @ts-expect-error 
            } else if (document instanceof JournalEntryPage) {
                document.parent.sheet.render(true, {pageId: document.id, anchor: anchor ? anchor : undefined});
                    return;
            } else {
                ui.notifications?.error(`The document has no associated sheet.`);
            }
        } catch (error) {
            ui.notifications?.error(`Error opening the sheet for UUID: ${resolvedUuid.uuid}`, error);
        }
    }

    /**
     * Use the items source field and try different means of opening it.
     */
    static async openSource(source: string | undefined) {
        if (LinksHelpers.isURL(source)) {
            LinksHelpers.openSourceURL(source);
        } else {
            const uuidData = await this.checkUuid(source);
            if (uuidData) {
                LinksHelpers.openSourceByUuid(uuidData);
            } else {
                LinksHelpers.openSourcePDF(source);
            }
        }
    }
}