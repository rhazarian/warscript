import { AnimationName } from "../../engine/object-data/auxiliary/animation-name"
import { AnimationQualifier } from "../../engine/object-data/auxiliary/animation-qualifier"

import { Handle, HandleDestructor } from "./handle"
import { Widget } from "./widget"
import { PlayerColor } from "./playerColor"
import { Player } from "./player"
import { Timer } from "./timer"
import { Unit } from "../../engine/unit"

const pairs = _G.pairs
const select = _G.select

const mathRad = math.rad

const addSpecialEffect = AddSpecialEffect
const addSpecialEffectTarget = AddSpecialEffectTarget
const destroyEffect = DestroyEffect
const getSpecialEffectScale = BlzGetSpecialEffectScale
const playSpecialEffect = BlzPlaySpecialEffect
const setSpecialEffectScale = BlzSetSpecialEffectScale
const setSpecialEffectPitch = BlzSetSpecialEffectPitch
const setSpecialEffectRoll = BlzSetSpecialEffectRoll
const setSpecialEffectColorByPlayer = BlzSetSpecialEffectColorByPlayer
const specialEffectAddSubAnimation = BlzSpecialEffectAddSubAnimation
const specialEffectClearSubAnimations = BlzSpecialEffectClearSubAnimations
const specialEffectRemoveSubAnimation = BlzSpecialEffectRemoveSubAnimation
const setSpecialEffectZ = BlzSetSpecialEffectZ
const getLocationZ = GetLocationZ
const getUnitZ = BlzGetUnitZ
const moveLocation = MoveLocation
const location = Location(0, 0)

const setSpecialEffectPitchDegrees = (effect: jeffect, pitch: number): void => {
    setSpecialEffectPitch(effect, -mathRad(pitch))
}

const setSpecialEffectRollDegrees = (effect: jeffect, pitch: number): void => {
    setSpecialEffectRoll(effect, -mathRad(pitch))
}

const animTypeByAnimationName = {
    [AnimationName.ATTACK]: ANIM_TYPE_ATTACK,
    [AnimationName.BIRTH]: ANIM_TYPE_BIRTH,
    [AnimationName.DEATH]: ANIM_TYPE_DEATH,
    [AnimationName.DECAY]: ANIM_TYPE_DECAY,
    [AnimationName.DISSIPATE]: ANIM_TYPE_DISSIPATE,
    [AnimationName.MORPH]: ANIM_TYPE_MORPH,
    [AnimationName.PORTRAIT]: ANIM_TYPE_PORTRAIT,
    [AnimationName.SLEEP]: ANIM_TYPE_SLEEP,
    [AnimationName.SPELL]: ANIM_TYPE_SPELL,
    [AnimationName.STAND]: ANIM_TYPE_STAND,
    [AnimationName.WALK]: ANIM_TYPE_WALK,
}

