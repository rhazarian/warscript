/**
 * The weapon type of a unit's attack (`ua1w`/`ua2w`, `UNIT_WEAPON_IF_ATTACK_WEAPON_TYPE`):
 * how its damage reaches the target. The sound of the hit is `WeaponSoundType`.
 *
 * The native field holds single bits, not the editor's list index (where normal is 0 and
 * missile 4). Read in game: `NORMAL` 1 (Paladin), `MISSILE` 2 (Priest), `INSTANT` 4
 * (Rifleman). The other values continue the same order and are not verified yet.
 *
 * Only the missile kinds launch the weapon's missile; a melee (`NORMAL`) or `INSTANT` weapon
 * may still have a missile art and speed set in its data.
 */
export const enum WeaponType {
    NONE = 0,
    /** Melee. */
    NORMAL = 1,
    MISSILE = 2,
    /** Ranged, without a missile. */
    INSTANT = 4,
    ARTILLERY = 8,
    ARTILLERY_LINE = 16,
    MISSILE_SPLASH = 32,
    MISSILE_BOUNCE = 64,
    MISSILE_LINE = 128,
}
