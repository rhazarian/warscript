import { AbilityTypeId } from "./object-data/entry/ability-type"

const getAbilityExtendedTooltip = BlzGetAbilityExtendedTooltip
const setAbilityExtendedTooltip = BlzSetAbilityExtendedTooltip

const originalTooltipByLevelByAbilityTypeId = new LuaMap<AbilityTypeId, LuaMap<number, string>>()
const overriddenTooltipByLevelByAbilityTypeId = new LuaMap<AbilityTypeId, LuaMap<number, string>>()

/**
 * The ability type's own extended tooltip for the level, unaffected by local display
 * overrides (see {@link overrideAbilityTypeExtendedTooltipLocally}). Use it instead of
 * `BlzGetAbilityExtendedTooltip` wherever the type's tooltip serves as a template.
 */
export const getAbilityTypeExtendedTooltip = (
    abilityTypeId: AbilityTypeId,
    level: number,
): string => {
    return (
        originalTooltipByLevelByAbilityTypeId.get(abilityTypeId)?.get(level) ??
        getAbilityExtendedTooltip(abilityTypeId, level)
    )
}

/**
 * Replaces the displayed extended tooltip of every ability of the type for the local
 * player only; `undefined` restores the type's own tooltip. The value is async: never
 * feed it back into synchronous logic.
 *
 * @internal For use by internal systems only.
 */
export const overrideAbilityTypeExtendedTooltipLocally = (
    abilityTypeId: AbilityTypeId,
    level: number,
    tooltip: string | undefined,
): void => {
    let overriddenTooltipByLevel = overriddenTooltipByLevelByAbilityTypeId.get(abilityTypeId)
    if (overriddenTooltipByLevel?.get(level) == tooltip) {
        return
    }
    let originalTooltipByLevel = originalTooltipByLevelByAbilityTypeId.get(abilityTypeId)
    if (originalTooltipByLevel == undefined) {
        originalTooltipByLevel = new LuaMap()
        originalTooltipByLevelByAbilityTypeId.set(abilityTypeId, originalTooltipByLevel)
    }
    let originalTooltip = originalTooltipByLevel.get(level)
    if (originalTooltip == undefined) {
        originalTooltip = getAbilityExtendedTooltip(abilityTypeId, level)
        originalTooltipByLevel.set(level, originalTooltip)
    }
    if (overriddenTooltipByLevel == undefined) {
        overriddenTooltipByLevel = new LuaMap()
        overriddenTooltipByLevelByAbilityTypeId.set(abilityTypeId, overriddenTooltipByLevel)
    }
    if (tooltip == undefined) {
        overriddenTooltipByLevel.delete(level)
    } else {
        overriddenTooltipByLevel.set(level, tooltip)
    }
    setAbilityExtendedTooltip(abilityTypeId, tooltip ?? originalTooltip, level)
}
