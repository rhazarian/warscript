import { LightningTypeId } from "./object-data/entry/lightning-type"

import { Handle, HandleDestructor } from "../core/types/handle"
import { Timer } from "../core/types/timer"
import { Unit } from "../core/types/unit"

import { Forward, forwardByN } from "../utility/functions"
import { MISSILE_DATA_BY_UNIT_TYPE_ID } from "./internal/unit-missile-data"
import { UnitTypeId } from "./object-data/entry/unit-type"

const type = _G.type
const select = _G.select
const cos = math.cos
const rad = math.rad
const sin = math.sin

const addLightning = AddLightning
const addLightningEx = AddLightningEx
const moveLightningEx = MoveLightningEx
const destroyLightning = DestroyLightning
const getUnitFacing = GetUnitFacing
const getUnitTypeId = GetUnitTypeId
const getUnitX = GetUnitX
const getUnitY = GetUnitY
const getUnitZ = BlzGetUnitZ
const getUnitFlyHeight = GetUnitFlyHeight
const getLocationZ = GetLocationZ
const moveLocation = MoveLocation
const getLightningColorA = GetLightningColorA
const getLightningColorR = GetLightningColorR
const getLightningColorG = GetLightningColorG
const getLightningColorB = GetLightningColorB
const setLightningColor = SetLightningColor

const location = Location(0, 0)

const unitToUnitLightnings = setmetatable(new LuaSet<Lightning>(), { __mode: "k" })
const unitToPointLightnings = setmetatable(new LuaSet<Lightning>(), { __mode: "k" })
const pointToUnitLightnings = setmetatable(new LuaSet<Lightning>(), { __mode: "k" })

const temporaryLightnings: Lightning[] = []
let temporaryLightningsCount = 0

const enum LightningPropertyKey {
    CHECK_VISIBILITY = 100,
    SOURCE_UNIT,
    TARGET_UNIT,
    SOURCE_X,
    SOURCE_Y,
    SOURCE_Z,
    TARGET_X,
    TARGET_Y,
    TARGET_Z,
    DURATION,
    FADING,
}

export type LightningConstructor<T extends Lightning> = typeof Lightning &
    (new (handle: jlightning, typeId: LightningTypeId) => T)

export class Lightning extends Handle<jlightning> {
    private [LightningPropertyKey.CHECK_VISIBILITY]?: boolean
    private [LightningPropertyKey.SOURCE_UNIT]?: junit
    private [LightningPropertyKey.TARGET_UNIT]?: junit
    private [LightningPropertyKey.SOURCE_X]?: number
    private [LightningPropertyKey.SOURCE_Y]?: number
    private [LightningPropertyKey.SOURCE_Z]?: number
    private [LightningPropertyKey.TARGET_X]?: number
    private [LightningPropertyKey.TARGET_Y]?: number
    private [LightningPropertyKey.TARGET_Z]?: number
    private [LightningPropertyKey.DURATION]?: number
    private [LightningPropertyKey.FADING]?: true

    public constructor(
        handle: jlightning,
        public readonly typeId: LightningTypeId,
    ) {
        super(handle)
    }

    protected override onDestroy(): HandleDestructor {
        unitToUnitLightnings.delete(this)
        unitToPointLightnings.delete(this)
        pointToUnitLightnings.delete(this)
        destroyLightning(this.handle)
        return super.onDestroy()
    }

    public static create<T extends Lightning>(
        this: LightningConstructor<T>,
        typeId: LightningTypeId,
        ...parameters: [
            ...checkVisibility: [boolean] | [],
            ...sourceAndTarget:
                | [sourceX: number, sourceY: number, targetX: number, targetY: number]
                | [
                      sourceX: number,
                      sourceY: number,
                      sourceZ: number,
                      targetX: number,
                      targetY: number,
                      targetZ: number,
                  ]
                | [
                      source: Unit,
                      ...target:
                          | [targetX: number, targetY: number, ...targetZ: [number] | []]
                          | [Unit],
                  ]
                | [
                      ...source:
                          | [sourceX: number, sourceY: number, ...sourceZ: [number] | []]
                          | [Unit],
                      target: Unit,
                  ],
        ]
    ): T

