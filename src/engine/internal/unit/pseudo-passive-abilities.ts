import { AbilityTypeId } from "../../object-data/entry/ability-type"

/** @internal For use by internal systems only. */
export const compiletimePseudoPassiveAbilityTypeIds = new LuaSet<AbilityTypeId>()

/** @internal For use by internal systems only. */
export const pseudoPassiveAbilityTypeIds = postcompile(() => compiletimePseudoPassiveAbilityTypeIds)
