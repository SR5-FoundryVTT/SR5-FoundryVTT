/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import {VersionMigration} from "../VersionMigration";
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import {SR5} from "../../config";
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export class Version0_8_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.7.6';
    }

    get TargetVersion(): string {
        return Version0_8_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.8.0";
    }

    protected async ShouldMigrateItemData(data: ShadowrunItemData) {
        return this._ShouldMigrateItemData(data);
    }

    protected _ShouldMigrateItemData(data: ShadowrunItemData): boolean {
        return ['weapon'].includes(data.type);
    }

    protected async MigrateItemData(data: ShadowrunItemData) {
        const updateData: {
            data?: object
        } = {};

        switch (data.type) {
            // Opposed And Resist will be handled by Foundry template migration.
            case 'weapon': {
                // Some weapons might not have category set yet, so leave them.
                if (data.data.category) {
                    const test = SR5.weaponCategoryActiveTests[data.data.category];
                    updateData.data = {action: {test}};
                }

                break;
            }

            case 'spell': {
                switch (data.data.category) {
                    case '': {
                    updateData.data = {data: {
                            action: {test: '', opposed: {test: '', resist: {test: ''}}}}
                    };
                    break;
                }
                default: {
                    const activeTest = SR5.activeTests[data.type];
                    const opposedTest = SR5.opposedTests[data.type][data.data.category] || 'OpposedTest';
                    const resistTest = SR5.opposedResistTests[data.type][data.data.category] || '';

                    updateData.data = {data: {action: {
                        test: activeTest,
                        opposed: {test: opposedTest,
                                  resist:  {test: resistTest}}}}};
                    break;
                }
                }
            }
        }

        return updateData;
    }

    protected async ShouldMigrateActorData(data: ShadowrunActorData) {
        // @ts-ignore
        return data.items.contents.filter(i => this._ShouldMigrateItemData(i.data)).length > 0;
    }

    protected async MigrateActorData(data: ShadowrunActorData) {
        let updateData: {
            data?: object,
            items?: object[]
        } = {
            items: []
        };

        updateData = await this.IterateActorItems(data, updateData);

        return updateData;
    }
}