    public static create<T extends Lightning>(
        this: LightningConstructor<T>,
        typeId: LightningTypeId,
        checkVisibility: boolean | number | Unit,
        sourceXOrSourceUnit: number | Unit,
        sourceYOrTargetXOrTargetUnit?: number | Unit,
        sourceZOrTargetXOrTargetUnitOrTargetY?: number | Unit,
        targetXOrTargetUnitOrTargetYOrTargetZ?: number | Unit,
        targetY?: number,
        targetZ?: number,
    ): T {
        if (typeof checkVisibility != "boolean") {
            return this.create(
                typeId,
                true,
                checkVisibility as any,
                sourceXOrSourceUnit as any,
                sourceYOrTargetXOrTargetUnit as any,
                sourceZOrTargetXOrTargetUnitOrTargetY as any,
                targetXOrTargetUnitOrTargetYOrTargetZ as any,
                targetY as any,
            )
        }

        if (targetZ != undefined) {
            return this.of(
                addLightningEx(
                    util.id2s(typeId),
                    checkVisibility,
                    sourceXOrSourceUnit as number,
                    sourceYOrTargetXOrTargetUnit as number,
                    sourceZOrTargetXOrTargetUnitOrTargetY as number,
                    targetXOrTargetUnitOrTargetYOrTargetZ as number,
                    targetY as number,
                    targetZ as number,
                ),
                typeId,
            )
        }
        if (targetXOrTargetUnitOrTargetYOrTargetZ != undefined) {
            if (type(targetXOrTargetUnitOrTargetYOrTargetZ) == "number") {
                if (type(sourceXOrSourceUnit) == "number") {
                    return this.of(
                        addLightning(
                            util.id2s(typeId),
                            checkVisibility,
                            sourceXOrSourceUnit as number,
                            sourceYOrTargetXOrTargetUnit as number,
                            sourceZOrTargetXOrTargetUnitOrTargetY as number,
                            targetXOrTargetUnitOrTargetYOrTargetZ as number,
                        ),
                        typeId,
                    )
                }
                const unit = (sourceXOrSourceUnit as Unit).handle
                const lightning = this.of(
                    addLightningEx(
                        util.id2s(typeId),
                        checkVisibility,
                        getUnitX(unit),
                        getUnitY(unit),
                        getUnitZ(unit),
                        sourceYOrTargetXOrTargetUnit as number,
                        sourceZOrTargetXOrTargetUnitOrTargetY as number,
                        targetXOrTargetUnitOrTargetYOrTargetZ as number,
                    ),
                    typeId,
                )
                lightning[LightningPropertyKey.CHECK_VISIBILITY] = checkVisibility
                lightning[LightningPropertyKey.SOURCE_UNIT] = unit
                lightning[LightningPropertyKey.SOURCE_X] = 0
                lightning[LightningPropertyKey.SOURCE_Y] = 0
                lightning[LightningPropertyKey.SOURCE_Z] = 0
                lightning[LightningPropertyKey.TARGET_X] = sourceYOrTargetXOrTargetUnit as number
                lightning[LightningPropertyKey.TARGET_Y] =
                    sourceZOrTargetXOrTargetUnitOrTargetY as number
                lightning[LightningPropertyKey.TARGET_Z] =
                    targetXOrTargetUnitOrTargetYOrTargetZ as number
                unitToPointLightnings.add(lightning)
                return lightning
            }
            const unit = (targetXOrTargetUnitOrTargetYOrTargetZ as Unit).handle
            const lightning = this.of(
                addLightningEx(
                    util.id2s(typeId),
                    checkVisibility,
                    sourceXOrSourceUnit as number,
                    sourceYOrTargetXOrTargetUnit as number,
                    sourceZOrTargetXOrTargetUnitOrTargetY as number,
                    getUnitX(unit),
                    getUnitY(unit),
                    getUnitZ(unit),
                ),
                typeId,
            )
            lightning[LightningPropertyKey.CHECK_VISIBILITY] = checkVisibility
            lightning[LightningPropertyKey.SOURCE_X] = sourceXOrSourceUnit as number
            lightning[LightningPropertyKey.SOURCE_Y] = sourceYOrTargetXOrTargetUnit as number
            lightning[LightningPropertyKey.SOURCE_Z] =
                sourceZOrTargetXOrTargetUnitOrTargetY as number
            lightning[LightningPropertyKey.TARGET_UNIT] = unit
            lightning[LightningPropertyKey.TARGET_X] = 0
            lightning[LightningPropertyKey.TARGET_Y] = 0
            lightning[LightningPropertyKey.TARGET_Z] = 0
            pointToUnitLightnings.add(lightning)
            return lightning
        }
        if (sourceZOrTargetXOrTargetUnitOrTargetY) {
            if (type(sourceZOrTargetXOrTargetUnitOrTargetY) == "number") {
                const unit = (sourceXOrSourceUnit as Unit).handle
                moveLocation(
                    location,
                    sourceYOrTargetXOrTargetUnit as number,
                    sourceZOrTargetXOrTargetUnitOrTargetY as number,
                )
                const z = getLocationZ(location)
                const lightning = this.of(
                    addLightningEx(
                        util.id2s(typeId),
                        checkVisibility,
                        getUnitX(unit),
                        getUnitY(unit),
                        getUnitZ(unit),
                        sourceYOrTargetXOrTargetUnit as number,
                        sourceZOrTargetXOrTargetUnitOrTargetY as number,
                        z,
                    ),
                    typeId,
                )
                lightning[LightningPropertyKey.CHECK_VISIBILITY] = checkVisibility
                lightning[LightningPropertyKey.SOURCE_UNIT] = unit
                lightning[LightningPropertyKey.SOURCE_X] = 0
                lightning[LightningPropertyKey.SOURCE_Y] = 0
                lightning[LightningPropertyKey.SOURCE_Z] = 0
                lightning[LightningPropertyKey.TARGET_X] = sourceYOrTargetXOrTargetUnit as number
                lightning[LightningPropertyKey.TARGET_Y] =
                    sourceZOrTargetXOrTargetUnitOrTargetY as number
                lightning[LightningPropertyKey.TARGET_Z] = z
                unitToPointLightnings.add(lightning)
                return lightning
            }
            const unit = (sourceZOrTargetXOrTargetUnitOrTargetY as Unit).handle
            moveLocation(
                location,
                sourceXOrSourceUnit as number,
                sourceYOrTargetXOrTargetUnit as number,
            )
            const z = getLocationZ(location)
            const lightning = this.of(
                addLightningEx(
                    util.id2s(typeId),
                    checkVisibility,
                    sourceXOrSourceUnit as number,
                    sourceYOrTargetXOrTargetUnit as number,
                    z,
                    getUnitX(unit),
                    getUnitY(unit),
                    getUnitZ(unit),
                ),
                typeId,
            )
            lightning[LightningPropertyKey.CHECK_VISIBILITY] = checkVisibility
            lightning[LightningPropertyKey.SOURCE_X] = sourceXOrSourceUnit as number
            lightning[LightningPropertyKey.SOURCE_Y] = sourceYOrTargetXOrTargetUnit as number
            lightning[LightningPropertyKey.SOURCE_Z] = z
            lightning[LightningPropertyKey.TARGET_UNIT] = unit
            lightning[LightningPropertyKey.TARGET_X] = 0
            lightning[LightningPropertyKey.TARGET_Y] = 0
            lightning[LightningPropertyKey.TARGET_Z] = 0
            pointToUnitLightnings.add(lightning)
            return lightning
        }
        const sourceUnit = (sourceXOrSourceUnit as Unit).handle
        const targetUnit = (sourceYOrTargetXOrTargetUnit as Unit).handle
        const lightning = this.of(
            addLightningEx(
                util.id2s(typeId),
                checkVisibility,
                getUnitX(sourceUnit),
                getUnitY(sourceUnit),
                getUnitZ(sourceUnit) + getUnitFlyHeight(sourceUnit),
                getUnitX(targetUnit),
                getUnitY(targetUnit),
                getUnitZ(targetUnit) + getUnitFlyHeight(targetUnit),
            ),
            typeId,
        )
        lightning[LightningPropertyKey.CHECK_VISIBILITY] = checkVisibility
        lightning[LightningPropertyKey.SOURCE_UNIT] = sourceUnit
        lightning[LightningPropertyKey.SOURCE_X] = 0
        lightning[LightningPropertyKey.SOURCE_Y] = 0
        lightning[LightningPropertyKey.SOURCE_Z] = 0
        lightning[LightningPropertyKey.TARGET_UNIT] = targetUnit
        lightning[LightningPropertyKey.TARGET_X] = 0
        lightning[LightningPropertyKey.TARGET_Y] = 0
        lightning[LightningPropertyKey.TARGET_Z] = 0
        unitToUnitLightnings.add(lightning)
        return lightning
    }

