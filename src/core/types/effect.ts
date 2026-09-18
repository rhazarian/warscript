import { Handle, HandleDestructor } from "./handle"
import { Widget } from "./widget"
import { PlayerColor } from "./playerColor"
import { Player } from "./player"
import { Timer } from "./timer"
import { Unit } from "../../engine/internal/unit"

const addSpecialEffect = AddSpecialEffect
const addSpecialEffectTarget = AddSpecialEffectTarget
const destroyEffect = DestroyEffect
const getLocationZ = GetLocationZ
const getSpecialEffectScale = BlzGetSpecialEffectScale
const moveLocation = MoveLocation
const queueSpecialEffectAnimation = BlzQueueSpecialEffectAnimation
const setSpecialEffectAnimation = BlzSetSpecialEffectAnimation
const setSpecialEffectAnimationBlendTime = BlzSetSpecialEffectAnimationBlendTime
const setSpecialEffectTimeScale = BlzSetSpecialEffectTimeScale
const setSpecialEffectColorByPlayer = BlzSetSpecialEffectColorByPlayer
const setSpecialEffectPitch = BlzSetSpecialEffectPitch
const setSpecialEffectRoll = BlzSetSpecialEffectRoll
const setSpecialEffectScale = BlzSetSpecialEffectScale
const setSpecialEffectZ = BlzSetSpecialEffectZ

const mathRad = math.rad

const location = Location(0, 0)

const setSpecialEffectPitchDegrees = (effect: jeffect, pitch: number): void => {
    setSpecialEffectPitch(effect, -mathRad(pitch))
}

