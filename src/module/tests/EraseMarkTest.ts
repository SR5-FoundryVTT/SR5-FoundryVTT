import { SR5Actor } from "../actor/SR5Actor";
import { MatrixTest } from "./MatrixTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";
import { MarksStorage } from '@/module/storage/MarksStorage';
import { SR5Item } from '@/module/item/SR5Item';

type EraseMarkData = MatrixPlacementData & {
    markUuid: string;
}

type MarkData = {
    name: string;
    personaUuid: string;
    count: number;
}

/**
 * Erase Mark - SR5 #239
 * - Actor targets the device they wish to erase marks on
 * - the dialog lets the user select which mark to erase
 */
export class EraseMarkTest extends MatrixTest<EraseMarkData> {
    declare actor: SR5Actor;
    declare marks: MarkData[];

    override _prepareData(data: EraseMarkData, options): any {
        data = super._prepareData(data, options);
        data.marks = data.marks ?? 1;
        data.markUuid = data.markUuid ?? '';
        return data;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'erase_mark'];
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/erase-mark-test-dialog.hbs';
    }

    override async populateDocuments(): Promise<void> {
        await super.populateDocuments();
        console.log('icon', this.icon);

        const map = this.icon ? MarksStorage.retrieveMarksOnIcon(this.icon.uuid) : new Map();
        console.log('got map', map);
        this.marks = [];
        for (const [uuid, count] of map.entries()) {
            const document = fromUuidSync(uuid);
            if (document && (document instanceof SR5Item || document instanceof SR5Actor)) {
                this.marks.push({
                    name: document instanceof SR5Actor ? (document.getToken()?.name ?? document.name) : document.name,
                    personaUuid: document.uuid,
                    count,
                })
            }
        }
        this.data.markUuid = this.marks[0]?.personaUuid ?? '';
        this.data.marks = this.marks[0]?.count ?? 1;
    }

    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareEraseTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}