const subAnimTypeByAnimationQualifier = {
    [AnimationQualifier.ALTERNATE]: SUBANIM_TYPE_ROOTED,
    [AnimationQualifier.ALTERNATE_EX]: SUBANIM_TYPE_ALTERNATE_EX,
    [AnimationQualifier.CHAIN]: SUBANIM_TYPE_CHAINLIGHTNING,
    [AnimationQualifier.CHANNEL]: SUBANIM_TYPE_CHANNEL,
    [AnimationQualifier.COMPLETE]: SUBANIM_TYPE_COMPLETE,
    [AnimationQualifier.CRITICAL]: SUBANIM_TYPE_CRITICAL,
    [AnimationQualifier.DEFEND]: SUBANIM_TYPE_DEFEND,
    [AnimationQualifier.DRAIN]: SUBANIM_TYPE_DRAIN,
    [AnimationQualifier.EAT_TREE]: SUBANIM_TYPE_EATTREE,
    [AnimationQualifier.FAST]: SUBANIM_TYPE_FAST,
    [AnimationQualifier.FILL]: SUBANIM_TYPE_FILL,
    [AnimationQualifier.FLAIL]: SUBANIM_TYPE_FLAIL,
    [AnimationQualifier.FLESH]: SUBANIM_TYPE_FLESH,
    [AnimationQualifier.FIFTH]: SUBANIM_TYPE_FIFTH,
    [AnimationQualifier.FIRE]: SUBANIM_TYPE_FIRE,
    [AnimationQualifier.FIRST]: SUBANIM_TYPE_FIRST,
    [AnimationQualifier.FIVE]: SUBANIM_TYPE_FIVE,
    [AnimationQualifier.FOUR]: SUBANIM_TYPE_FOUR,
    [AnimationQualifier.FOURTH]: SUBANIM_TYPE_FOURTH,
    [AnimationQualifier.GOLD]: SUBANIM_TYPE_GOLD,
    [AnimationQualifier.HIT]: SUBANIM_TYPE_HIT,
    [AnimationQualifier.LARGE]: SUBANIM_TYPE_LARGE,
    [AnimationQualifier.LEFT]: SUBANIM_TYPE_LEFT,
    [AnimationQualifier.LIGHT]: SUBANIM_TYPE_LIGHT,
    [AnimationQualifier.LOOPING]: SUBANIM_TYPE_LOOPING,
    [AnimationQualifier.LUMBER]: SUBANIM_TYPE_LUMBER,
    [AnimationQualifier.MEDIUM]: SUBANIM_TYPE_MEDIUM,
    [AnimationQualifier.MODERATE]: SUBANIM_TYPE_MODERATE,
    [AnimationQualifier.OFF]: SUBANIM_TYPE_OFF,
    [AnimationQualifier.ONE]: SUBANIM_TYPE_ONE,
    [AnimationQualifier.PUKE]: SUBANIM_TYPE_PUKE,
    [AnimationQualifier.READY]: SUBANIM_TYPE_READY,
    [AnimationQualifier.RIGHT]: SUBANIM_TYPE_RIGHT,
    [AnimationQualifier.SECOND]: SUBANIM_TYPE_SECOND,
    [AnimationQualifier.SEVERE]: SUBANIM_TYPE_SEVERE,
    [AnimationQualifier.SLAM]: SUBANIM_TYPE_SLAM,
    [AnimationQualifier.SMALL]: SUBANIM_TYPE_SMALL,
    [AnimationQualifier.SPIKED]: SUBANIM_TYPE_SPIKED,
    [AnimationQualifier.SPIN]: SUBANIM_TYPE_SPIN,
    [AnimationQualifier.SWIM]: SUBANIM_TYPE_SWIM,
    [AnimationQualifier.TALK]: SUBANIM_TYPE_TALK,
    [AnimationQualifier.THIRD]: SUBANIM_TYPE_THIRD,
    [AnimationQualifier.THREE]: SUBANIM_TYPE_THREE,
    [AnimationQualifier.THROW]: SUBANIM_TYPE_THROW,
    [AnimationQualifier.TWO]: SUBANIM_TYPE_TWO,
    [AnimationQualifier.TURN]: SUBANIM_TYPE_TURN,
    [AnimationQualifier.VICTORY]: SUBANIM_TYPE_VICTORY,
    [AnimationQualifier.WORK]: SUBANIM_TYPE_WORK,
    [AnimationQualifier.WOUNDED]: SUBANIM_TYPE_WOUNDED,
    [AnimationQualifier.UPGRADE]: SUBANIM_TYPE_UPGRADE,
}

const setSpecialEffectColor = (effect: jeffect, color: PlayerColor): void => {
    const dummyColor = dummyPlayer.color
    dummyPlayer.color = color
    setSpecialEffectColorByPlayer(effect, dummyPlayer.handle)
    dummyPlayer.color = dummyColor
}

const setters = {
    scale: setSpecialEffectScale,
    color: setSpecialEffectColor,
    pitch: setSpecialEffectPitchDegrees,
    roll: setSpecialEffectRollDegrees,
}

const dummyPlayer = Player.neutralExtra

const temporaryEffects: jeffect[] = []
const temporaryEffectsDurations: number[] = []
let temporaryEffectsCount = 0

const period = 1 / 32
Timer.onPeriod[period].addListener(() => {
    let i = 1
    while (i <= temporaryEffectsCount) {
        const duration = temporaryEffectsDurations[i - 1]
        if (duration <= 0) {
            destroyEffect(temporaryEffects[i - 1])
            temporaryEffects[i - 1] = temporaryEffects[temporaryEffectsCount - 1]
            --temporaryEffectsCount
        } else {
            temporaryEffectsDurations[i - 1] = duration - period
            ++i
        }
    }
})

const enum EffectPropertyKey {
    COLOR = 100,
    PITCH,
    ROLL,
}

export type EffectParameters = {
    readonly scale?: number
    readonly color?: PlayerColor
    readonly pitch?: number
    readonly roll?: number
    readonly detached?: boolean
    readonly zOffset?: number
    readonly scaleZOffset?: boolean
}

export class Effect extends Handle<jeffect> {
    private [EffectPropertyKey.COLOR]?: PlayerColor
    private [EffectPropertyKey.PITCH]?: number
    private [EffectPropertyKey.ROLL]?: number

    protected override onDestroy(): HandleDestructor {
        destroyEffect(this.handle)
        return super.onDestroy()
    }

    /*public playAnimation(name: AnimationName, ...qualifiers: AnimationQualifier[]): void {
        const handle = this.handle
        specialEffectClearSubAnimations(handle)
        for (const i of $range(1, select("#", ...qualifiers))) {
            //const [qualifier] = select(i, ...qualifiers)
            //specialEffectAddSubAnimation(handle, subAnimTypeByAnimationQualifier[qualifier])
        }
        playSpecialEffect(handle, animTypeByAnimationName[name])
        // TODO
    }*/

