import { Sanitizer, CorrectionLog } from '../sanitizer/Sanitizer';
import { Migrator } from '../migrator/Migrator';

type ExportableDocumentName = string;

/** Developer tooling: export validated source data without updating any live documents. */
export class PackSourceExportFlow {
    static get migrationVersion(): string {
        return Migrator.migrationVersion;
    }

    /**
     * Clone and validate a compendium document without writing to the world or pack.
     * Data-model documents are sanitized before validation; other document types, such
     * as Macro, are validated by their Foundry document class.
     */
    static prepare(source: Record<string, any>, documentName: ExportableDocumentName) {
        const data = foundry.utils.deepClone(source);
        const corrections: Record<string, CorrectionLog> = {};
        const visit = (entry: any, kind: ExportableDocumentName, path: string) => {
            const config = (CONFIG as Record<string, any>)[kind];
            if (!config?.documentClass) throw new Error(`${path}: unsupported document type ${kind}`);
            const schema = config.dataModels?.[entry.type]?.schema;
            if (schema) {
                const changes = Sanitizer.sanitize(schema, entry.system ??= {});
                if (changes) corrections[path] = changes;
                const failure = schema.validate(entry.system);
                if (failure) throw new Error(`${path}: ${failure.toString()}`);
            }
            for (const [childKind, collection] of Object.entries(config.documentClass.metadata.embedded ?? {})) {
                const children = entry[collection as string];
                for (const child of Array.isArray(children) ? children : children ? [children] : [])
                    visit(child, childKind, `${path}.${collection}.${child._id}`);
            }
            for (const item of entry.flags?.shadowrun5e?.embeddedItems ?? []) visit(item, 'Item', `${path}.embeddedItems.${item._id}`);
            entry._stats ??= {};
            entry._stats.systemVersion = Migrator.migrationVersion;
            entry._stats.systemId = game.system.id;
            // Construction validates the full document, including core fields, without database writes.
            const cls = config.documentClass;
            const document = new cls(foundry.utils.deepClone(entry), { strict: true });
            if (schema) {
                // JSON omits undefined optional fields; reconstruction may restore them.
                const original = foundry.utils.duplicate(entry.system);
                const reconstructed = foundry.utils.duplicate(document.toObject().system);
                if (!foundry.utils.equals(original, reconstructed))
                    throw new Error(`${path}: reconstruction still changes system source data`);
            }
        };
        visit(data, documentName, data._id ?? 'unknown');
        return { data, corrections };
    }

    static async exportPack(collection: string) {
        const pack = game.packs.get(collection);
        if (!pack || pack.metadata.packageName !== game.system.id)
            throw new Error(`Not a system compendium: ${collection}`);
        const documents = await pack.getDocuments();
        if (pack.invalidDocumentIds.size) throw new Error(`${collection}: contains invalid documents`);
        return documents.map(document => this.prepare(document.toObject(), pack.documentName as ExportableDocumentName));
    }
}
