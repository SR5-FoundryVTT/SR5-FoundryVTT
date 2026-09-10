import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MatrixNetworkFlow } from "../item/flows/MatrixNetworkFlow";
const { DOCUMENT_OWNERSHIP_LEVELS } = foundry.CONST;

export default class Sr5Tour extends foundry.nue.Tour {
    tab?: string;
    actor?: SR5Actor;
    tourTokenDoc?: any;
    tourItem?: SR5Item;

    override async _preStep() {
        await super._preStep();

        const currentStep = this.currentStep as any;
        const stepId = currentStep?.id;

        // 1. Create actor if needed with minimum ratings >= 1
        if (!this.actor) {
            const actorType = (this.config as any)?.actorType || 'character';
            const droneImg = "systems/shadowrun5e/dist/icons/importer/drone/medium.svg";
            this.actor = (await SR5Actor.create({
                name: "Tour Drone Swarm",
                type: actorType,
                img: droneImg,
                prototypeToken: {
                    texture: {
                        src: droneImg
                    }
                },
                system: {
                    isDrone: true,
                    subCategory: "medium_drone",
                    attributes: {
                        body: { base: 4 }
                    },
                    vehicle_stats: {
                        pilot: { base: 3 },
                        handling: { base: 4 },
                        speed: { base: 4 },
                        acceleration: { base: 2 },
                        sensor: { base: 3 }
                    },
                    swarm: {
                        active: false,
                        count: 1
                    }
                },
                items: [
                    {
                        name: "Clearsight (Rating 3)",
                        type: "program",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: { type: "autosoft", autosoftType: "clearsight", technology: { rating: 3, equipped: true } },
                        effects: [
                            {
                                name: "Clearsight Autosoft (Rating 3)",
                                img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                                system: {
                                    targets: [{ id: "t1", applyTo: "actor" }],
                                    changes: []
                                }
                            }
                        ]
                    },
                    {
                        name: "Evasion (Rating 3)",
                        type: "program",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: { type: "autosoft", autosoftType: "evasion", technology: { rating: 3, equipped: true } }
                    },
                    {
                        name: "Targeting (Rating 3)",
                        type: "program",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: { type: "autosoft", autosoftType: "targeting", technology: { rating: 3, equipped: true } }
                    },
                    {
                        name: "Command Master RCC (Rating 5)",
                        type: "device",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: {
                            category: "rcc",
                            sharing: 3,
                            noise_reduction: 2,
                            technology: { rating: 5, equipped: true }
                        }
                    },
                    {
                        name: "Maneuvering (Rating 4)",
                        type: "program",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: { type: "autosoft", autosoftType: "maneuvering", technology: { rating: 4, equipped: true } }
                    }
                ],
                ownership: {
                    default: DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            })) as SR5Actor;
        }

        // 2. Step-by-step modifications for RiggerSwarm and Autosofts tours
        if (this.id === "RiggerSwarm") {
            if (stepId === "DroneAttributes" || stepId === "EnableSwarm") {
                await this.actor.update({ "system.swarm.active": false, "system.swarm.count": 1 } as any);
                if (this.actor.sheet) {
                    (this.actor.sheet as any)._mode = 'edit';
                    await (this.actor.sheet as any).render(true);
                }
            } else if (stepId === "EnableSwarmActive") {
                await this.actor.update({ "system.swarm.active": true, "system.swarm.count": 1 } as any);
                if (this.actor.sheet) {
                    (this.actor.sheet as any)._mode = 'edit';
                    await (this.actor.sheet as any).render(true);
                }
            } else if (stepId === "SwarmCount") {
                await this.actor.update({ "system.swarm.active": true, "system.swarm.count": 4 } as any);
                if (this.actor.sheet) {
                    (this.actor.sheet as any)._mode = 'edit';
                    await (this.actor.sheet as any).render(true);
                }
            } else if (stepId === "CanvasSwarmDisplay" || stepId === "TokenHUDControl") {
                if (this.actor.sheet) {
                    await this.actor.sheet.close();
                }

                if (canvas.scene && !this.tourTokenDoc) {
                    const hitArea = canvas.stage?.hitArea as any;
                    const center = hitArea?.width
                        ? { x: Math.floor(hitArea.width / 2), y: Math.floor(hitArea.height / 2) }
                        : { x: 1000, y: 1000 };

                    const tokenData = await this.actor.getTokenDocument({
                        x: center.x,
                        y: center.y,
                        texture: { src: this.actor.img || "systems/shadowrun5e/dist/icons/importer/drone/medium.svg" }
                    });
                    const [created] = await canvas.scene.createEmbeddedDocuments("Token", [tokenData.toObject()]);
                    this.tourTokenDoc = created;
                    if (created?.object) {
                        canvas.animatePan({ x: created.x, y: created.y, scale: 1.2, duration: 500 });
                    }
                }
            }
        } else if (this.id === "Autosofts") {
            if (stepId === "AutosoftItemCreation" || stepId === "AutosoftTypes" || stepId === "AutosoftPlayMode") {
                if (this.actor?.sheet) {
                    await this.actor.sheet.close();
                }
                if (!this.tourItem) {
                    this.tourItem = (await SR5Item.create({
                        name: "Clearsight (Rating 3)",
                        type: "program",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: {
                            type: "autosoft",
                            autosoftType: "clearsight",
                            technology: {
                                rating: 3
                            }
                        },
                        ownership: {
                            default: DOCUMENT_OWNERSHIP_LEVELS.OWNER
                        }
                    })) as SR5Item;
                }

                if (this.tourItem?.sheet) {
                    if (stepId === "AutosoftItemCreation" || stepId === "AutosoftTypes") {
                        (this.tourItem.sheet as any)._mode = 'edit';
                    } else if (stepId === "AutosoftPlayMode") {
                        (this.tourItem.sheet as any)._mode = 'play';
                    }
                    if (!(this.tourItem.sheet as any).rendered) {
                        await (this.tourItem.sheet as any).render(true);
                    }
                }
            } else if (stepId === "EquipAutosoftOnDrone" || stepId === "DroneSlotLimits" || stepId === "RCCOverrideHierarchy" || stepId === "AutosoftEffects") {
                if (this.tourItem?.sheet) {
                    await this.tourItem.sheet.close();
                }

                if (stepId === "EquipAutosoftOnDrone") {
                    // Equip only 1 autosoft so warning banner is OFF in step 4
                    let count = 0;
                    for (const item of this.actor.items) {
                        if (item.type === "program" && (item.system as any)?.type === "autosoft") {
                            count++;
                            const shouldEquip = count === 1;
                            if (item.isEquipped() !== shouldEquip) {
                                await item.update({ "system.technology.equipped": shouldEquip } as any, { render: false });
                            }
                        }
                    }
                } else if (stepId === "DroneSlotLimits") {
                    // Equip 3 autosofts so runningCount = 3 > maxSlots (2), triggering the warning banner in step 5!
                    for (const item of this.actor.items) {
                        if (item.type === "program" && (item.system as any)?.type === "autosoft") {
                            if (!item.isEquipped()) {
                                await item.update({ "system.technology.equipped": true } as any, { render: false });
                            }
                        }
                    }
                } else if (stepId === "RCCOverrideHierarchy") {
                    const rccItem = this.actor.items.find(i => i.type === "device" && (i.system as any)?.category === "rcc");
                    if (rccItem && (!this.actor.master || this.actor.master.id !== rccItem.id)) {
                        await MatrixNetworkFlow.addSlave(rccItem, this.actor, { triggerUpdate: false });
                    }
                }

                if (this.actor?.sheet) {
                    (this.actor.sheet as any)._mode = 'play';
                    if ((this.actor.sheet as any).tabGroups) {
                        (this.actor.sheet as any).tabGroups['primary'] = 'matrix';
                    }
                    await (this.actor.sheet as any).render(true);
                    await new Promise(resolve => setTimeout(resolve, 350));
                }
            }
        } else if (this.id === "MatrixNoise") {
            if (stepId === "MatrixNoiseOverview" || stepId === "RCCNoiseVsSharing") {
                if (this.actor?.sheet?.rendered) {
                    await this.actor.sheet.close();
                }
                if (!this.tourItem) {
                    this.tourItem = (await SR5Item.create({
                        name: "Triangulator RCC (Rating 5)",
                        type: "device",
                        img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                        system: {
                            category: "rcc",
                            sharing: 3,
                            noise_reduction: 2,
                            technology: {
                                rating: 5,
                                equipped: true
                            }
                        },
                        ownership: {
                            default: DOCUMENT_OWNERSHIP_LEVELS.OWNER
                        }
                    })) as SR5Item;
                }

                if (this.tourItem?.sheet) {
                    (this.tourItem.sheet as any)._mode = 'edit';
                    if (!(this.tourItem.sheet as any).rendered) {
                        await (this.tourItem.sheet as any).render(true);
                        await new Promise(resolve => setTimeout(resolve, 150));
                    }
                }
            } else if (stepId === "NoiseReductionCalculation" || stepId === "SoftWarningBadges") {
                if (this.tourItem?.sheet?.rendered) {
                    await this.tourItem.sheet.close();
                }

                let existingRcc: any = this.actor.items.find(i => i.type === "device" && (i.system as any)?.category === "rcc");
                if (!existingRcc) {
                    const [createdRcc] = (await this.actor.createEmbeddedDocuments("Item", [
                        {
                            name: "Triangulator RCC (Rating 5)",
                            type: "device",
                            img: "systems/shadowrun5e/dist/icons/importer/drone/medium.svg",
                            system: {
                                category: "rcc",
                                sharing: 3,
                                noise_reduction: 2,
                                technology: {
                                    rating: 5,
                                    equipped: true
                                }
                            }
                        }
                    ], { render: false })) as any[];
                    existingRcc = createdRcc;
                }

                if (existingRcc && (!this.actor.master || this.actor.master.id !== existingRcc.id)) {
                    try {
                        await MatrixNetworkFlow.addSlave(existingRcc, this.actor, { triggerUpdate: false });
                    } catch (e) {}
                }

                const targetSharing = stepId === "SoftWarningBadges" ? 4 : 3;
                const targetNoiseRed = stepId === "SoftWarningBadges" ? 3 : 2;

                if (existingRcc && (existingRcc.system.sharing !== targetSharing || existingRcc.system.noise_reduction !== targetNoiseRed)) {
                    await existingRcc.update({
                        "system.sharing": targetSharing,
                        "system.noise_reduction": targetNoiseRed
                    } as any, { render: false });
                }

                if (this.actor?.sheet) {
                    (this.actor.sheet as any)._mode = 'play';
                    if ((this.actor.sheet as any).tabGroups) {
                        (this.actor.sheet as any).tabGroups['primary'] = 'matrix';
                    }
                    await (this.actor.sheet as any).render(true);
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }
        } else {
            if (this.actor?.sheet && !(this.actor.sheet as any).rendered) {
                await (this.actor.sheet as any).render(true);
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }

        // 3. Tab switching
        const targetTab = currentStep?.tab || (this.config as any)?.tab;
        const activeSheet = ((this.id === "Autosofts" && (stepId === "AutosoftItemCreation" || stepId === "AutosoftTypes" || stepId === "AutosoftPlayMode")) ||
                             (this.id === "MatrixNoise" && (stepId === "MatrixNoiseOverview" || stepId === "RCCNoiseVsSharing")))
            ? this.tourItem?.sheet
            : this.actor?.sheet;

        if (targetTab && activeSheet) {
            if (!activeSheet.rendered) {
                await activeSheet.render(true);
            }
            await this._switchTab(activeSheet, targetTab, 'primary');
            if (this.id === "Autosofts" && (stepId === "EquipAutosoftOnDrone" || stepId === "DroneSlotLimits" || stepId === "RCCOverrideHierarchy")) {
                await this._switchTab(activeSheet, 'programs', 'matrixLeft');
            }
            if (typeof activeSheet.bringToTop === 'function') {
                try {
                    activeSheet.bringToTop();
                } catch (e) {}
            }
        }

        // Give DOM a tick to complete rendering/mounting before Tour highlights selector element
        await new Promise(resolve => setTimeout(resolve, 300));
        this._bringTourToFront();
    }

    override async _postStep() {
        await super._postStep();
        this._bringTourToFront();
    }

    protected _bringTourToFront() {
        const lift = () => {
            const selectors = [
                '#tour-tooltip',
                '.nue-tooltip',
                '.tour-dialog',
                '.tour-step',
                '.tour-fade',
                '[id^="tour-"]',
                '.nue-step'
            ];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach((el: Element) => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.style.zIndex = '100000';
                    htmlEl.style.pointerEvents = 'auto';
                });
            });
        };
        setTimeout(lift, 50);
        setTimeout(lift, 250);
        setTimeout(lift, 600);
    }

