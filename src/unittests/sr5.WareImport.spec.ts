import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5TestFactory } from "./utils";
import { WareParser as ActorWareParser } from "@/module/apps/actorImport/itemImporter/wareImport/WareParser";

export const shadowrunWareImportTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('Ware import classification', () => {
        const allowedCategories = buildAllowedSubsystemCategorySet([
            {
                allowsubsystems: { category: [{ _TEXT: 'Eyeware' }, { _TEXT: 'Headware' }] },
                capacity: { _TEXT: '16' },
                category: { _TEXT: 'Eyeware' },
                ess: { _TEXT: '0.5' },
                id: { _TEXT: 'cybereyes-basic-system' },
                name: { _TEXT: 'Cybereyes Basic System' },
            },
            {
                allowsubsystems: { category: { _TEXT: 'Chemical Gland Modifications' } },
                capacity: { _TEXT: '0' },
                category: { _TEXT: 'Basic' },
                ess: { _TEXT: '0.4' },
                id: { _TEXT: 'chemical-gland' },
                name: { _TEXT: 'Chemical Gland' },
            },
        ] as any);

        it('classifies Armor cyberware as modification-only', () => {
            const armor = {
                capacity: { _TEXT: '[6]' },
                category: { _TEXT: 'Cyberlimb Accessory' },
                id: { _TEXT: 'armor' },
                name: { _TEXT: 'Armor' },
                requireparent: {},
            } as any;

            assert.strictEqual(classifyWareImport(armor, allowedCategories), 'modification');
        });

        it('classifies Flare Compensation as both ware and modification', () => {
            const flareCompensation = {
                capacity: { _TEXT: '[1]' },
                category: { _TEXT: 'Eyeware' },
                id: { _TEXT: 'flare-compensation' },
                name: { _TEXT: 'Flare Compensation' },
            } as any;

            assert.strictEqual(classifyWareImport(flareCompensation, allowedCategories), 'both');
        });

        it('classifies Cyberarm Gyromount as modification-only when parent details are required', () => {
            const gyromount = {
                capacity: { _TEXT: '[6]' },
                category: { _TEXT: 'Cyberlimb Accessory' },
                id: { _TEXT: 'cyberarm-gyromount' },
                name: { _TEXT: 'Cyberarm Gyromount' },
                required: { parentdetails: { category: { _TEXT: 'Cyberlimb' } } },
            } as any;

            assert.strictEqual(classifyWareImport(gyromount, allowedCategories), 'modification');
        });

        it('classifies Cybereyes Basic System as ware-only', () => {
            const cybereyes = {
                allowsubsystems: { category: [{ _TEXT: 'Eyeware' }, { _TEXT: 'Headware' }] },
                capacity: { _TEXT: '16' },
                category: { _TEXT: 'Eyeware' },
                id: { _TEXT: 'cybereyes-basic-system' },
                name: { _TEXT: 'Cybereyes Basic System' },
            } as any;

            assert.strictEqual(classifyWareImport(cybereyes, allowedCategories), 'ware');
        });

        it('classifies Chemical Gland Expanded Reservoir as bioware modification-only', () => {
            const reservoir = {
                capacity: { _TEXT: '[1]' },
                category: { _TEXT: 'Chemical Gland Modifications' },
                id: { _TEXT: 'chemical-gland-expanded-reservoir' },
                name: { _TEXT: 'Chemical Gland Expanded Reservoir' },
                requireparent: {},
            } as any;

            assert.strictEqual(classifyWareImport(reservoir, allowedCategories), 'modification');
        });

        it('parses bracketed ware modification slots with rating expressions', () => {
            assert.strictEqual(parseWareModificationSlots('[Rating]', 3), 3);
            assert.strictEqual(parseWareModificationSlots('[Rating * -1]', 2), -2);
            assert.strictEqual(parseWareModificationSlots('[2]', 0), 2);
        });
    });

    describe('Actor ware import nesting', () => {
        it('imports compatible ware children as embedded modifications', async () => {
            const parser = new ActorWareParser('cyberware');
            const [item] = await parser.parseItems([{
                active: 'False',
                allowsubsystems: 'Eyeware,Headware',
                attack: '0',
                avail: '4',
                capacity: '16',
                category: 'Eyeware',
                category_english: 'Eyeware',
                children: {
                    cyberware: {
                        active: 'False',
                        allowsubsystems: null,
                        attack: '0',
                        avail: '6',
                        capacity: '[1]',
                        category: 'Eyeware',
                        category_english: 'Eyeware',
                        children: null,
                        conditionmonitor: '9',
                        cost: '250',
                        dataprocessing: '0',
                        devicerating: '0',
                        ess: '0.05',
                        extra: null,
                        firewall: '0',
                        fullname: 'Flare Compensation',
                        fullname_english: 'Flare Compensation',
                        grade: 'Standard',
                        guid: 'flare-compensation-child',
                        homenode: 'False',
                        improvementsource: 'Cyberware',
                        iscommlink: 'False',
                        isgeneware: 'False',
                        isprogram: 'False',
                        location: null,
                        matrixcmfilled: '0',
                        maxrating: '0',
                        minrating: '0',
                        name: 'Flare Compensation',
                        name_english: 'Flare Compensation',
                        owncost: '250',
                        ownweight: '0',
                        page: '444',
                        programlimit: '0',
                        rating: '0',
                        ratinglabel: 'String_Rating',
                        sleaze: '0',
                        source: 'SR5',
                        sourceid: 'flare-compensation-child',
                        weight: '0',
                        wirelesson: 'False',
                    }
                },
                conditionmonitor: '9',
                cost: '4000',
                dataprocessing: '0',
                devicerating: '0',
                ess: '0.1',
                extra: null,
                firewall: '0',
                fullname: 'Cybereyes Basic System',
                fullname_english: 'Cybereyes Basic System',
                grade: 'Standard',
                guid: 'cybereyes-basic-system',
                homenode: 'False',
                improvementsource: 'Cyberware',
                iscommlink: 'False',
                isgeneware: 'False',
                isprogram: 'False',
                location: null,
                matrixcmfilled: '0',
                maxrating: '0',
                minrating: '0',
                name: 'Cybereyes Basic System',
                name_english: 'Cybereyes Basic System',
                owncost: '4000',
                ownweight: '0',
                page: '444',
                programlimit: '0',
                rating: '0',
                ratinglabel: 'String_Rating',
                sleaze: '0',
                source: 'SR5',
                sourceid: 'cybereyes-basic-system',
                weight: '0',
                wirelesson: 'False',
            }] as any);

            const embeddedItems = item.flags.shadowrun5e.embeddedItems ?? [];
            const embeddedModification = embeddedItems[0] as any;
            assert.lengthOf(embeddedItems, 1);
            assert.strictEqual(embeddedModification.type, 'modification');
            assert.strictEqual(embeddedModification.system.type, 'ware');
        });
    });

    describe('Ware data preparation', () => {
        it('applies cyberware modification capacity and essence to the parent ware', async () => {
            const parent = await factory.createItem({
                type: 'cyberware',
                system: {
                    essence: 0.4,
                    capacity: { total: 6, used: 0 },
                    grade: 'standard',
                    technology: { equipped: true },
                }
            });
            const modification = await factory.createItem({
                name: 'Flare Compensation',
                type: 'modification',
                system: {
                    essence: 0.1,
                    slots: 1,
                    technology: { equipped: true },
                    type: 'ware',
                }
            });

            await parent.createNestedItem(modification.toObject());
            parent.prepareData();

            assert.strictEqual(parent.system.capacity.used, 1);
            assert.strictEqual(parent.system.technology.calculated.essence.value, 0.5);
            assert.strictEqual(parent.getEssenceLoss(), 0.5);
        });

        it('applies bioware modification capacity and essence to the parent ware', async () => {
            const parent = await factory.createItem({
                type: 'bioware',
                system: {
                    essence: 0.3,
                    capacity: { total: 4, used: 0 },
                    grade: 'standard',
                    technology: { equipped: true, wireless: 'none' },
                }
            });
            const modification = await factory.createItem({
                name: 'Chemical Gland Expanded Reservoir',
                type: 'modification',
                system: {
                    essence: 0.05,
                    slots: 1,
                    technology: { equipped: true, wireless: 'none' },
                    type: 'ware',
                }
            });

            await parent.createNestedItem(modification.toObject());
            parent.prepareData();

            assert.strictEqual(parent.system.capacity.used, 1);
            assert.strictEqual(parent.system.technology.calculated.essence.value, 0.35);
            assert.strictEqual(parent.getEssenceLoss(), 0.35);
        });
    });
};

