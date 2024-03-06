import { Unit } from "./unit"
import { Timer } from "./timer"
import { MISSILE_DATA_BY_UNIT_TYPE_ID } from "../../engine/internal/unit-missile-data"

const rad = math.rad
const cos = math.cos
const sin = math.sin
const sqrt = math.sqrt
const atan = math.atan
const terrainZ = vec2.terrainZ
const addSpecialEffect = AddSpecialEffect
const setSpecialEffectScale = BlzSetSpecialEffectScale
const setSpecialEffectPosition = BlzSetSpecialEffectPosition
const setSpecialEffectYaw = BlzSetSpecialEffectYaw
const setSpecialEffectPitch = BlzSetSpecialEffectPitch
const destroyEffect = DestroyEffect
const getHandleId = GetHandleId
const getUnitX = GetUnitX
const getUnitY = GetUnitY

const safeCall = warpack.safeCall

let head: Missile | undefined
const next = new LuaMap<Missile, Missile | undefined>()
const previous = new LuaMap<Missile, Missile | undefined>()

export class Missile implements Destroyable {
    protected constructor(
        private readonly effect: jeffect,
        public readonly retarget: (this: void, target: Unit | Vec2 | Vec3) => void,
        private readonly update: (this: Missile) => boolean
    ) {
        if (head) {
            next.set(this, head)
            previous.set(head, this)
        }
        head = this
    }

