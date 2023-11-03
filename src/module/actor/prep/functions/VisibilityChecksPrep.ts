import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export default class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     * 
     * NOTE: Currently these aren't controlled by the Foundry template. But ONLY here.
     *       Therefore adding a modifier to an actor DataModel happens here and during Actor#prepareData
     */
    static preparVisibilityChecks(system: ActorTypesData, type: String) {

        this.preparVisibilityChecksBase(system)

        switch(type) {
            case "character":
                this.preparVisibilityChecksDevices(system)
            case "critter" :
                this.preparVisibilityChecksLiving(system)
                break;
            case "spirit":
                this.preparVisibilityChecksSpirit(system)
                break;
            case "sprite":
            case "ic":
                this.preparVisibilityChecksMatrix(system)
                break;
            case "vehicle":
                this.preparVisibilityChecksMachine(system)
                break;
        }
    }

    private static preparVisibilityChecksBase(system: ActorTypesData) {
        system.visibilityChecks = {
            astral: {
                hasAura: false,
                affectedBySpell: false,
                astralActive: false
            },
            meat: {
                hasHeat: false,
                hidden:false
            },
            matrix: {
                hasIcon: false,
                runningSilent: false
            }
        }
    }

    private static preparVisibilityChecksDevices(system: ActorTypesData) {
        system.visibilityChecks.matrix.hasIcon = true;
    }

    private static preparVisibilityChecksLiving(system: ActorTypesData) {
        system.visibilityChecks.astral.hasAura = true;

        system.visibilityChecks.meat.hasHeat = true;
    }

    private static preparVisibilityChecksSpirit(system: ActorTypesData) {
        system.visibilityChecks.astral.astralActive = true;
        system.visibilityChecks.astral.hasAura = true;
    }

    private static preparVisibilityChecksMatrix(system: ActorTypesData) {
        system.visibilityChecks.matrix.hasIcon = true;
    }

    private static preparVisibilityChecksMachine(system: ActorTypesData) {
        system.visibilityChecks.meat.hasHeat = true;
        system.visibilityChecks.matrix.hasIcon = true;
    }

}
