/**
 * Helper class to collect and delete documents created during testing.
 */
export class SR5TestingDocuments<DocumentType> {
    documentClass: DocumentType;
    documents: foundry.abstract.Document<any>[] = [];

    constructor(documentClass) {
        this.documentClass = documentClass;
    }

    /**
     * 
     * @param data Generic entry point to pass any of object property as param to Document.create. This is not to be confused with v9 data.data
     * @returns An instance of the created document
     */
    async create(data): Promise<DocumentType> {
        // @ts-expect-error TODO: foundry-vtt-types v10
        const document = await this.documentClass.create({ name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED`, ...data, ...{ folder: this.folder } });
        this.documents.push(document);
        return document;
    }

    // Register document created outside SR5TestingDocuments to be torn down at the end of testing
    register(document: foundry.abstract.Document<any>): void {
        this.documents.push(document);
    }

    async teardown() {
        this.documents.forEach(document => {
            // @ts-expect-error - To avoid item deletion race condition caused by the matrix master/slave delete hook
            //                    remove any slave references before deleting the document, as all documents are deleted anyway.
            if (document.system.slaves) document.system.slaves = [];

            document.delete();
        });
    }
}