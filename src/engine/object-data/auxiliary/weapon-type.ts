/**
 * The weapon type of a unit's attack (`ua1w`/`ua2w`, `UNIT_WEAPON_IF_ATTACK_WEAPON_TYPE`):
 * how its damage reaches the target. The sound of the hit is `WeaponSoundType`.
 *
 * The native field does not follow the editor's list (where normal is 0 and missile 4). Read
 * in game: `NORMAL` 1 (Paladin), `MISSILE` 2 (Priest), `ARTILLERY` 3 (Mortar Team), `INSTANT` 4
 * (Rifleman), `MISSILE_SPLASH` 5 (Frigate), `MISSILE_BOUNCE` 6 (Huntress), `MISSILE_LINE` 7
 * (Gryphon Rider); no standard unit has artillery (line), the remaining 8.
 *
 * Only the missile kinds launch the weapon's missile; a melee (`NORMAL`) or `INSTANT` weapon
 * may still have a missile art and speed set in its data.
 */
export const enum WeaponType {
    NONE = 0,
    /** Melee. */
    NORMAL = 1,
    MISSILE = 2,
    ARTILLERY = 3,
    /** Ranged, without a missile. */
    INSTANT = 4,
    MISSILE_SPLASH = 5,
    MISSILE_BOUNCE = 6,
    MISSILE_LINE = 7,
    ARTILLERY_LINE = 8,
}
