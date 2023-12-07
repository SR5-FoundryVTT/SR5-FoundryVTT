export class SR5TestingDocuments<DocumentType> {
        documentClass: DocumentType;
        documents: foundry.abstract.Document<any>[] = [];

        constructor(documentClass) {
            this.documentClass = documentClass;
        }

        async create(data): Promise<DocumentType> {
            // @ts-expect-error
            const document = await this.documentClass.create({name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED`, ...data, ...{folder: this.folder}});
            this.documents.push(document);
            return document;
        }

        // Register document created outside SR5TestingDocuments to be torn down at the end of testing
        register(document: foundry.abstract.Document<any>): void {
          this.documents.push(document);
        }

        async teardown() {
            this.documents.forEach(document => document.delete());
        }
    }