import { AbilityBehavior } from "../ability"
import { UnitAbility } from "../../internal/ability"
import { Destructor } from "../../../destroyable"
import { increaseAbilityDisableCounter } from "../../internal/misc/ability-disable-counter"

export class AlwaysEnabledAbilityBehavior extends AbilityBehavior {
    protected override onCreate(): void {
        const ability = this.ability
        if (!(ability instanceof UnitAbility)) {
            return
        }
        increaseAbilityDisableCounter(ability.owner.handle, ability.typeId, -10)
    }

    protected override onDestroy(): Destructor {
        const ability = this.ability
        if (!(ability instanceof UnitAbility)) {
            return super.onDestroy()
        }
        increaseAbilityDisableCounter(ability.owner.handle, ability.typeId, 10)
        return super.onDestroy()
    }
}
