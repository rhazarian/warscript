import { ObjectDataEntry, ObjectDataEntryId } from "../entry"
import { SoundEax } from "../auxiliary/sound-eax"

export type SoundPresetId = ObjectDataEntryId & string & { readonly __soundPresetId: unique symbol }

export type StandardSoundPresetId = SoundPresetId & {
    readonly __standardSoundPresetId: unique symbol
}

export class SoundPreset extends ObjectDataEntry<SoundPresetId> {
    public static override readonly BASE_ID = "BlizzardWave" as SoundPresetId

    private static nextId = 0

    protected static override generateId(): string {
        return `CustomSound${this.nextId++}`
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.sound
    }

    public get filePaths(): string[] {
        return this.getStringsField("FileNames")
    }

    public set filePaths(filePaths: string[]) {
        this.setStringsField("FileNames", filePaths)
    }

    public get volume(): number {
        return this.getNumberField("Volume")
    }

    public set volume(volume: number) {
        this.setNumberField("Volume", volume)
    }

    public get pitch(): number {
        return this.getNumberField("Pitch")
    }

    public set pitch(pitch: number) {
        this.setNumberField("Pitch", pitch)
    }

    public get priority(): number {
        return this.getNumberField("Priority")
    }

    public set priority(priority: number) {
        this.setNumberField("Priority", priority)
    }

    public get channel(): number {
        return this.getNumberField("Channel")
    }

    public set channel(channel: number) {
        this.setNumberField("Channel", channel)
    }

    public get minimumDistance(): number {
        return this.getNumberField("MinDistance")
    }

    public set minimumDistance(minimumDistance: number) {
        this.setNumberField("MinDistance", minimumDistance)
    }

    public get maximumDistance(): number {
        return this.getNumberField("MaxDistance")
    }

    public set maximumDistance(maximumDistance: number) {
        this.setNumberField("MaxDistance", maximumDistance)
    }

    public get distanceCutoff(): number {
        return this.getNumberField("DistanceCutoff")
    }

    public set distanceCutoff(distanceCutoff: number) {
        this.setNumberField("DistanceCutoff", distanceCutoff)
    }

    public get eax(): SoundEax {
        return this.getStringField("EAXFlags") as SoundEax
    }

    public set eax(eax: SoundEax) {
        this.setStringField("EAXFlags", eax)
    }
}
