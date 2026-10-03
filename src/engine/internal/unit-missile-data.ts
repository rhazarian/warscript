import { UnitType } from "../object-data/entry/unit-type"
import { associate } from "../../utility/arrays"
import { mapValues } from "../../utility/lua-maps"
import { LocalClient } from "../local-client"

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_IMPACT_OFFSET_Z = 60

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_LAUNCH_OFFSET_X = 0

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_LAUNCH_OFFSET_Y = 0

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_X = 0

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_Y = 0

/** @internal For use by internal systems only. */
export const DEFAULT_MISSILE_LAUNCH_OFFSET_Z = 60

const DEFAULT_VALUES = {
    impactOffsetZ: DEFAULT_MISSILE_IMPACT_OFFSET_Z,
    launchOffsetX: DEFAULT_MISSILE_LAUNCH_OFFSET_X,
    launchOffsetY: DEFAULT_MISSILE_LAUNCH_OFFSET_Y,
    launchOffsetZ: DEFAULT_MISSILE_LAUNCH_OFFSET_Z,
    launchVisualOffsetX: DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_X,
    launchVisualOffsetY: DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_Y,
} as const

const METATABLE = {
    __index: DEFAULT_VALUES,
} as const

const enum PropertyKey {
    IMPACT_OFFSET_Z,
    IMPACT_OFFSET_Z_HD,
    IMPACT_OFFSET_Z_DE,
    LAUNCH_OFFSET_X,
    LAUNCH_OFFSET_Y,
    LAUNCH_OFFSET_Z,
    LAUNCH_OFFSET_Z_HD,
    LAUNCH_OFFSET_Z_DE,
    LAUNCH_VISUAL_OFFSET_X,
    LAUNCH_VISUAL_OFFSET_X_HD,
    LAUNCH_VISUAL_OFFSET_X_DE,
    LAUNCH_VISUAL_OFFSET_Y,
    LAUNCH_VISUAL_OFFSET_Y_HD,
    LAUNCH_VISUAL_OFFSET_Y_DE,
}

const rawDataByUnitTypeId = postcompile(() => {
    return associate(
        UnitType.getAll(),
        (unitType) => unitType.id,
        (unitType) => {
            return {
                [PropertyKey.IMPACT_OFFSET_Z]:
                    unitType.missileImpactOffsetZSD != DEFAULT_MISSILE_IMPACT_OFFSET_Z
                        ? unitType.missileImpactOffsetZSD
                        : undefined,
                [PropertyKey.IMPACT_OFFSET_Z_HD]:
                    unitType.missileImpactOffsetZHD != unitType.missileImpactOffsetZSD
                        ? unitType.missileImpactOffsetZHD
                        : undefined,
                [PropertyKey.IMPACT_OFFSET_Z_DE]:
                    unitType.missileImpactOffsetZDE != unitType.missileImpactOffsetZSD
                        ? unitType.missileImpactOffsetZDE
                        : undefined,
                [PropertyKey.LAUNCH_OFFSET_X]:
                    unitType.missileLaunchOffsetX != DEFAULT_MISSILE_LAUNCH_OFFSET_X
                        ? unitType.missileLaunchOffsetX
                        : undefined,
                [PropertyKey.LAUNCH_OFFSET_Y]:
                    unitType.missileLaunchOffsetY != DEFAULT_MISSILE_LAUNCH_OFFSET_Y
                        ? unitType.missileLaunchOffsetY
                        : undefined,
                [PropertyKey.LAUNCH_OFFSET_Z]:
                    unitType.missileLaunchOffsetZSD != DEFAULT_MISSILE_LAUNCH_OFFSET_Z
                        ? unitType.missileLaunchOffsetZSD
                        : undefined,
                [PropertyKey.LAUNCH_OFFSET_Z_HD]:
                    unitType.missileLaunchOffsetZHD != unitType.missileLaunchOffsetZSD
                        ? unitType.missileLaunchOffsetZHD
                        : undefined,
                [PropertyKey.LAUNCH_OFFSET_Z_DE]:
                    unitType.missileLaunchOffsetZDE != unitType.missileLaunchOffsetZSD
                        ? unitType.missileLaunchOffsetZDE
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_X]:
                    unitType.missileLaunchVisualOffsetXSD != DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_X
                        ? unitType.missileLaunchVisualOffsetXSD
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_X_HD]:
                    unitType.missileLaunchVisualOffsetXHD != unitType.missileLaunchVisualOffsetXSD
                        ? unitType.missileLaunchVisualOffsetXHD
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_X_DE]:
                    unitType.missileLaunchVisualOffsetXDE != unitType.missileLaunchVisualOffsetXSD
                        ? unitType.missileLaunchVisualOffsetXDE
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_Y]:
                    unitType.missileLaunchVisualOffsetYSD != DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_Y
                        ? unitType.missileLaunchVisualOffsetYSD
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_Y_HD]:
                    unitType.missileLaunchVisualOffsetYHD != unitType.missileLaunchVisualOffsetYSD
                        ? unitType.missileLaunchVisualOffsetYHD
                        : undefined,
                [PropertyKey.LAUNCH_VISUAL_OFFSET_Y_DE]:
                    unitType.missileLaunchVisualOffsetYDE != unitType.missileLaunchVisualOffsetYSD
                        ? unitType.missileLaunchVisualOffsetYDE
                        : undefined,
            }
        },
    )
})

