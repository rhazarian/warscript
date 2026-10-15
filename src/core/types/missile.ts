import { Unit } from "./unit"
import { Widget } from "./widget"
import { Timer } from "./timer"
import { HandleState } from "./handle"
import {
    DEFAULT_MISSILE_IMPACT_OFFSET_Z,
    MISSILE_DATA_BY_UNIT_TYPE_ID,
} from "../../engine/internal/unit-missile-data"

const rad = math.rad
const cos = math.cos
const sin = math.sin
const sqrt = math.sqrt
const atan = math.atan
const huge = math.huge
const addSpecialEffect = AddSpecialEffect
const setSpecialEffectScale = BlzSetSpecialEffectScale
const setSpecialEffectColorByPlayer = BlzSetSpecialEffectColorByPlayer
const setSpecialEffectPosition = BlzSetSpecialEffectPosition
const setSpecialEffectYaw = BlzSetSpecialEffectYaw
const setSpecialEffectPitch = BlzSetSpecialEffectPitch
const destroyEffect = DestroyEffect
const getLocationZ = GetLocationZ
const moveLocation = MoveLocation
const getOwningPlayer = GetOwningPlayer
const getUnitX = GetUnitX
const getUnitY = GetUnitY
const getUnitZ = BlzGetUnitZ
const getUnitFlyHeight = GetUnitFlyHeight
const getUnitFacing = GetUnitFacing
const getWidgetX = GetWidgetX
const getWidgetY = GetWidgetY

const tablePack = table.pack
const tableUnpack = table.unpack

const safeCall = warpack.safeCall

const location = Location(0, 0)

const terrainZ = (x: number, y: number): number => {
    moveLocation(location, x, y)
    return getLocationZ(location)
}

const UPDATE_PERIOD = 1 / 64

export type MissileConfig = Readonly<{
    /** Model path of the missile. */
    art: string
    scale?: number
    /** Distance covered per second in the XY plane, regardless of the arc. */
    speed: number
    /** Change of the speed per second; negative values slow the missile down. */
    acceleration?: number
    /**
     * Lower bound of the speed reached through (negative) acceleration. Defaults to 0, in which
     * case a decelerating missile may come to a halt and never arrive.
     */
    minSpeed?: number
    /** Upper bound of the speed reached through acceleration. Unbounded by default. */
    maxSpeed?: number
    /**
     * Height of the arc, as a fraction of the distance to the target (as in the object editor).
     * The arc only lasts while the target stays put; once the target moves, the missile heads
     * straight for it from wherever it currently is.
     */
    arc?: number
    /**
     * Offset of the launch position from the source. For a unit source it is applied on top of
     * the launch offsets of the unit type, and the Z offset on top of its launch height.
     */
    sourceOffsetX?: number
    sourceOffsetY?: number
    sourceOffsetZ?: number
    /**
     * Offset of the impact position from the target. For a widget target the Z offset is applied
     * on top of its impact height.
     */
    targetOffsetX?: number
    targetOffsetY?: number
    targetOffsetZ?: number
}>

export type MissileTarget = [targetX: number, targetY: number, ...targetZ: [number] | []] | [Widget]

const enum MissilePropertyKey {
    NEXT,
    PREVIOUS,
    DESTROYED,
}

let head: Missile | undefined

export class Missile implements Destroyable {
    private [MissilePropertyKey.NEXT]?: Missile
    private [MissilePropertyKey.PREVIOUS]?: Missile
    private [MissilePropertyKey.DESTROYED]?: true

    protected constructor(
        private readonly effect: jeffect,
        /**
         * Sends the missile towards a new target, starting a fresh arc (if any) from where the
         * missile currently is. Calling it from the arrival handler keeps the missile alive and
         * makes it continue to the new target, which is how bouncing missiles are made.
         */
        public readonly retarget: (this: void, ...target: MissileTarget) => void,
        private readonly update: (this: Missile) => boolean,
    ) {
        if (head) {
            this[MissilePropertyKey.NEXT] = head
            head[MissilePropertyKey.PREVIOUS] = this
        }
        head = this
    }

    public get isDestroyed(): boolean {
        return this[MissilePropertyKey.DESTROYED] == true
    }