    public static flash(
        ...parameters: [
            ...parameters: Parameters<(typeof Lightning)["create"]>,
            duration: number,
            fading?: boolean,
        ]
    ): void {
        const [parameterOrDuration, durationOrFading] = select<any>(-2, ...parameters)
        const hasFading = type(durationOrFading) != "number"
        const parametersToForwardCount = (select("#", ...parameters) - (hasFading ? 2 : 1)) as
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
        const lightning = (forwardByN[parametersToForwardCount] as Forward<3 | 4 | 5 | 6 | 7 | 8>)(
            Lightning.create,
            this,
            ...parameters,
        )
        let duration: number
        if (hasFading) {
            duration = parameterOrDuration
            if (durationOrFading) {
                lightning[LightningPropertyKey.FADING] = true
            }
        } else {
            duration = durationOrFading
        }
        lightning[LightningPropertyKey.DURATION] = duration
        ++temporaryLightningsCount
        temporaryLightnings[temporaryLightningsCount - 1] = lightning
    }
}

const UPDATE_PERIOD = 1 / 64

Timer.onPeriod[UPDATE_PERIOD].addListener(() => {
    for (const lightning of unitToUnitLightnings) {
        const [sourceUnit, targetUnit] = [
            lightning[LightningPropertyKey.SOURCE_UNIT]!,
            lightning[LightningPropertyKey.TARGET_UNIT]!,
        ]
        const sourceUnitMissileData = MISSILE_DATA_BY_UNIT_TYPE_ID.get(
            getUnitTypeId(sourceUnit) as UnitTypeId,
        )
        const sourceUnitFacing = rad(getUnitFacing(sourceUnit) - 90)
        const sourceUnitFacingCos = cos(sourceUnitFacing)
        const sourceUnitFacingSin = sin(sourceUnitFacing)
        const sourceUnitOffsetX =
            sourceUnitMissileData.launchOffsetX +
            sourceUnitMissileData.launchVisualOffsetX +
            lightning[LightningPropertyKey.SOURCE_X]!
        const sourceUnitOffsetY =
            sourceUnitMissileData.launchOffsetY +
            sourceUnitMissileData.launchVisualOffsetY +
            lightning[LightningPropertyKey.SOURCE_Y]!
        moveLightningEx(
            lightning.handle,
            lightning[LightningPropertyKey.CHECK_VISIBILITY]!,
            getUnitX(sourceUnit) +
                sourceUnitFacingCos * sourceUnitOffsetX -
                sourceUnitFacingSin * sourceUnitOffsetY,
            getUnitY(sourceUnit) +
                sourceUnitFacingSin * sourceUnitOffsetX +
                sourceUnitFacingCos * sourceUnitOffsetY,
            getUnitZ(sourceUnit) +
                getUnitFlyHeight(sourceUnit) +
                sourceUnitMissileData.launchOffsetZ +
                lightning[LightningPropertyKey.SOURCE_Z]!,
            getUnitX(targetUnit) + lightning[LightningPropertyKey.TARGET_X]!,
            getUnitY(targetUnit) + lightning[LightningPropertyKey.TARGET_Y]!,
            getUnitZ(targetUnit) +
                getUnitFlyHeight(targetUnit) +
                MISSILE_DATA_BY_UNIT_TYPE_ID.get(getUnitTypeId(targetUnit) as UnitTypeId)
                    .impactOffsetZ +
                lightning[LightningPropertyKey.TARGET_Z]!,
        )
    }

    for (const lightning of unitToPointLightnings) {
        const sourceUnit = lightning[LightningPropertyKey.SOURCE_UNIT]!
        const sourceUnitMissileData = MISSILE_DATA_BY_UNIT_TYPE_ID.get(
            getUnitTypeId(sourceUnit) as UnitTypeId,
        )
        const sourceUnitFacing = rad(getUnitFacing(sourceUnit) - 90)
        const sourceUnitFacingCos = cos(sourceUnitFacing)
        const sourceUnitFacingSin = sin(sourceUnitFacing)
        const sourceUnitOffsetX =
            sourceUnitMissileData.launchOffsetX +
            sourceUnitMissileData.launchVisualOffsetX +
            lightning[LightningPropertyKey.SOURCE_X]!
        const sourceUnitOffsetY =
            sourceUnitMissileData.launchOffsetY +
            sourceUnitMissileData.launchVisualOffsetY +
            lightning[LightningPropertyKey.SOURCE_Y]!
        moveLightningEx(
            lightning.handle,
            lightning[LightningPropertyKey.CHECK_VISIBILITY]!,
            getUnitX(sourceUnit) +
                sourceUnitFacingCos * sourceUnitOffsetX -
                sourceUnitFacingSin * sourceUnitOffsetY,
            getUnitY(sourceUnit) +
                sourceUnitFacingSin * sourceUnitOffsetX +
                sourceUnitFacingCos * sourceUnitOffsetY,
            getUnitZ(sourceUnit) +
                getUnitFlyHeight(sourceUnit) +
                lightning[LightningPropertyKey.SOURCE_Z]!,
            lightning[LightningPropertyKey.TARGET_X]!,
            lightning[LightningPropertyKey.TARGET_Y]!,
            lightning[LightningPropertyKey.TARGET_Z]!,
        )
    }

    for (const lightning of pointToUnitLightnings) {
        const targetUnit = lightning[LightningPropertyKey.TARGET_UNIT]!
        moveLightningEx(
            lightning.handle,
            lightning[LightningPropertyKey.CHECK_VISIBILITY]!,
            lightning[LightningPropertyKey.SOURCE_X]!,
            lightning[LightningPropertyKey.SOURCE_Y]!,
            lightning[LightningPropertyKey.SOURCE_Z]!,
            getUnitX(targetUnit) + lightning[LightningPropertyKey.TARGET_X]!,
            getUnitY(targetUnit) + lightning[LightningPropertyKey.TARGET_Y]!,
            getUnitZ(targetUnit) +
                getUnitFlyHeight(targetUnit) +
                MISSILE_DATA_BY_UNIT_TYPE_ID.get(getUnitTypeId(targetUnit) as UnitTypeId)
                    .impactOffsetZ +
                lightning[LightningPropertyKey.TARGET_Z]!,
        )
    }

    let i = 1
    while (i <= temporaryLightningsCount) {
        const lightning = temporaryLightnings[i - 1]
        const duration = lightning[LightningPropertyKey.DURATION]!
        if (duration <= 0) {
            lightning.destroy()
            temporaryLightnings[i - 1] = temporaryLightnings[temporaryLightningsCount - 1]
            temporaryLightnings[temporaryLightningsCount - 1] = undefined!
            --temporaryLightningsCount
        } else {
            if (lightning[LightningPropertyKey.FADING]) {
                const handle = lightning.handle
                setLightningColor(
                    handle,
                    getLightningColorR(handle),
                    getLightningColorG(handle),
                    getLightningColorB(handle),
                    getLightningColorA(handle) * (1 - UPDATE_PERIOD / duration),
                )
            }
            lightning[LightningPropertyKey.DURATION] = duration - UPDATE_PERIOD
            ++i
        }
    }
})