function buildAllowedSubsystemCategorySet(wares: any[]): Set<string> {
    const categories = new Set<string>();

    for (const ware of wares) {
        const subsystemCategories = asArray(ware.allowsubsystems?.category);
        for (const category of subsystemCategories) {
            if (category._TEXT) categories.add(category._TEXT);
        }
    }

    return categories;
}

function classifyWareImport(ware: any, allowedCategories: Set<string>): 'ware' | 'modification' | 'both' {
    if (ware.requireparent || ware.required?.parentdetails) return 'modification';
    if (ware.mountsto) return 'ware';
    if (/\[[^\]]+\]/.test(ware.capacity._TEXT) && allowedCategories.has(ware.category._TEXT)) return 'both';
    return 'ware';
}

function parseWareModificationSlots(value: string | null | undefined, rating = 0): number {
    const bracketed = String(value ?? '').match(/\[([^\]]+)\]/)?.[1];
    if (!bracketed) return 0;

    const normalized = bracketed.replace(/[{}()]/g, '').trim();
    const directNumber = Number(normalized);
    if (Number.isInteger(directNumber)) return directNumber;

    const parsedRating = Number(rating) || 0;
    const ratingOnly = normalized.match(/^(-)?\s*Rating$/i);
    if (ratingOnly) return ratingOnly[1] ? -parsedRating : parsedRating;

    const ratingMultiplier =
        normalized.match(/^Rating\s*[*xX]\s*(-?\d+)$/i) ??
        normalized.match(/^(-?\d+)\s*[*xX]\s*Rating$/i);
    if (ratingMultiplier) return parsedRating * (Number(ratingMultiplier[1]) || 0);

    return 0;
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}
