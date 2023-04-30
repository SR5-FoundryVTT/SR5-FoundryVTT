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
    static isURL(candidate: string): boolean {
        var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)?(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
        var url = new RegExp(urlRegex, 'i');
        return url.test(candidate);
   }

    /**
     * Use the items source field to open it as another browser tab.
     * 
     * This is meant to allow for wikis to be used as sources.
     */
    static openSourceURL(source: string) {
        if (source === '') {
            ui.notifications?.error('SR5.SourceFieldEmptyError', {localize: true});
        }

        window.open(source);
    }

    /**
     * Use the items source field to try matching it against a PDF document and display that within FoundryVTT.
     */
    static openSourcePDF(source: string) {
        // Check for pdfpager module hook: https://github.com/farling42/fvtt-pdf-pager
        if (!ui['pdfpager']) {
            ui.notifications?.warn('SR5.DIALOG.MissingModuleContent', {localize: true});
            return;
        }

        if (source === '') {
            ui.notifications?.error('SR5.SourceFieldEmptyError', {localize: true});
        }

        const [code, page] = source.split(' ');

        //@ts-ignore
        ui.pdfpager.openPDFByCode(code, { page: parseInt(page) });
    }

    /**
     * Use the items source field and try different means of opening it.
     */
    static openSource(source: string) {
        if (!source) return;
        
        if (LinksHelpers.isURL(source)) {
            LinksHelpers.openSourceURL(source);
        } else {
            LinksHelpers.openSourcePDF(source);
        }
    }
}