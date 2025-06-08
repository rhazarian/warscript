import { ObjectDataEntry, ObjectDataEntryConstructor, ObjectDataEntryId } from "../entry"
import { implementReadonlyNumberIndexSupplier } from "../../../utility/reflection"

export type SoundPresetId = ObjectDataEntryId & string & { readonly __soundPresetId: unique symbol }

export type StandardSoundPresetId = SoundPresetId & {
    readonly __standardSoundPresetId: unique symbol
}

export class SoundPreset extends ObjectDataEntry<SoundPresetId> {
    static readonly [id: StandardSoundPresetId]: ObjectDataEntryConstructor<SoundPreset>

    static {
        implementReadonlyNumberIndexSupplier(SoundPreset, (id) => {
            return class extends SoundPreset {
                public static override readonly BASE_ID = id
            }
        })
    }

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
}
