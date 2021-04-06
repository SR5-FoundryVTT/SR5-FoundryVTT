import SR5ActorType = Shadowrun.SR5ActorType;
import { CharacterPrep } from './CharacterPrep';
import { SpiritPrep } from './SpiritPrep';
import { SpritePrep } from './SpritePrep';
import { VehiclePrep } from './VehiclePrep';
import { CritterPrep } from './CritterPrep';
import {ICPrep} from "./ICPrep";

export class ActorPrepFactory {
    static Create(data: SR5ActorType) {
        switch (data.type) {
            case 'character':
                return new CharacterPrep(data);
            case 'spirit':
                return new SpiritPrep(data);
            case 'sprite':
                return new SpritePrep(data);
            case 'vehicle':
                return new VehiclePrep(data);
            case 'critter':
                return new CritterPrep(data);
            case "ic":
                return new ICPrep(data);
        }
    }
}
