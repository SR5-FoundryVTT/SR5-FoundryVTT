import { DataImporter } from './DataImporter';
import { ActionParser } from '../parser/misc/ActionParser';
import { Action, ActionsSchema } from '../schema/ActionsSchema';

export class ActionImporter extends DataImporter {
    public readonly files = ['actions.xml'] as const;

    async _parse(jsonObject: ActionsSchema): Promise<void> {
        const matrixActions = await game.packs.get('shadowrun5e.sr5e-matrix-actions')?.getDocuments() ?? [];
        const ICActions = await game.packs.get('shadowrun5e.sr5e-ic-actions')?.getDocuments() ?? [];

        return ActionImporter.ParseItems<Action>(
            jsonObject.actions.action,
            {
                compendiumKey: () => "Action",
                parser: new ActionParser([...matrixActions, ...ICActions] as Item.Stored[]),
                documentType: "Action"
            }
        );
    }
}
