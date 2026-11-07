import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5ApplicationMixin, SR5ApplicationMixinTypes } from '@/module/handlebars/SR5ApplicationMixin';
import { SR5Item } from '../SR5Item';
import { SR5 } from '@/module/config';
import { parseDropData } from '@/module/utils/sheets';
import { MetatypeFlow } from '@/module/flows/MetatypeFlow';
import { MetatypeTaxonomy, MetatypeTaxonomyEntry } from '@/module/types/item/Metatype';
import ItemSheet = foundry.applications.sheets.ItemSheet;

const { fromUuid, fromUuidSync } = foundry.utils;

export interface ResolvedGrantedItem {
    uuid: string;
    name: string;
    img?: string;
    type?: string;
}

export interface SR5MetatypeSheetData extends ItemSheet.RenderContext, SR5ApplicationMixinTypes.RenderContext {
    item: SR5Item<'metatype'>;
    displayName: string;
    taxonomy: MetatypeTaxonomy;
    metatypeChoices: MetatypeTaxonomyEntry[];
    subtypeChoices: MetatypeTaxonomyEntry[];
    subsubtypeChoices: MetatypeTaxonomyEntry[];
    attributesList: { key: string; label: string; min: number; max: number; aug_max: number }[];
    resolvedQualities: ResolvedGrantedItem[];
    resolvedWeapons: ResolvedGrantedItem[];
    resolvedItems: ResolvedGrantedItem[];
    descriptionHTML?: string;
}

export class SR5MetatypeSheet extends SR5ApplicationMixin(ItemSheet)<SR5MetatypeSheetData> {
    declare document: SR5Item<'metatype'>;

    override get title(): string {
        return MetatypeFlow.localizeMetatype(this.document) || this.document.name;
    }

