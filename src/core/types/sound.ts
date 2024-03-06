import { Handle, HandleDestructor } from "./handle"
import { Unit } from "./unit"

const createSound = CreateSound
const setSoundPitch = SetSoundPitch
const setSoundChannel = SetSoundChannel
const setSoundPosition = SetSoundPosition
const setSoundVolume = SetSoundVolume
const setSoundDistances = SetSoundDistances
const setSoundDistanceCutoff = SetSoundDistanceCutoff
const setSoundConeAngles = SetSoundConeAngles
const setSoundConeOrientation = SetSoundConeOrientation
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

export enum SoundEax {
    Default = "DefaultEAXON",
    Acknowledgements = "HeroAcksEAX",
    Environment = "DoodadsEAX",
    Drums = "KotoDrumsEAX",
    Attacks = "CombatSoundsEAX",
    Abilities = "SpellsEAX",
    Missiles = "MissilesEAX",
}

// TODO: rename to ... SoundSettings?
export type SoundPreset = Readonly<{
    channel?: SoundChannel
    eax?: SoundEax
    fadeInRate?: number
    fadeOutRate?: number
    looping?: boolean
    volume?: number
    pitch?: number
}>

export type Sound3DPreset = SoundPreset &
    Readonly<{
        stopWhenOutOfRange?: boolean
        minDistance?: number
        maxDistance?: number
        distanceCutoff?: number
    }>

export namespace SoundPreset {
    export const UI: SoundPreset = {
        channel: SoundChannel.UI,
        eax: SoundEax.Default,
        fadeInRate: 12700,
        fadeOutRate: 12700,
    }

    export const Music: SoundPreset = {
        channel: SoundChannel.Music,
        eax: SoundEax.Default,
        fadeInRate: 12700,
        fadeOutRate: 12700,
        looping: true,
    }

    export const Attack: Sound3DPreset = {
        channel: SoundChannel.Combat,
        eax: SoundEax.Attacks,
        fadeInRate: 10,
        fadeOutRate: 10,
    }

    export const Ability: Sound3DPreset = {
        channel: SoundChannel.Animations,
        eax: SoundEax.Abilities,
        stopWhenOutOfRange: true,
        volume: 127,
        fadeInRate: 1,
        fadeOutRate: 1,
        pitch: 1,
        minDistance: 600,
        maxDistance: 3500,
        distanceCutoff: 3000,
    } as SoundPreset

    export const AbilityLooping: Sound3DPreset = {
        channel: SoundChannel.Birth,
        eax: SoundEax.Abilities,
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

    export const Missile: Sound3DPreset = {
        channel: SoundChannel.Animations,
        eax: SoundEax.Missiles,
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

const createPresetSound = (fileName: string, preset: SoundPreset) => {
    const sound = createSound(
        fileName,
        preset.looping ?? false,
        false,
        true,
        preset.fadeInRate ?? 12700,
        preset.fadeOutRate ?? 12700,
        preset.eax ?? SoundEax.Default
    )
    setSoundChannel(sound, preset.channel ?? SoundChannel.General)
    setSoundVolume(sound, preset.volume ?? 127)
    return sound
}

const createPreset3DSound = (fileName: string, preset: Sound3DPreset) => {
    const sound = createSound(
        fileName,
        preset.looping ?? false,
        true,
        preset.stopWhenOutOfRange ?? true,
        preset.fadeInRate ?? 12700,
        preset.fadeOutRate ?? 12700,
        preset.eax ?? SoundEax.Default
    )
    setSoundChannel(sound, preset.channel ?? SoundChannel.General)
    setSoundVolume(sound, preset.volume ?? 127)
    setSoundPitch(sound, preset.pitch ?? 1)
    setSoundDistances(sound, preset.minDistance ?? 600, preset.maxDistance ?? 8000)
    setSoundDistanceCutoff(sound, preset.distanceCutoff ?? 1500)
    return sound
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

    public static play(fileName: string, preset: SoundPreset): void {
        const sound = createPresetSound(fileName, preset)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static create(fileName: string, preset: SoundPreset): Sound {
        return Sound.of(createPresetSound(fileName, preset))
    }
}

export class Sound3D extends Sound {
    public static playAtPosition(
        fileName: string,
        preset: Sound3DPreset,
        x = 0,
        y = 0,
        z = 0
    ): void {
        const sound = createPreset3DSound(fileName, preset)
        setSoundPosition(sound, x, y, z)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static playOnUnit(fileName: string, preset: Sound3DPreset, unit: Unit): void {
        const sound = createPreset3DSound(fileName, preset)
        attachSoundToUnit(sound, unit.handle)
        startSound(sound)
        killSoundWhenDone(sound)
    }

    public static createAtPosition(
        fileName: string,
        preset: Sound3DPreset,
        x = 0,
        y = 0,
        z = 0
    ): Sound3D {
        const sound = createPreset3DSound(fileName, preset)
        setSoundPosition(sound, x, y, z)
        return Sound3D.of(sound)
    }

    public static createOnUnit(fileName: string, preset: Sound3DPreset, unit: Unit): Sound3D {
        const sound = createPreset3DSound(fileName, preset)
        attachSoundToUnit(sound, unit.handle)
        return Sound3D.of(sound)
    }
}