const setSpecialEffectRollDegrees = (effect: jeffect, roll: number): void => {
    setSpecialEffectRoll(effect, -mathRad(roll))
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

const setterProperties = ["scale", "color", "pitch", "roll"] as const

const dummyPlayer = Player.neutralExtra

const temporaryEffects: jeffect[] = []
const temporaryEffectsDurations: number[] = []
let temporaryEffectsCount = 0

const delayedEffectsModelPath: string[] = []
const delayedEffectsXOrWidget: (number | Widget)[] = []
const delayedEffectsYOrAttachmentPoint: (number | string | undefined)[] = []
const delayedEffectsDuration: (number | undefined)[] = []
const delayedEffectsParameters: (EffectParameters | undefined)[] = []
const delayedEffectsDelay: number[] = []
let delayedEffectsCount = 0

const period = 1 / 32
Timer.onPeriod[period].addListener(() => {
    let i = 1
    while (i <= temporaryEffectsCount) {
        const duration = temporaryEffectsDurations[i - 1]
        if (duration <= 0) {
            destroyEffect(temporaryEffects[i - 1])
            temporaryEffects[i - 1] = temporaryEffects[temporaryEffectsCount - 1]
            temporaryEffectsDurations[i - 1] = temporaryEffectsDurations[temporaryEffectsCount - 1]
            --temporaryEffectsCount
        } else {
            temporaryEffectsDurations[i - 1] = duration - period
            ++i
        }
    }
    i = 1
    while (i <= delayedEffectsCount) {
        const delay = delayedEffectsDelay[i - 1]
        if (delay <= 0) {
            flash(
                delayedEffectsModelPath[i - 1],
                delayedEffectsXOrWidget[i - 1],
                delayedEffectsYOrAttachmentPoint[i - 1],
                delayedEffectsDuration[i - 1],
                delayedEffectsParameters[i - 1],
            )
            delayedEffectsModelPath[i - 1] = delayedEffectsModelPath[delayedEffectsCount - 1]
            delayedEffectsXOrWidget[i - 1] = delayedEffectsXOrWidget[delayedEffectsCount - 1]
            delayedEffectsYOrAttachmentPoint[i - 1] =
                delayedEffectsYOrAttachmentPoint[delayedEffectsCount - 1]
            delayedEffectsDuration[i - 1] = delayedEffectsDuration[delayedEffectsCount - 1]
            delayedEffectsParameters[i - 1] = delayedEffectsParameters[delayedEffectsCount - 1]
            delayedEffectsDelay[i - 1] = delayedEffectsDelay[delayedEffectsCount - 1]
            --delayedEffectsCount
        } else {
            delayedEffectsDelay[i - 1] = delay - period
            ++i
        }
    }
})

const enum EffectPropertyKey {
    COLOR = 100,
    PITCH,
    ROLL,
    BLEND_TIME,
    TIME_SCALE,
}

export type EffectParameters = {
    readonly delay?: number
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
    private [EffectPropertyKey.BLEND_TIME]?: number
    private [EffectPropertyKey.TIME_SCALE]?: number

    protected override onDestroy(): HandleDestructor {
        destroyEffect(this.handle)
        return super.onDestroy()
    }

    public setAnimation(animation: string): void {
        setSpecialEffectAnimation(this.handle, animation)
    }

    public queueAnimation(animation: string): void {
        queueSpecialEffectAnimation(this.handle, animation)
    }

    public get blendTime(): number {
        return this[EffectPropertyKey.BLEND_TIME] ?? 0
    }

    public set blendTime(blendTime: number) {
        setSpecialEffectAnimationBlendTime(this.handle, blendTime)
        this[EffectPropertyKey.BLEND_TIME] = blendTime
    }

    public get timeScale(): number {
        return this[EffectPropertyKey.TIME_SCALE] ?? 1
    }

    public set timeScale(timeScale: number) {
        setSpecialEffectTimeScale(this.handle, timeScale)
        this[EffectPropertyKey.TIME_SCALE] = timeScale
    }

    public get color(): PlayerColor {
        return this[EffectPropertyKey.COLOR] ?? PlayerColor.red
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
        modelPath: string,
        xOrWidget: number | Widget,
        yOrAttachmentPoint?: number | string,
        parameters?: EffectParameters,
    ): T {
        const effect = this.of(
            addSpecialEffectInternal(modelPath, xOrWidget, yOrAttachmentPoint, parameters),
        )

        if (parameters !== undefined) {
            effect[EffectPropertyKey.COLOR] = parameters.color
            effect[EffectPropertyKey.PITCH] = parameters.pitch
            effect[EffectPropertyKey.ROLL] = parameters.roll
        }

        return effect
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

        if (parameters && (parameters.delay ?? 0) > 0) {
            ++delayedEffectsCount
            delayedEffectsModelPath[delayedEffectsCount - 1] = modelPath
            delayedEffectsXOrWidget[delayedEffectsCount - 1] = xOrWidget
            delayedEffectsYOrAttachmentPoint[delayedEffectsCount - 1] = yOrOrAttachmentPoint
            delayedEffectsDuration[delayedEffectsCount - 1] = parametersOrDuration
            delayedEffectsParameters[delayedEffectsCount - 1] = parameters
            delayedEffectsDelay[delayedEffectsCount - 1] = parameters.delay!
            return
        }

        flash(modelPath, xOrWidget, yOrOrAttachmentPoint, parametersOrDuration, parameters)
    }
}

const addSpecialEffectInternal = (
    modelPath: string,
    xOrWidget: number | Widget,
    yOrAttachmentPoint?: number | string,
    parameters?: EffectParameters,
): jeffect => {
    const coordinatesProvided = typeof xOrWidget == "number"
    const isPositional = coordinatesProvided || parameters?.detached == true
    const x = !isPositional ? 0 : coordinatesProvided ? xOrWidget : xOrWidget.x
    const y = !isPositional ? 0 : coordinatesProvided ? (yOrAttachmentPoint as number) : xOrWidget.y

    const effect = isPositional
        ? addSpecialEffect(modelPath, x, y)
        : addSpecialEffectTarget(
              modelPath,
              xOrWidget.handle,
              (yOrAttachmentPoint ?? "origin") as string,
          )

    if (parameters !== undefined) {
        if (isPositional && parameters.scale == undefined && xOrWidget instanceof Unit) {
            setSpecialEffectScale(effect, xOrWidget.scale)
        }

        for (const property of setterProperties) {
            const value = parameters[property]
            if (value !== undefined) {
                setters[property](effect, value as any)
            }
        }

        if (isPositional && parameters.zOffset != undefined) {
            moveLocation(location, x, y)
            const z =
                xOrWidget instanceof Unit
                    ? getLocationZ(location) + xOrWidget.flyHeight
                    : getLocationZ(location)
            setSpecialEffectZ(
                effect,
                z +
                    parameters.zOffset *
                        (parameters.scaleZOffset ? getSpecialEffectScale(effect) : 1),
            )
        }
    }

    return effect
}

const flash = (
    modelPath: string,
    xOrWidget: number | Widget,
    yOrAttachmentPoint?: number | string,
    duration?: number,
    parameters?: EffectParameters,
): void => {
    const effect = addSpecialEffectInternal(modelPath, xOrWidget, yOrAttachmentPoint, parameters)
    if (duration != undefined && duration > 0) {
        ++temporaryEffectsCount
        temporaryEffects[temporaryEffectsCount - 1] = effect
        temporaryEffectsDurations[temporaryEffectsCount - 1] = duration
        return
    }
    destroyEffect(effect)
}
