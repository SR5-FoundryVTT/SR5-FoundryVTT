import {SR5Actor} from "../module/actor/SR5Actor";

export class SR5TestingDocuments {
        documentClass: Entity;
        documents: Record<string, Entity> = {};

        constructor(documentClass) {
            this.documentClass = documentClass;
        }

        async create(data): Promise<SR5Actor> {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const document = await this.documentClass.create({name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED`, ...data, ...{folder: this.folder}});
            this.documents[document.id] = document;
            return document;
        }

        async delete(id) {
            const document = this.documents[id];
            if (!document) return;
            // @ts-ignore // foundry-vtt-types 0.9
            await this.documentClass.deleteDocuments([document.data._id]);
            delete this.documents[document.id]
        }

        async teardown() {
            // @ts-ignore
            Object.values(this.documents).forEach(document => this.delete(document.id));
        }
    }