    static override DEFAULT_OPTIONS = {
        classes: ['item', 'metatype', 'metatype-sheet', 'named-sheet'],
        position: {
            width: 650,
            height: 560,
        },
        actions: {
            removeGrantedUuid: SR5MetatypeSheet.#onRemoveGrantedUuid,
            openGrantedItem: SR5MetatypeSheet.#onOpenGrantedItem,
        },
        dragDrop: [{ dropSelector: '.drop-zone, .tab' }],
    };

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('item/header/metatype'),
            scrollable: ['.scrollable'],
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
            scrollable: ['.scrollable'],
        },
        details: {
            template: SheetFlow.templateBase('item/tabs/details/metatype'),
            scrollable: ['.scrollable'],
        },
        description: {
            template: SheetFlow.templateBase('item/tabs/description'),
            scrollable: ['.scrollable'],
        },
        footer: {
            template: SheetFlow.templateBase('item/footer'),
            scrollable: ['.scrollable'],
        },
    };

    static override TABS = {
        primary: {
            initial: 'details',
            tabs: [
                { id: 'details', label: 'SR5.Tabs.Item.Details', cssClass: '' },
                { id: 'description', label: 'SR5.Tabs.Item.Description', cssClass: '' },
            ]
        }
    };

    override async _prepareContext(options: Parameters<ItemSheet['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        context.item = this.document;
        context.displayName = MetatypeFlow.localizeMetatype(this.document) || this.document.name;

        const system = this.document.system;

        if (this.item.system.description) {
            context.descriptionHTML = await this.enrichEditorFieldToHTML(this.item.system.description.value);
        }

        context.taxonomy = MetatypeFlow.extractTaxonomy(this.document);
        const choices = await MetatypeFlow.collectTaxonomyChoices(context.taxonomy.subtype.name, [this.document]);
        context.metatypeChoices = choices.metatypeChoices;
        context.subtypeChoices = choices.subtypeChoices;
        context.subsubtypeChoices = choices.subsubtypeChoices;

        // Prepare attribute rows for all standard physical and mental attributes
        const standardAttrs = ['body', 'agility', 'reaction', 'strength', 'willpower', 'logic', 'intuition', 'charisma', 'edge'];
        const currentRanges = system.getActiveAttributeRanges();

        context.attributesList = standardAttrs.map(attr => {
            const range = currentRanges[attr] || {};
            return {
                key: attr,
                label: (SR5.attributes as Record<string, string>)[attr] ? game.i18n.localize((SR5.attributes as Record<string, string>)[attr]) : attr,
                min: range.min ?? 1,
                max: range.max ?? 6,
                aug_max: range.aug_max ?? (range.max != null ? Math.floor(range.max * 1.5) : 9),
            };
        });

        const resolveUuids = async (uuids: string[]): Promise<ResolvedGrantedItem[]> => {
            const results: ResolvedGrantedItem[] = [];
            for (const uuid of uuids || []) {
                if (!uuid) continue;
                let doc = fromUuidSync(uuid);
                if (!doc) {
                    try {
                        doc = await fromUuid(uuid);
                    } catch {
                        // ignore broken links
                    }
                }
                if (!doc && uuid.startsWith('Compendium.')) {
                    const parts = uuid.slice(11).split('.');
                    const packId = `${parts[0]}.${parts[1]}`;
                    const targetId = parts[parts.length - 1];
                    const pack = game.packs.get(packId);
                    if (pack && targetId) {
                        try {
                            doc = (await pack.getDocument(targetId)) ?? null;
                        } catch {
                            // ignore broken links
                        }
                    }
                }
                const docName = (doc && 'name' in doc && typeof doc.name === 'string') ? doc.name : uuid;
                const docImg = (doc && 'img' in doc && typeof doc.img === 'string') ? doc.img : undefined;
                const docType = (doc && 'type' in doc && typeof doc.type === 'string') ? doc.type : undefined;

                results.push({
                    uuid,
                    name: docName,
                    img: docImg,
                    type: docType,
                });
            }
            return results;
        };

        context.resolvedQualities = await resolveUuids(system.qualities || []);
        context.resolvedWeapons = await resolveUuids(system.weapons || []);
        context.resolvedItems = await resolveUuids(system.items || []);

        return context;
    }

    override async _processSubmitData(
        ...[event, form, submitData, options]: Parameters<ItemSheet['_processSubmitData']>
    ) {
        const currentTax = MetatypeFlow.extractTaxonomy(this.document);
        const baseChoices = await MetatypeFlow.collectTaxonomyChoices(currentTax.subtype.name, [this.document]);

        if (foundry.utils.hasProperty(submitData, 'system.metatype')) {
            const rawVal = foundry.utils.getProperty(submitData, 'system.metatype');
            if (typeof rawVal === 'string') {
                const resolved = MetatypeFlow.resolveTaxonomyInput(rawVal, baseChoices.metatypeChoices);
                foundry.utils.setProperty(submitData, 'system.metatype', resolved.name);
                foundry.utils.setProperty(submitData, 'flags.shadowrun5e.taxonomy.metatype', resolved);
            }
        }

        let effectiveSubtype = currentTax.subtype.name;
        if (foundry.utils.hasProperty(submitData, 'system.subtype')) {
            const rawVal = foundry.utils.getProperty(submitData, 'system.subtype');
            if (typeof rawVal === 'string') {
                const resolved = MetatypeFlow.resolveTaxonomyInput(rawVal, baseChoices.subtypeChoices);
                effectiveSubtype = resolved.name;
                foundry.utils.setProperty(submitData, 'system.subtype', resolved.name);
                foundry.utils.setProperty(submitData, 'flags.shadowrun5e.taxonomy.subtype', resolved);
            }
        }

        if (foundry.utils.hasProperty(submitData, 'system.subsubtype')) {
            const rawVal = foundry.utils.getProperty(submitData, 'system.subsubtype');
            if (typeof rawVal === 'string') {
                const subChoices = effectiveSubtype !== currentTax.subtype.name
                    ? (await MetatypeFlow.collectTaxonomyChoices(effectiveSubtype, [this.document])).subsubtypeChoices
                    : baseChoices.subsubtypeChoices;
                const resolved = MetatypeFlow.resolveTaxonomyInput(rawVal, subChoices);
                foundry.utils.setProperty(submitData, 'system.subsubtype', resolved.name);
                foundry.utils.setProperty(submitData, 'flags.shadowrun5e.taxonomy.subsubtype', resolved);
            }
        }

        return await super._processSubmitData(event, form, submitData, options);
    }

    protected override async _onDrop(event: DragEvent) {
        const raw = parseDropData<{ type?: string; uuid?: string }>(event);
        if (raw?.type !== 'Item' || !raw.uuid) return;

        const droppedItem = await fromUuid(raw.uuid);
        if (!(droppedItem instanceof SR5Item)) return;

        let category: 'qualities' | 'weapons' | 'items' | null = null;
        if (droppedItem.isType('quality', 'critter_power')) {
            category = 'qualities';
        } else if (droppedItem.isType('weapon')) {
            category = 'weapons';
        } else if (droppedItem.isType('equipment', 'device', 'armor', 'ammo')) {
            category = 'items';
        }

        if (!category) return;

        const droppedUuid = droppedItem.uuid;
        if (!droppedUuid) return;

        const currentList: string[] = Array.from(this.document.system[category] || []);
        if (currentList.includes(droppedUuid)) return;

        currentList.push(droppedUuid);

        await this.document.update({
            [`system.${category}`]: currentList,
        });
    }

    static async #onRemoveGrantedUuid(this: SR5MetatypeSheet, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const category = target.dataset.category as 'qualities' | 'weapons' | 'items';
        const uuid = target.dataset.uuid;

        if (!category || !uuid) return;
        if (category !== 'qualities' && category !== 'weapons' && category !== 'items') return;

        const system = this.document.system;
        const currentList = (system[category] || []).filter((u: string) => u !== uuid);

        await this.document.update({
            [`system.${category}`]: currentList,
        });
    }

    static async #onOpenGrantedItem(this: SR5MetatypeSheet, event: PointerEvent, target: HTMLElement) {
        event.preventDefault();
        const uuid = target.dataset.uuid;
        if (!uuid) return;

        // If this metatype is embedded on an actor, open the actor's corresponding item
        const actor = this.document.actor;
        if (actor) {
            // 1. Direct UUID or ID match
            let actorItem = actor.items.find(i => i.uuid === uuid || i.id === uuid);

            // 2. Match by compendium source / source ID
            if (!actorItem) {
                actorItem = actor.items.find(i =>
                    i._stats?.compendiumSource === uuid ||
                    i.flags?.core?.sourceId === uuid ||
                    i.flags?.shadowrun5e?.grantedByMetatype === this.document.id
                );
            }

            // 3. Match by name
            if (!actorItem) {
                const targetDoc = fromUuidSync(uuid) ?? await fromUuid(uuid);
                if (targetDoc && 'name' in targetDoc) {
                    actorItem = actor.items.find(i => i.name === targetDoc.name);
                }
            }

            if (actorItem?.sheet) {
                await actorItem.sheet.render(true);
                return;
            }
        }

        // Fallback: Open original document directly
        const doc = await fromUuid(uuid);
        if (doc instanceof SR5Item && doc.sheet) {
            await doc.sheet.render(true);
        }
    }
}
