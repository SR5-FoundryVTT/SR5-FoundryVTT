import {SR5Actor} from "../module/actor/SR5Actor";
import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import {SR5Item} from "../module/item/SR5Item";

export class SR5TestingDocuments<T extends foundry.abstract.Document<any, any>> {
        documentClass: T;
        documents: Record<string, foundry.abstract.Document<any>> = {};

        constructor(documentClass) {
            this.documentClass = documentClass;
        }

        async create(data): Promise<T> {
            // @ts-ignore
            const document = await this.documentClass.create({name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED`, ...data, ...{folder: this.folder}});
            this.documents[document.id] = document;
            return document;
        }

        async delete(id) {
            const document = this.documents[id];
            if (!document) return;
            // @ts-ignore
            await this.documentClass.deleteDocuments([document.data._id]);
            delete this.documents[document.id as string]
        }

        async teardown() {
            // @ts-ignore
            await this.documentClass.deleteDocuments(Object.values(this.documents).map(document => document.id));
        }
    }