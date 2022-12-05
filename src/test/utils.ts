export class SR5TestingDocuments<T extends foundry.abstract.Document<any, any>> {
        documentClass: T;
        documents: foundry.abstract.Document<any>[] = [];

        constructor(documentClass) {
            this.documentClass = documentClass;
        }

        async create(data): Promise<T> {
            // @ts-ignore
            const document = await this.documentClass.create({name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED`, ...data, ...{folder: this.folder}});
            this.documents.push(document);
            return document;
        }

        async teardown() {
            // @ts-ignore
            await this.documentClass.deleteDocuments(this.documents.map(document => document.id));
        }
    }