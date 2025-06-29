import { Handle, HandleDestructor } from "./handle"
import { Unit } from "./unit"
import { SoundEax } from "../../engine/object-data/auxiliary/sound-eax"
import { SoundPreset } from "../../engine/object-data/entry/sound-preset"
import { randomInteger } from "../../engine/random"

const createSound = CreateSound
const createSoundFromLabel = CreateSoundFromLabel
const setSoundPitch = SetSoundPitch
const setSoundChannel = SetSoundChannel
const setSoundPosition = SetSoundPosition
const setSoundVolume = SetSoundVolume
const setSoundDistances = SetSoundDistances
const setSoundDistanceCutoff = SetSoundDistanceCutoff
const startSound = StartSound
const setSoundPlayPosition = SetSoundPlayPosition
const stopSound = StopSound
const attachSoundToUnit = AttachSoundToUnit
const killSoundWhenDone = KillSoundWhenDone

export enum SoundChannel {
    General = 0,
    UnitSelection = 1,
    UnitAcknowledgements = 2,
    UnitMovement = 3,
    UnitReady = 4,
    Combat = 5,
    Error = 6,
    Music = 7,
    UI = 8,
    LoopingMovement = 9,
    LoopingAmbient = 10,
    Animations = 11,
    Construction = 12,
    Birth = 13,
    Fire = 14,
}

export type SoundSettings = Readonly<{
    channel?: SoundChannel
    eax?: SoundEax
    fadeInRate?: number
    fadeOutRate?: number
    looping?: boolean
    volume?: number
    pitch?: number
}>

export type Sound3DSettings = SoundSettings &
    Readonly<{
        stopWhenOutOfRange?: boolean
        minDistance?: number
        maxDistance?: number
        distanceCutoff?: number
    }>

export namespace SoundSettings {
    export const UI: SoundSettings = {
        channel: SoundChannel.UI,
        eax: SoundEax.DEFAULT,
        fadeInRate: 12700,
        fadeOutRate: 12700,
    }

    export const Music: SoundSettings = {
        channel: SoundChannel.Music,
        eax: SoundEax.DEFAULT,
        fadeInRate: 12700,
        fadeOutRate: 12700,
        looping: true,
    }

    export const Attack: Sound3DSettings = {
        channel: SoundChannel.Combat,
        eax: SoundEax.ATTACKS,
        fadeInRate: 10,
        fadeOutRate: 10,
    }

    export const Ability: Sound3DSettings = {
        channel: SoundChannel.Animations,
        eax: SoundEax.ABILITIES,
        stopWhenOutOfRange: true,
        volume: 127,
        fadeInRate: 1,
        fadeOutRate: 1,
        pitch: 1,
        minDistance: 600,
        maxDistance: 3500,
        distanceCutoff: 3000,
    } as SoundSettings

    export const AbilityLooping: Sound3DSettings = {
        channel: SoundChannel.Birth,
        eax: SoundEax.ABILITIES,
        looping: true,
        stopWhenOutOfRange: true,
        volume: 127,
        fadeInRate: 1,
        fadeOutRate: 1,
        pitch: 1,
        minDistance: 600,
        maxDistance: 3000,
        distanceCutoff: 3000,
    }

    export const Missile: Sound3DSettings = {
        channel: SoundChannel.Animations,
        eax: SoundEax.MISSILES,
        stopWhenOutOfRange: true,
        volume: 127,
        fadeInRate: 1,
        fadeOutRate: 1,
        pitch: 1,
        minDistance: 600,
        maxDistance: 3500,
        distanceCutoff: 3000,
    }
}

type CustomSoundPresetData = {
    filePaths: string[]
    volume: number
    pitch: number
    channel: number
    minimumDistance: number
    maximumDistance: number
    distanceCutoff: number
    eax: string
}

const customSoundPresetDataByLabel = postcompile(() => {
    const customSoundPresetDataByLabel = new LuaMap<string, CustomSoundPresetData>()
    for (const soundPreset of SoundPreset.getAll()) {
        if (soundPreset.isCustom) {
            customSoundPresetDataByLabel.set(soundPreset.id, {
                filePaths: soundPreset.filePaths,
                volume: soundPreset.volume,
                pitch: soundPreset.pitch,
                channel: soundPreset.channel,
                minimumDistance: soundPreset.minimumDistance,
                maximumDistance: soundPreset.maximumDistance,
                distanceCutoff: soundPreset.distanceCutoff,
                eax: soundPreset.eax,
            })
        }
    }
    return customSoundPresetDataByLabel
})

/** @internal For use by internal systems only. */
export const isSoundLabelCustom = (label: string): boolean => {
    return customSoundPresetDataByLabel.has(label)
}

const createPresetSound = (fileName: string, preset: SoundSettings) => {
    const sound = createSound(
        fileName,
        preset.looping ?? false,
        false,
        true,
        preset.fadeInRate ?? 12700,
        preset.fadeOutRate ?? 12700,
        preset.eax ?? SoundEax.DEFAULT,
    )
    setSoundChannel(sound, preset.channel ?? SoundChannel.General)
    setSoundVolume(sound, preset.volume ?? 127)
    return sound
}

