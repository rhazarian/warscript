/**
 * @internal The original natives, captured before `unit+ability` wraps them to report
 * ability level changes. For internal level juggling that must not be reported.
 */
export const rawSetUnitAbilityLevel = SetUnitAbilityLevel

/** @internal */
export const rawIncUnitAbilityLevel = IncUnitAbilityLevel

/** @internal */
export const rawDecUnitAbilityLevel = DecUnitAbilityLevel
