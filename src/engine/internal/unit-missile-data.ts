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
    LAUNCH_OFFSET_X,
    LAUNCH_OFFSET_Y,
    LAUNCH_OFFSET_Z,
    LAUNCH_OFFSET_Z_HD,
    LAUNCH_VISUAL_OFFSET_X,
    LAUNCH_VISUAL_OFFSET_X_HD,
    LAUNCH_VISUAL_OFFSET_Y,
    LAUNCH_VISUAL_OFFSET_Y_HD,
}

/** @internal For use by internal systems only. */
export const MISSILE_DATA_BY_UNIT_TYPE_ID = (() => {
    return setmetatable(
        mapValues(
            postcompile(() => {
                return associate(
                    UnitType.getAll(),
                    (unitType) => unitType.id,
                    (unitType) => {
                        unitType.missileImpactOffsetZSD
                        unitType.missileImpactOffsetZHD
                        return {
                            [PropertyKey.IMPACT_OFFSET_Z]:
                                unitType.missileImpactOffsetZSD != DEFAULT_MISSILE_IMPACT_OFFSET_Z
                                    ? unitType.missileImpactOffsetZSD
                                    : undefined,
                            [PropertyKey.IMPACT_OFFSET_Z_HD]:
                                unitType.missileImpactOffsetZHD != unitType.missileImpactOffsetZSD
                                    ? unitType.missileImpactOffsetZHD
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
                            [PropertyKey.LAUNCH_VISUAL_OFFSET_X]:
                                unitType.missileLaunchVisualOffsetXSD !=
                                DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_X
                                    ? unitType.missileLaunchVisualOffsetXSD
                                    : undefined,
                            [PropertyKey.LAUNCH_VISUAL_OFFSET_X_HD]:
                                unitType.missileLaunchVisualOffsetXHD !=
                                unitType.missileLaunchVisualOffsetXSD
                                    ? unitType.missileLaunchVisualOffsetXHD
                                    : undefined,
                            [PropertyKey.LAUNCH_VISUAL_OFFSET_Y]:
                                unitType.missileLaunchVisualOffsetYSD !=
                                DEFAULT_MISSILE_LAUNCH_VISUAL_OFFSET_Y
                                    ? unitType.missileLaunchVisualOffsetYSD
                                    : undefined,
                            [PropertyKey.LAUNCH_VISUAL_OFFSET_Y_HD]:
                                unitType.missileLaunchVisualOffsetYHD !=
                                unitType.missileLaunchVisualOffsetYSD
                                    ? unitType.missileLaunchVisualOffsetYHD
                                    : undefined,
                        }
                    }
                )
            }),
            (data) => {
                return setmetatable(
                    {
                        impactOffsetZ: LocalClient.isHD
                            ? data[PropertyKey.IMPACT_OFFSET_Z_HD] ??
                              data[PropertyKey.IMPACT_OFFSET_Z]
                            : data[PropertyKey.IMPACT_OFFSET_Z],
                        launchOffsetX: data[PropertyKey.LAUNCH_OFFSET_X],
                        launchOffsetY: data[PropertyKey.LAUNCH_OFFSET_Y],
                        launchOffsetZ: LocalClient.isHD
                            ? data[PropertyKey.LAUNCH_OFFSET_Z_HD] ??
                              data[PropertyKey.LAUNCH_OFFSET_Z]
                            : data[PropertyKey.LAUNCH_OFFSET_Z],
                        launchVisualOffsetX: LocalClient.isHD
                            ? data[PropertyKey.LAUNCH_VISUAL_OFFSET_X_HD] ??
                              data[PropertyKey.LAUNCH_VISUAL_OFFSET_X]
                            : data[PropertyKey.LAUNCH_VISUAL_OFFSET_X],
                        launchVisualOffsetY: LocalClient.isHD
                            ? data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y_HD] ??
                              data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y]
                            : data[PropertyKey.LAUNCH_VISUAL_OFFSET_Y],
                    },
                    METATABLE
                )
            }
        ),
        {
            __index() {
                return DEFAULT_VALUES
            },
        }
    )
})()
