export interface PDFPager {
    openPDFByCode: (pdfcode: string, options?: { page?: number; pdfcode?: string; showUuid?: boolean }) => void;
}

/**
 * Utils used for opening links
 */
export class LinksHelpers {
    /**
     * Determine if the given string contains a PDF pattern.
     * 
     * @param candidate The string that might contain a PDF pattern like SR5 123
     */
    static isPDF(candidate: string | undefined): boolean {
        if (!candidate) return false;
        const pdfPattern = /^\S+ \d+$/i;
        return pdfPattern.test(candidate);
    }

    /**
     * Determine if the given string is a valid URL.
     * Excludes PDF patterns and Foundry document UUIDs.
     * 
     * @param candidate The string that might be a URL.
     * @returns true if the candidate is a valid URL.
     */
    static isURL(candidate: string | undefined): boolean {
        if (!candidate) return false;

        // Exclude PDF and UUID patterns first
        if (LinksHelpers.isPDF(candidate)) return false;
        if (LinksHelpers.isUuid(candidate)) return false;

        try {
            // eslint-disable-next-line no-new
            new URL(candidate, window.location.origin);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Determine if a given string is a valid Foundry document UUID.
     * Uses the core `foundry.utils.parseUuid` utility for reliable detection.
     *
     * @param candidate The string that might be a UUID.
     * @returns true, if the candidate is a valid UUID.
     */
    static isUuid(candidate: string | undefined) {
        if (!candidate) return false;

        try {
            return !!foundry.utils.parseUuid(candidate).collection;
        } catch (error) {
            return false;
        }
    }

    /**
     * Use the items source field to open it as another browser tab.
     * 
     * This is meant to allow for wikis to be used as sources.
     */
    static openSourceURL(source: string | undefined) {
        if (!source) {
            ui.notifications.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        window.open(source, '_blank');
    }

    /**
     * Use the items source field to try matching it against a PDF document and display that within FoundryVTT.
     */
    static openSourcePDF(source: string | undefined) {
        // Check for pdfpager module hook: https://github.com/farling42/fvtt-pdf-pager
        if (!('pdfpager' in ui)) {
            ui.notifications.warn('SR5.DIALOG.MissingModuleContent', { localize: true });
            return;
        }

        if (!source) {
            ui.notifications.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        const [code, page] = source.split(' ');

        (ui.pdfpager as PDFPager).openPDFByCode(code, { page: parseInt(page) });
    }

    /**
     * Open the document associated with the given uuid.
     * 
     * @param source 
     */
    static async openSourceByUuid(source: string | undefined) {
        if (!source) return;

        const resolvedUuid = foundry.utils.parseUuid(source);

        type docType = foundry.abstract.Document.ImplementationFor<CONST.ALL_DOCUMENT_TYPES>;
        const uuid = resolvedUuid.uuid.split('#')[0];
        const anchor = resolvedUuid.uuid.split('#')[1] as string | undefined;
        const document = await fromUuid(uuid) as docType | null;

        if (!document) {
            ui.notifications.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        try {
            if (document instanceof JournalEntryPage && document.parent)
                await document.parent.sheet?.render(true, { anchor, pageId: document.id });
            else if ("sheet" in document && document.sheet)
                await document.sheet.render(true);
            else
                ui.notifications.error(`The document has no associated sheet.`);
        } catch (error) {
            ui.notifications.error(`Error opening the sheet for UUID: ${resolvedUuid.uuid}`, error as any);
        }
    }

    /**
     * Use the items source field and try different means of opening it.
     */
    static async openSource(source: string | undefined) {
        if (LinksHelpers.isPDF(source))
            return LinksHelpers.openSourcePDF(source);
        if (LinksHelpers.isUuid(source))
            return LinksHelpers.openSourceByUuid(source);
        if (LinksHelpers.isURL(source))
            return LinksHelpers.openSourceURL(source);
    }
}
