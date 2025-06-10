import { DataWrapper } from './DataWrapper';
import ConditionData = Shadowrun.ConditionData;
import SpellData = Shadowrun.SpellData;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import SpellRange = Shadowrun.SpellRange;
import RangeWeaponData = Shadowrun.RangeWeaponData;
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunItemDataData = Shadowrun.ShadowrunItemDataData;
import ModificationItemData = Shadowrun.ModificationItemData;
import AmmunitionData = Shadowrun.AmmunitionData;
import WeaponData = Shadowrun.WeaponData;

export class SR5ItemDataWrapper extends DataWrapper<ShadowrunItemData> {
    getData(): ShadowrunItemDataData {
        return this.data.system as ShadowrunItemDataData;
    }
}
