/**
 * The weapon type of a unit's attack (`ua1w`/`ua2w`, `UNIT_WEAPON_IF_ATTACK_WEAPON_TYPE`):
 * how its damage reaches the target. Not to be confused with `WeaponType`, the weapon sound.
 *
 * Only the missile kinds launch the weapon's missile; a melee (`NORMAL`) or `INSTANT` weapon
 * may still have a missile art and speed set in its data.
 */
export const enum UnitWeaponType {
    NONE = 0,
    /** Melee. */
    NORMAL = 1,
    /** Ranged, without a missile. */
    INSTANT = 2,
    ARTILLERY = 3,
    ARTILLERY_LINE = 4,
    MISSILE = 5,
    MISSILE_SPLASH = 6,
    MISSILE_BOUNCE = 7,
    MISSILE_LINE = 8,
}
