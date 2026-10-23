import { AbilityOrSnapshot } from "../ability"
import { Unit, UnitClassification } from "../unit"
import {
    DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD,
    DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"

/** @internal For use by internal systems only. */
export const getAbilityDuration = (ability: AbilityOrSnapshot, target?: Unit): number => {
    return target != undefined &&
        (target.isHero ||
            target.getField(UNIT_IF_LEVEL) >= 6 ||
            target.hasClassification(UnitClassification.RESISTANT))
        ? DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD.getCurrentValue(ability)
        : DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD.getCurrentValue(ability)
}