    public static launch(
        config: Readonly<{
            art: string
            scale?: number
            acceleration?: number
            speed: number
            arc?: number
            minSpeed?: number
            maxSpeed?: number
            sourceOffset?: Vec2 | Vec3
            targetOffset?: Vec3
        }>,
        source: Unit | Vec2 | Vec3,
        target: Unit | Vec2 | Vec3,
        onArrival: (missile: Missile, success: boolean) => void
    ): Missile {
        let offsetX = config.sourceOffset?.x ?? 0
        let offsetY = config.sourceOffset?.y ?? 0
        let visualOffsetX = 0
        let visualOffsetY = 0
        let visualOffsetZ = (source.z ?? terrainZ(source)) + (config.sourceOffset?.z ?? 0)

        if (source instanceof Unit) {
            const data = MISSILE_DATA_BY_UNIT_TYPE_ID.get(source.typeId)
            const launchX = data.launchOffsetX
            const launchY = data.launchOffsetY
            const projectileVisOffsetX = data.launchVisualOffsetX
            const projectileVisOffsetY = data.launchVisualOffsetY
            const angle = rad(source.facing - 90)
            const s = sin(angle)
            const c = cos(angle)

            offsetX += c * launchX - s * launchY
            offsetY += s * launchX + c * launchY

            visualOffsetX += c * projectileVisOffsetX - s * projectileVisOffsetY
            visualOffsetY += s * projectileVisOffsetX + c * projectileVisOffsetY
            visualOffsetZ += data.launchOffsetZ
        }

        const targetOffsetX = config.targetOffset?.x ?? 0
        const targetOffsetY = config.targetOffset?.y ?? 0
        let targetVisualOffsetX = 0
        let targetVisualOffsetY = 0
        let targetVisualOffsetZ = (target.z ?? terrainZ(target)) + (config.targetOffset?.z ?? 0)
        if (target instanceof Unit) {
            targetVisualOffsetZ += MISSILE_DATA_BY_UNIT_TYPE_ID.get(target.typeId).impactOffsetZ
        }

        let retarget = false

        let positionX = source.x + offsetX
        let positionY = source.y + offsetY
        let visualPositionX = positionX + visualOffsetX
        let visualPositionY = positionY + visualOffsetY
        let visualPositionZ = visualOffsetZ
        let visualPositionArcX = visualPositionX
        let visualPositionArcY = visualPositionY
        let visualPositionArcZ = visualPositionZ

        let currentTargetX = target.x + targetOffsetX
        let currentTargetY = target.y + targetOffsetY
        let currentVisualTargetX = currentTargetX + targetVisualOffsetX
        let currentVisualTargetY = currentTargetY + targetVisualOffsetY
        let currentVisualTargetZ = targetVisualOffsetZ

        let dx = currentTargetX - positionX
        let dy = currentTargetY - positionY
        const fullDist = sqrt(dx * dx + dy * dy)

        const effect = addSpecialEffect(config.art, visualPositionX, visualPositionY)
        setSpecialEffectPosition(effect, visualPositionX, visualPositionY, visualPositionZ)
        if (config.scale) {
            setSpecialEffectScale(effect, config.scale)
        }

        const acceleration = (config.acceleration ?? 0) / 128
        let speed = config.speed / 128 + acceleration / 2

        let arcVAcceleration = 0
        let arcVSpeed = 0
        if (config.arc) {
            arcVAcceleration = acceleration * config.arc
            arcVSpeed = 4 * speed * config.arc
        }

        let arcZ = 0

        const unit = target instanceof Unit ? target.handle : undefined

        // TODO: separate updater for unit targets, not that frequent + don't update on remove
        // TODO: maybe precompute next position for real pitch/yaw
        const initialTargetX = target.x + targetOffsetX
        const initialTargetY = target.y + targetOffsetY
        const update = function (this: Missile) {
            if (unit && getHandleId(unit) != 0) {
                currentTargetX = getUnitX(unit) + targetOffsetX
                currentTargetY = getUnitY(unit) + targetOffsetY

                currentVisualTargetX = currentTargetX + targetVisualOffsetX
                currentVisualTargetY = currentTargetY + targetVisualOffsetY
                currentVisualTargetZ = targetVisualOffsetZ
            }

            dx = currentTargetX - positionX
            dy = currentTargetY - positionY
            const dist = sqrt(dx * dx + dy * dy)

            if (dist <= speed) {
                const dx = currentVisualTargetX - visualPositionArcX
                const dy = currentVisualTargetY - visualPositionArcY
                const dz = currentVisualTargetZ - visualPositionArcZ
                const yaw = atan(dy, dx)
                const pitch = atan(dz, sqrt(dx * dx + dy * dy))
                setSpecialEffectYaw(effect, yaw)
                setSpecialEffectPitch(effect, -pitch)
                setSpecialEffectPosition(
                    effect,
                    currentVisualTargetX,
                    currentVisualTargetY,
                    currentVisualTargetZ
                )
                visualPositionX = currentVisualTargetX
                visualPositionY = currentVisualTargetY
                visualPositionZ = currentVisualTargetZ
                visualPositionArcX = currentVisualTargetX
                visualPositionArcY = currentVisualTargetY
                visualPositionArcZ = currentVisualTargetZ
                retarget = false
                safeCall(onArrival, this, true)
                return !retarget
            }

            if (
                arcVSpeed != 0 &&
                (currentTargetX != initialTargetX || currentTargetY != initialTargetY)
            ) {
                arcVSpeed = 0
                arcVAcceleration = 0
                visualPositionZ += arcZ
                arcZ = 0
            }

            const newPositionX = positionX + (dx / dist) * speed
            const newPositionY = positionY + (dy / dist) * speed

            const timeLeft = dist / speed
            const visualDx = currentVisualTargetX - visualPositionX
            const visualDy = currentVisualTargetY - visualPositionY
            const visualDz = currentVisualTargetZ - visualPositionZ

            const newVisualPositionX = visualPositionX + visualDx / timeLeft
            const newVisualPositionY = visualPositionY + visualDy / timeLeft
            const newVisualPositionZ = visualPositionZ + visualDz / timeLeft

            arcZ += arcVSpeed * (2 * (dist / fullDist) - 1)
            const newVisualPositionArcX = newVisualPositionX
            const newVisualPositionArcY = newVisualPositionY
            const newVisualPositionArcZ = newVisualPositionZ + arcZ

            const visualArcDx = newVisualPositionArcX - visualPositionArcX
            const visualArcDy = newVisualPositionArcY - visualPositionArcY
            const visualArcDz = newVisualPositionArcZ - visualPositionArcZ
            const yaw = atan(visualArcDy, visualArcDx)
            const pitch = atan(
                visualArcDz,
                sqrt(visualArcDx * visualArcDx + visualArcDy * visualArcDy)
            )
            setSpecialEffectYaw(effect, yaw)
            setSpecialEffectPitch(effect, -pitch)
            setSpecialEffectPosition(
                effect,
                newVisualPositionArcX,
                newVisualPositionArcY,
                newVisualPositionArcZ
            )

            positionX = newPositionX
            positionY = newPositionY
            visualPositionX = newVisualPositionX
            visualPositionY = newVisualPositionY
            visualPositionZ = newVisualPositionZ
            visualPositionArcX = newVisualPositionArcX
            visualPositionArcY = newVisualPositionArcY
            visualPositionArcZ = newVisualPositionArcZ
            speed += acceleration
            arcVSpeed += arcVAcceleration

            return false
        }

        return new Missile(
            effect,
            (newTarget) => {
                target = newTarget
                targetVisualOffsetX = 0
                targetVisualOffsetY = 0
                targetVisualOffsetZ = (target.z ?? terrainZ(target)) + (config.targetOffset?.z ?? 0)
                if (target instanceof Unit) {
                    targetVisualOffsetZ += MISSILE_DATA_BY_UNIT_TYPE_ID.get(
                        target.typeId
                    ).impactOffsetZ
                }

                retarget = true
            },
            update
        )
    }

    public destroy(): void {
        destroyEffect(this.effect)
        const previousMissile = previous.get(this)
        const nextMissile = next.get(this)
        if (previousMissile) {
            next.set(previousMissile, nextMissile)
        } else {
            head = nextMissile
        }
        if (nextMissile) {
            previous.set(nextMissile, previousMissile)
        }
        previous.delete(this)
        next.delete(this)
    }
}

Timer.onPeriod[1 / 64].addListener(() => {
    let missile = head
    while (missile) {
        const nextMissile = next.get(missile)
        if (missile["update"]()) {
            missile.destroy()
        }
        missile = nextMissile
    }
})

export namespace Missile {
    /*export namespace MotionDriver {
        export const Guidance = 5
    }

    export type ArrivalTest = (position: Vec3, target: Vec3) => boolean
    export namespace ArrivalTest {
        export const Adaptive: ArrivalTest = (position, target) => {
            return true
        }
        export const TwoD: ArrivalTest = (position, target) => {
            return vec2.distance(position, target) < 0.00001
        }
        export const Never: ArrivalTest = () => false
    }*/
}
