import { DeepPartial } from 'fvtt-types/utils';
import { ActiveSensorLockFlow } from '@/module/flows/ActiveSensorLockFlow';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { SuccessTestData } from '@/module/tests/SuccessTest';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ActionRollType, MinimalActionType } from '@/module/types/item/Action';
import { Translation } from '../utils/strings';

/**
 * Implement the opposing test for Active Sensor Targeting action.
 * SR5 p. 184 / p. 270 / Rigger 5.0 p. 182
 */
export class OpposedActiveSensorLockTest extends OpposedTest {
    override get successLabel(): Translation {
        return "SR5.TestResults.ActiveSensorLockFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.ActiveSensorLockSuccess";
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['rigging'];
    }

    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor): DeepPartial<MinimalActionType> {
        if (!actor) return {};

        if (actor.isType('vehicle')) {
            if (actor.system.controlMode === 'autopilot') {
                return {
                    attribute: 'pilot',
                    attribute2: '',
                    skill: 'sneaking',
                    limit: { attribute: 'handling' }
                };
            }
            return {
                attribute: 'reaction',
                attribute2: '',
                skill: 'sneaking',
                limit: { attribute: 'handling' }
            };
        }

        return {
            attribute: 'agility',
            attribute2: '',
            skill: 'sneaking',
            limit: { attribute: 'physical' }
        };
    }

    static override _prepareActionTestData(
        action: ActionRollType,
        document: SR5Actor | SR5Item,
        data: SuccessTestData,
        againstData?: SuccessTestData
    ) {
        if (document instanceof SR5Actor) {
            if (document.isType('vehicle')) {
                action.attribute = document.system.controlMode === 'autopilot' ? 'pilot' : 'reaction';
                action.attribute2 = '';
                action.skill = 'sneaking';
                action.limit.attribute = 'handling';
            } else {
                action.attribute = 'agility';
                action.attribute2 = '';
                action.skill = 'sneaking';
                action.limit.attribute = 'physical';
            }
        }

        return super._prepareActionTestData(action, document, data, againstData);
    }

    /**
     * When defender fails the opposed test against active sensor targeting, the target lock is established
     * and the 'sr5sensorLock' status effect is applied on the defender.
     */
    override async processFailure() {
        await super.processFailure();

        const attacker = this.against?.actor;
        const defender = this.actor;
        const netHits = this.againstNetHits?.value ?? Math.max(1, (this.against?.hits?.value ?? 0) - this.hits.value);

        if (attacker && defender && netHits > 0) {
            await ActiveSensorLockFlow.applySensorLock(attacker, defender, netHits);
        }
    }
}
