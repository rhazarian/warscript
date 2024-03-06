import { Ability } from "../ability"
import { Unit, UnitClassification } from "../unit"
import {
    DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD,
    DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD,
} from "../../standard/fields/ability"

export const getAbilityDuration = (ability: Ability, target?: Unit): number => {
    const level = ability.level
    return target != undefined && target.hasClassification(UnitClassification.RESISTANT)
        ? DURATION_HERO_ABILITY_FLOAT_LEVEL_FIELD.getValue(ability, level)
        : DURATION_NORMAL_ABILITY_FLOAT_LEVEL_FIELD.getValue(ability, level)
}