const createPreset3DSound = (fileName: string, preset: Sound3DSettings) => {
    const sound = createSound(
        fileName,
        preset.looping ?? false,
        true,
        preset.stopWhenOutOfRange ?? true,
        preset.fadeInRate ?? 12700,
        preset.fadeOutRate ?? 12700,
        preset.eax ?? SoundEax.DEFAULT,
    )
    setSoundChannel(sound, preset.channel ?? SoundChannel.General)
    setSoundVolume(sound, preset.volume ?? 127)
    setSoundPitch(sound, preset.pitch ?? 1)
    setSoundDistances(sound, preset.minDistance ?? 600, preset.maxDistance ?? 8000)
    setSoundDistanceCutoff(sound, preset.distanceCutoff ?? 1500)
    return sound
}

const createPreset3DSoundFromLabel = (label: string, preset: Sound3DSettings) => {
    const customSoundPresetData = customSoundPresetDataByLabel.get(label)
    if (customSoundPresetData == undefined) {
        return createSoundFromLabel(
            label,
            preset.looping ?? false,
            true,
            preset.stopWhenOutOfRange ?? true,
            preset.fadeInRate ?? 12700,
            preset.fadeOutRate ?? 12700,
        )
    } else {
        const sound = createSound(
            customSoundPresetData.filePaths[
                randomInteger(customSoundPresetData.filePaths.length - 1)
            ],
            preset.looping ?? false,
            true,
            preset.stopWhenOutOfRange ?? true,
            preset.fadeInRate ?? 12700,
            preset.fadeOutRate ?? 12700,
            customSoundPresetData.eax,
        )
        setSoundChannel(sound, customSoundPresetData.channel)
        setSoundVolume(sound, customSoundPresetData.volume)
        setSoundPitch(sound, customSoundPresetData.pitch)
        setSoundDistances(
            sound,
            customSoundPresetData.minimumDistance,
            customSoundPresetData.maximumDistance,
        )
        setSoundDistanceCutoff(sound, customSoundPresetData.distanceCutoff)
        return sound
    }
}

export class Sound extends Handle<jsound, [fadeOut?: boolean]> {
    private _volume?: number

    protected override onDestroy(fadeOut?: boolean): HandleDestructor {
        stopSound(this.handle, true, fadeOut || false)
        return super.onDestroy()
    }

    public get volume(): number {
        return this._volume ?? 127
    }

    public set volume(v: number) {
        setSoundVolume(this.handle, v)
        this._volume = v
    }

    public start(milliseconds?: number): void {
        startSound(this.handle)
        if (milliseconds) {
            setSoundPlayPosition(this.handle, milliseconds)
        }
    }

    public stop(fadeOut?: boolean): void {
        stopSound(this.handle, false, fadeOut || false)
    }

    public restart(milliseconds?: number): void {
        const handle = this.handle
        stopSound(handle, false, false)
        startSound(handle)
        if (milliseconds) {
            setSoundPlayPosition(handle, milliseconds)
        }
    }

    public static play(fileName: string, preset: SoundSettings): void {
        const sound = createPresetSound(fileName, preset)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static create(fileName: string, preset: SoundSettings): Sound {
        return Sound.of(createPresetSound(fileName, preset))
    }
}

export class Sound3D extends Sound {
    public static playAtPosition(
        fileName: string,
        preset: Sound3DSettings,
        x = 0,
        y = 0,
        z = 0,
    ): void {
        const sound = createPreset3DSound(fileName, preset)
        setSoundPosition(sound, x, y, z)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static playOnUnit(fileName: string, preset: Sound3DSettings, unit: Unit): void {
        const sound = createPreset3DSound(fileName, preset)
        attachSoundToUnit(sound, unit.handle)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static playFromLabel(
        label: string,
        preset: Sound3DSettings,
        ...positionOrUnit: [Unit] | [number, number, number?]
    ): void

    public static playFromLabel(
        label: string,
        preset: Sound3DSettings,
        unitOrX: Unit | number,
        y?: number,
        z?: number,
    ): void {
        const sound = createPreset3DSoundFromLabel(label, preset)
        if (typeof unitOrX !== "number") {
            attachSoundToUnit(sound, unitOrX.handle)
        } else {
            setSoundPosition(sound, unitOrX, y ?? 0, z ?? 0)
        }
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static createAtPosition(
        fileName: string,
        preset: Sound3DSettings,
        x = 0,
        y = 0,
        z = 0,
    ): Sound3D {
        const sound = createPreset3DSound(fileName, preset)
        setSoundPosition(sound, x, y, z)
        return Sound3D.of(sound)
    }

    public static createOnUnit(fileName: string, preset: Sound3DSettings, unit: Unit): Sound3D {
        const sound = createPreset3DSound(fileName, preset)
        attachSoundToUnit(sound, unit.handle)
        return Sound3D.of(sound)
    }
}