type RawData = typeof rawDataByUnitTypeId extends ReadonlyLuaMap<any, infer V> ? V : never

const resolveData = (data: RawData) => {
    return setmetatable(
        {
            impactOffsetZ: LocalClient.isHD
                ? (data[PropertyKey.IMPACT_OFFSET_Z_HD] ?? data[PropertyKey.IMPACT_OFFSET_Z])
                : LocalClient.isDE
                  ? (data[PropertyKey.IMPACT_OFFSET_Z_DE] ?? data[PropertyKey.IMPACT_OFFSET_Z])
                  : data[PropertyKey.IMPACT_OFFSET_Z],
            launchOffsetX: data[PropertyKey.LAUNCH_OFFSET_X],
            launchOffsetY: data[PropertyKey.LAUNCH_OFFSET_Y],
            launchOffsetZ: LocalClient.isHD
                ? (data[PropertyKey.LAUNCH_OFFSET_Z_HD] ?? data[PropertyKey.LAUNCH_OFFSET_Z])
                : LocalClient.isDE
                  ? (data[PropertyKey.LAUNCH_OFFSET_Z_DE] ?? data[PropertyKey.LAUNCH_OFFSET_Z])
                  : data[PropertyKey.LAUNCH_OFFSET_Z],
            launchVisualOffsetX: LocalClient.isHD
                ? (data[PropertyKey.LAUNCH_VISUAL_OFFSET_X_HD] ??
                  data[PropertyKey.LAUNCH_VISUAL_OFFSET_X])
                : LocalClient.isDE
                  ? (data[PropertyKey.LAUNCH_VISUAL_OFFSET_X_DE] ??
                    data[PropertyKey.LAUNCH_VISUAL_OFFSET_X])
                  : data[PropertyKey.LAUNCH_VISUAL_OFFSET_X],
            launchVisualOffsetY: LocalClient.isHD
                ? (data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y_HD] ??
                  data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y])
                : LocalClient.isDE
                  ? (data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y_DE] ??
                    data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y])
                  : data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y],
        },
        METATABLE,
    )
}

/** @internal For use by internal systems only. */
export const MISSILE_DATA_BY_UNIT_TYPE_ID = setmetatable(
    mapValues(rawDataByUnitTypeId, resolveData),
    {
        __index() {
            return DEFAULT_VALUES
        },
    },
)

// The graphics mode is only known after map initialization (see LocalClient), so the
// values resolved at load time are the SD ones; resolve them again once it is known.
warpack.afterMapInit(() => {
    for (const [unitTypeId, data] of rawDataByUnitTypeId) {
        MISSILE_DATA_BY_UNIT_TYPE_ID.set(unitTypeId, resolveData(data))
    }
})
