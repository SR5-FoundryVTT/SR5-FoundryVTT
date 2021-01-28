import SR5ActorType = Shadowrun.SR5ActorType;
import { SR5ItemDataWrapper } from '../../item/SR5ItemDataWrapper';
import SR5ActorData = Shadowrun.SR5ActorData;

export abstract class BaseActorPrep<ActorType extends SR5ActorType, DataType extends SR5ActorData> {
    data: DataType;
    items: SR5ItemDataWrapper[];

    constructor(data: ActorType) {
        // @ts-ignore
        this.data = data.data;
        // @ts-ignore
        this.items = data.items.map((item) => new SR5ItemDataWrapper(item));
    }

    // override with the correct order and functions to prepare the actor
    abstract prepare(): void;
}