    protected async _switchTab(sheet: any, targetTab: string, group: string = 'primary') {
        if (!sheet || !sheet.rendered || !sheet.element) return;

        if (sheet.tabGroups) {
            sheet.tabGroups[group] = targetTab;
        }

        if (typeof sheet.changeTab === 'function') {
            try {
                await sheet.changeTab(targetTab, group);
            } catch (e) {
                console.warn(`Sr5Tour | changeTab failed for tab ${targetTab} in group ${group}:`, e);
            }
        }

        const root = sheet.element as HTMLElement;

        // Toggle active class on tab buttons in DOM
        const tabLinks = root.querySelectorAll(`[data-action="tab"], [data-tab]`);
        tabLinks.forEach((link: Element) => {
            const linkTab = link.getAttribute('data-tab');
            const linkGroup = link.getAttribute('data-group') || 'primary';
            if (linkGroup === group && linkTab) {
                if (linkTab === targetTab) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });

        // Toggle active class and display state on tab content panels in DOM
        const tabPanels = root.querySelectorAll(`.tab`);
        tabPanels.forEach((panel: Element) => {
            const panelTab = panel.getAttribute('data-tab');
            const panelGroup = panel.getAttribute('data-group') || 'primary';
            if (panelGroup === group && panelTab) {
                if (panelTab === targetTab) {
                    panel.classList.add('active');
                    (panel as HTMLElement).style.display = '';
                } else {
                    panel.classList.remove('active');
                }
            }
        });
    }

    protected override _getTargetElement(selector: string): Element | null {
        if (!selector) return null;

        const activeSheet = ((this.id === "Autosofts" && (
            (this.currentStep as any)?.id === "AutosoftItemCreation" ||
            (this.currentStep as any)?.id === "AutosoftTypes" ||
            (this.currentStep as any)?.id === "AutosoftPlayMode"
        )) || (this.id === "MatrixNoise" && (
            (this.currentStep as any)?.id === "MatrixNoiseOverview" ||
            (this.currentStep as any)?.id === "RCCNoiseVsSharing"
        )))
            ? this.tourItem?.sheet
            : this.actor?.sheet;

        let el: Element | null = null;

        if (activeSheet?.rendered && activeSheet?.element) {
            el = (activeSheet.element as HTMLElement).querySelector(selector);
        }

        if (!el) {
            el = document.querySelector(selector);
        }

        const isVisible = (element: Element | null): boolean => {
            if (!element || !element.isConnected) return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        };

        if (isVisible(el)) {
            return el;
        }

        if (isVisible(activeSheet?.element as Element)) {
            return activeSheet!.element as Element;
        }

        return document.body;
    }

    protected async _cleanUpTour(closeToursManagement: boolean = true) {
        if (this.tourItem?.sheet) {
            try {
                await this.tourItem.sheet.close();
            } catch (e) {}
        }
        if (this.tourItem) {
            try {
                const itemId = this.tourItem.id;
                if (itemId && (game.items as any)?.get(itemId)) {
                    await this.tourItem.delete();
                }
            } catch (e) {}
            this.tourItem = undefined;
        }
        if (this.actor?.sheet) {
            try {
                await this.actor.sheet.close();
            } catch (e) {}
        }
        if (this.tourTokenDoc && canvas.scene) {
            try {
                await this.tourTokenDoc.delete();
            } catch (e) {}
            this.tourTokenDoc = undefined;
        }
        if (this.actor) {
            try {
                const actorId = this.actor.id;
                if (actorId && (game.actors as any)?.get(actorId)) {
                    await this.actor.delete();
                }
            } catch (e) {}
            this.actor = undefined;
        }

        if (closeToursManagement) {
            // Close any open Tour Management window
            try {
                if ((foundry.applications as any)?.instances) {
                    for (const app of (foundry.applications as any).instances.values()) {
                        if (app.constructor?.name === "ToursManagement" || (app.options as any)?.id === "tours-management") {
                            await app.close();
                        }
                    }
                }
                for (const app of Object.values((ui as any).windows || {})) {
                    if ((app as any).constructor?.name === "ToursManagement" || (app as any).options?.id === "tours-management") {
                        await (app as any).close();
                    }
                }
            } catch (e) {}
        }
    }

    override async complete() {
        await this._cleanUpTour(true);
        return super.complete();
    }

    override async exit() {
        await this._cleanUpTour(true);
        return super.exit();
    }

    override async reset() {
        await this._cleanUpTour(false);
        return super.reset();
    }
}