    /**
     * Launches a missile from the source towards the target. A missile launched by a unit takes
     * the launch offsets and the color of the unit's owner, like a native one. A widget target is
     * followed until the missile reaches it; should the widget be removed from the game before
     * that, the missile flies on to where the widget was last seen and arrives with `success` set
     * to false. A unit that merely dies is still reached (`success` is true).
     *
     * Points without a Z coordinate lie on the ground.
     *
     * The missile destroys itself after the arrival handler returns, unless the handler
     * `retarget`s it.
     */
    public static launch<T extends any[]>(
        config: MissileConfig,
        source: Unit,
        target: Widget,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        source: Unit,
        targetX: number,
        targetY: number,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        source: Unit,
        targetX: number,
        targetY: number,
        targetZ: number,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        sourceX: number,
        sourceY: number,
        target: Widget,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        sourceX: number,
        sourceY: number,
        sourceZ: number,
        target: Widget,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch<T extends any[]>(
        config: MissileConfig,
        sourceX: number,
        sourceY: number,
        sourceZ: number,
        targetX: number,
        targetY: number,
        targetZ: number,
        onArrival: (missile: Missile, success: boolean, ...parameters: T) => void,
        ...parameters: T
    ): Missile

    public static launch(config: MissileConfig, ...args: any[]): Missile {
        // `args` is only forwarded as a trailing spread, which tstl compiles to the Lua vararg
        // itself, so `table.pack` sees the arguments as they were passed and its `n` is their
        // true number. Collecting them any other way would lose an `undefined` among them: the
        // length of a table with a hole in it is whatever border Lua happens to find.
        return Missile.launchPacked(config, tablePack(...args))
    }

    private static launchPacked(
        config: MissileConfig,
        args: any[] & { readonly n: number },
    ): Missile {
        // The number of leading coordinates tells the layouts apart: 0 for a unit source, 2 or 3
        // for a point source followed by a widget target, 4 or 6 for a point source followed by
        // a point target.
        let coordinatesCount = 0
        while (type(args[coordinatesCount]) == "number") {
            ++coordinatesCount
        }

        let index: number
        let sourceUnit: Unit | undefined
        let sourceX: number
        let sourceY: number
        let sourceZ: number | undefined
        if (coordinatesCount == 0) {
            sourceUnit = args[0] as Unit
            sourceX = sourceUnit.x
            sourceY = sourceUnit.y
            index = 1
        } else {
            sourceX = args[0]
            sourceY = args[1]
            index = 2
            if (coordinatesCount == 3 || coordinatesCount == 6) {
                sourceZ = args[2]
                index = 3
            }
        }

        let initialTargetXOrWidget: number | Widget
        let initialTargetY: number | undefined
        let initialTargetZ: number | undefined
        if (type(args[index]) == "number") {
            initialTargetXOrWidget = args[index]
            initialTargetY = args[index + 1]
            index += 2
            if (type(args[index]) == "number") {
                initialTargetZ = args[index]
                ++index
            }
        } else {
            initialTargetXOrWidget = args[index]
            ++index
        }

        const onArrival: (missile: Missile, success: boolean, ...parameters: any[]) => void =
            args[index]
        // The parameters stay in the packed arguments, and are handed to the handler as exactly
        // the values they were: unpacking a range rather than the whole table passes on an
        // `undefined` among them instead of stopping at the hole it leaves. Lua indices, as that
        // is what `tableUnpack` takes: the first parameter follows the handler at `index`.
        const firstParameterIndex = index + 2
        const lastParameterIndex = args.n

        // X and Y are both where the flight is computed and where the model is shown; Z starts at
        // the launch height and converges on the impact height over the flight.
        //
        // The engine does not apply projectileVisOffsetX/Y to attack missiles: compared in game
        // (HD Priest, X -20, Y 30), applying them as forward/right offsets put the scripted
        // missile above and to the right of the real one; launchX/Y/Z alone match.
        let positionX = sourceX + (config.sourceOffsetX ?? 0)
        let positionY = sourceY + (config.sourceOffsetY ?? 0)
        let positionZ: number
        if (sourceUnit) {
            const handle = sourceUnit.handle
            const data = MISSILE_DATA_BY_UNIT_TYPE_ID.get(sourceUnit.typeId)
            const angle = rad(getUnitFacing(handle) - 90)
            const s = sin(angle)
            const c = cos(angle)

            positionX += c * data.launchOffsetX - s * data.launchOffsetY
            positionY += s * data.launchOffsetX + c * data.launchOffsetY
            positionZ = getUnitZ(handle) + getUnitFlyHeight(handle) + data.launchOffsetZ
        } else {
            positionZ = sourceZ ?? terrainZ(sourceX, sourceY)
        }
        positionZ += config.sourceOffsetZ ?? 0

        const targetOffsetX = config.targetOffsetX ?? 0
        const targetOffsetY = config.targetOffsetY ?? 0
        const targetOffsetZ = config.targetOffsetZ ?? 0

        const acceleration = (config.acceleration ?? 0) * UPDATE_PERIOD * UPDATE_PERIOD
        const minSpeed = (config.minSpeed ?? 0) * UPDATE_PERIOD
        const maxSpeed = (config.maxSpeed ?? huge) * UPDATE_PERIOD
        // Half a step of acceleration up front makes the per-update speed the average speed over
        // the update (midpoint integration).
        let speed = config.speed * UPDATE_PERIOD + acceleration / 2
        if (speed < minSpeed) {
            speed = minSpeed
        } else if (speed > maxSpeed) {
            speed = maxSpeed
        }

        // Height of the arc as a function of progress p is 4 * arc * legDistance * p * (1 - p),
        // which is integrated update by update below.
        const arcFactor = 4 * (config.arc ?? 0)
        let arcZ = 0
        let arcActive = false
        let legDistance = 0
        let legTargetX = 0
        let legTargetY = 0

        let targetWidget: Widget | undefined
        let targetUnitHandle: junit | undefined
        let targetImpactOffsetZ = 0
        let targetX = 0
        let targetY = 0
        let targetZ = 0
        let success = true

        // Whether a new leg has been set up that the missile has not started flying yet.
        let retargeted = false
        // Whether the flight computation has reached the target, and the missile is to be shown
        // there and its arrival handled on the next update.
        let arrived = false

        const trackTargetWidget = () => {
            const widget = targetWidget!
            if (widget.state != HandleState.CREATED) {
                // Removed from the game: keep heading for where it was last seen.
                targetWidget = undefined
                targetUnitHandle = undefined
                success = false
            } else if (targetUnitHandle) {
                targetX = getUnitX(targetUnitHandle) + targetOffsetX
                targetY = getUnitY(targetUnitHandle) + targetOffsetY
                targetZ =
                    getUnitZ(targetUnitHandle) +
                    getUnitFlyHeight(targetUnitHandle) +
                    targetImpactOffsetZ
            } else {
                const handle = widget.handle
                const x = getWidgetX(handle)
                const y = getWidgetY(handle)
                targetX = x + targetOffsetX
                targetY = y + targetOffsetY
                targetZ = terrainZ(x, y) + targetImpactOffsetZ
            }
        }

        const setTarget = (xOrWidget: number | Widget, y?: number, z?: number) => {
            success = true
            if (type(xOrWidget) == "number") {
                const x = xOrWidget as number
                targetWidget = undefined
                targetUnitHandle = undefined
                targetX = x + targetOffsetX
                targetY = y! + targetOffsetY
                targetZ = (z ?? terrainZ(x, y!)) + targetOffsetZ
            } else {
                const widget = xOrWidget as Widget
                targetWidget = widget
                if (widget instanceof Unit) {
                    targetUnitHandle = widget.handle
                    targetImpactOffsetZ =
                        MISSILE_DATA_BY_UNIT_TYPE_ID.get(widget.typeId).impactOffsetZ +
                        targetOffsetZ
                } else {
                    targetUnitHandle = undefined
                    targetImpactOffsetZ = DEFAULT_MISSILE_IMPACT_OFFSET_Z + targetOffsetZ
                }
                trackTargetWidget()
                if (!targetWidget) {
                    // Already removed: all that is left of it is the last known position.
                    const x = widget.x
                    const y = widget.y
                    targetX = x + targetOffsetX
                    targetY = y + targetOffsetY
                    targetZ = terrainZ(x, y) + targetImpactOffsetZ
                }
            }

            // A new leg starts from wherever the missile is, including the height gained so far.
            positionZ += arcZ
            arcZ = 0
            arcActive = arcFactor != 0
            const dx = targetX - positionX
            const dy = targetY - positionY
            legDistance = sqrt(dx * dx + dy * dy)
            legTargetX = targetX
            legTargetY = targetY
        }

        /** Advances the flight by one update. Returns true once the target has been reached. */
        const step = (): boolean => {
            retargeted = false

            if (targetWidget) {
                trackTargetWidget()
            }

            const dx = targetX - positionX
            const dy = targetY - positionY
            const distance = sqrt(dx * dx + dy * dy)

            if (distance <= speed) {
                positionX = targetX
                positionY = targetY
                positionZ = targetZ
                arcZ = 0
                return true
            }

            if (arcActive && (targetX != legTargetX || targetY != legTargetY)) {
                arcActive = false
                positionZ += arcZ
                arcZ = 0
            }

            const updatesLeft = distance / speed
            positionX += dx / updatesLeft
            positionY += dy / updatesLeft
            positionZ += (targetZ - positionZ) / updatesLeft
            if (arcActive) {
                // Derivative of the arc height, evaluated halfway through this update.
                arcZ += arcFactor * speed * ((2 * distance - speed) / legDistance - 1)
            }

            speed += acceleration
            if (speed < minSpeed) {
                speed = minSpeed
            } else if (speed > maxSpeed) {
                speed = maxSpeed
            }

            return false
        }

        // Where the model is currently shown.
        let shownX = positionX
        let shownY = positionY
        let shownZ = positionZ

        const effect = addSpecialEffect(config.art, shownX, shownY)
        setSpecialEffectPosition(effect, shownX, shownY, shownZ)
        if (config.scale) {
            setSpecialEffectScale(effect, config.scale)
        }
        if (sourceUnit) {
            setSpecialEffectColorByPlayer(effect, getOwningPlayer(sourceUnit.handle))
        }

        /** Points the model, as shown, at the given position. */
        const lookAt = (x: number, y: number, z: number) => {
            const dx = x - shownX
            const dy = y - shownY
            const dz = z - shownZ
            if (dx != 0 || dy != 0) {
                setSpecialEffectYaw(effect, atan(dy, dx))
            }
            setSpecialEffectPitch(effect, -atan(dz, sqrt(dx * dx + dy * dy)))
        }

        /** Moves the model to the given position. */
        const show = (x: number, y: number, z: number) => {
            shownX = x
            shownY = y
            shownZ = z
            setSpecialEffectPosition(effect, x, y, z)
        }

        const update = function (this: Missile): boolean {
            if (arrived) {
                lookAt(positionX, positionY, positionZ)
                show(positionX, positionY, positionZ)

                safeCall(
                    onArrival,
                    this,
                    success,
                    ...tableUnpack(args, firstParameterIndex, lastParameterIndex),
                )

                if (this[MissilePropertyKey.DESTROYED] || !retargeted) {
                    return true
                }
                arrived = step()
                lookAt(positionX, positionY, positionZ + arcZ)
                return false
            }

            // The flight is always one update ahead of what is shown, so that the model can be
            // pointed at where it is actually heading.
            const x = positionX
            const y = positionY
            const z = positionZ + arcZ
            arrived = step()
            show(x, y, z)
            lookAt(positionX, positionY, positionZ + arcZ)
            return false
        }

        setTarget(initialTargetXOrWidget, initialTargetY, initialTargetZ)
        arrived = step()
        lookAt(positionX, positionY, positionZ + arcZ)

        return new Missile(
            effect,
            (xOrWidget: number | Widget, y?: number, z?: number) => {
                setTarget(xOrWidget, y, z)
                retargeted = true
            },
            update,
        )
    }

    /**
     * Destroys the missile, playing the death animation of its model. Nothing is called back.
     */
    public destroy(): void {
        if (this[MissilePropertyKey.DESTROYED]) {
            return
        }
        this[MissilePropertyKey.DESTROYED] = true

        destroyEffect(this.effect)

        const previous = this[MissilePropertyKey.PREVIOUS]
        const next = this[MissilePropertyKey.NEXT]
        if (previous) {
            previous[MissilePropertyKey.NEXT] = next
        } else {
            head = next
        }
        if (next) {
            next[MissilePropertyKey.PREVIOUS] = previous
        }
        this[MissilePropertyKey.PREVIOUS] = undefined
        // NEXT is kept: the update loop may be standing on this missile and needs to carry on.
    }
}

Timer.onPeriod[UPDATE_PERIOD].addListener(() => {
    // Missiles launched during an update are prepended, so they are only updated from the next
    // period on. Missiles destroyed during an update are skipped but still lead to the next one.
    let missile = head
    while (missile) {
        if (!missile[MissilePropertyKey.DESTROYED] && missile["update"]()) {
            missile.destroy()
        }
        missile = missile[MissilePropertyKey.NEXT]
    }
})