    public get color(): PlayerColor {
        return this[EffectPropertyKey.COLOR] ?? PlayerColor.black
    }

    public set color(color: PlayerColor) {
        setSpecialEffectColor(this.handle, color)
        this[EffectPropertyKey.COLOR] = color
    }

    public get scale(): number {
        return getSpecialEffectScale(this.handle)
    }

    public set scale(scale: number) {
        setSpecialEffectScale(this.handle, scale)
    }

    public get pitch(): number {
        return this[EffectPropertyKey.PITCH] ?? 0
    }

    public set pitch(pitch: number) {
        setSpecialEffectPitchDegrees(this.handle, pitch)
        this[EffectPropertyKey.PITCH] = pitch
    }

    public get roll(): number {
        return this[EffectPropertyKey.ROLL] ?? 0
    }

    public set roll(roll: number) {
        setSpecialEffectRollDegrees(this.handle, roll)
        this[EffectPropertyKey.ROLL] = roll
    }

    public static create<T extends Effect>(
        this: typeof Effect & (new (handle: jeffect) => T),
        model: string,
        pos: Vec2,
    ): T {
        return this.of(addSpecialEffect(model, pos.x, pos.y))
    }

    public static createTarget<T extends Effect>(
        this: typeof Effect & (new (handle: jeffect) => T),
        model: string,
        target: Widget,
        attachPoint: string,
    ): T {
        return this.of(addSpecialEffectTarget(model, target.handle, attachPoint))
    }

    public static flash(
        modelPath: string,
        ...args: [
            ...pointOrWidget: [x: number, y: number] | [widget: Widget, attachmentPoint?: string],
            ...parametersOrDuration:
                | [parametersOrDuration?: EffectParameters | number]
                | [duration?: number, parameters?: EffectParameters],
        ]
    ): void

    public static flash(
        modelPath: string,
        xOrWidget: number | Widget,
        yOrOrAttachmentPoint?: number | string,
        parametersOrDuration?: EffectParameters | number,
        parameters?: EffectParameters,
    ): void {
        if (typeof parametersOrDuration != "number") {
            parameters = parametersOrDuration
            parametersOrDuration = undefined
        }

        const coordinatesProvided = typeof xOrWidget == "number"
        const isPositional = coordinatesProvided || parameters?.detached == true
        const x = !isPositional ? 0 : coordinatesProvided ? xOrWidget : xOrWidget.x
        const y = !isPositional
            ? 0
            : coordinatesProvided
              ? (yOrOrAttachmentPoint as number)
              : xOrWidget.y

        const effect = isPositional
            ? addSpecialEffect(modelPath, x, y)
            : addSpecialEffectTarget(
                  modelPath,
                  xOrWidget.handle,
                  (yOrOrAttachmentPoint ?? "origin") as string,
              )
        if (
            isPositional &&
            !coordinatesProvided &&
            parameters?.scale == undefined &&
            xOrWidget instanceof Unit
        ) {
            setSpecialEffectScale(effect, xOrWidget.scale)
        }
        if (parameters != undefined) {
            for (const [key, value] of pairs(parameters)) {
                if (key != "zOffset" && key != "detached" && key != "scaleZOffset") {
                    setters[key](effect, value as any)
                }
            }
            if (isPositional && parameters.zOffset != undefined) {
                moveLocation(location, x, y)
                const z =
                    xOrWidget instanceof Unit
                        ? getLocationZ(location) + xOrWidget.flyHeight
                        : getLocationZ(location)
                BlzSetSpecialEffectZ(
                    effect,
                    z +
                        parameters.zOffset *
                            (parameters.scaleZOffset ? getSpecialEffectScale(effect) : 1),
                )
            }
        }
        if (parametersOrDuration != undefined && parametersOrDuration > 0) {
            ++temporaryEffectsCount
            temporaryEffects[temporaryEffectsCount - 1] = effect
            temporaryEffectsDurations[temporaryEffectsCount - 1] = parametersOrDuration
            return
        }
        destroyEffect(effect)
    }

    public static flashTarget(
        model: string,
        target: Widget,
        attachPoint: string,
        duration?: number,
    ): void {
        const effect = addSpecialEffectTarget(model, target.handle, attachPoint)
        if (effect != undefined) {
            if (duration && duration > 0) {
                ++temporaryEffectsCount
                temporaryEffects[temporaryEffectsCount - 1] = effect
                temporaryEffectsDurations[temporaryEffectsCount - 1] = duration
            } else {
                destroyEffect(effect)
            }
        }
    }
}
