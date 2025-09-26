import { DataImporter } from './DataImporter';
import { ActionParser } from '../parser/misc/ActionParser';
import { Action, ActionsSchema } from '../schema/ActionsSchema';

export class ActionImporter extends DataImporter {
    public readonly files = ['actions.xml'] as const;

    async _parse(jsonObject: ActionsSchema): Promise<void> {
        return ActionImporter.ParseItems<Action>(
            jsonObject.actions.action,
            {
                compendiumKey: () => "Action",
                parser: new ActionParser(),
                documentType: "Action"
            }
        );
    }
}
