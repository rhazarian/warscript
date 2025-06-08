import { ObjectDataEntry, ObjectDataEntryConstructor, ObjectDataEntryId } from "../entry"
import { ObjectDataEntryIdGenerator } from "../utility/object-data-entry-id-generator"
import { Color } from "../../../core/types/color"
import { implementReadonlyNumberIndexSupplier } from "../../../utility/reflection"

export type LightningTypeId = ObjectDataEntryId &
    number & { readonly __lightningTypeId: unique symbol }

export type StandardLightningTypeId = LightningTypeId & {
    readonly __standardLightningTypeId: unique symbol
}

export class LightningType extends ObjectDataEntry<LightningTypeId> {
    static readonly [id: StandardLightningTypeId]: ObjectDataEntryConstructor<LightningType>

    static {
        implementReadonlyNumberIndexSupplier(LightningType, (id) => {
            return class extends LightningType {
                public static override readonly BASE_ID = id
            }
        })
    }

    public static override readonly BASE_ID = fourCC("INIT") as LightningTypeId

    private static readonly idGenerator = new ObjectDataEntryIdGenerator(fourCC("L000"))

    protected static override generateId(): number {
        return this.idGenerator.next()
    }

    protected static override getObjectData(map: WarMap): WarObjects {
        return map.objects.lightning
    }

    public get name(): string {
        return this.getStringField("comment")
    }

    public set name(name: string) {
        this.setStringField("comment", name)
    }

    public get textureFilePath(): string {
        const directoryPath = this.getStringField("Dir")
        const fileName = this.getStringField("file")
        return directoryPath != "" ? `${directoryPath}\\${fileName}` : fileName
    }

    public set textureFilePath(textureFilePath: string) {
        const lastSlashIndex = textureFilePath.indexOfLast((char) => char == "\\" || char == "/")
        this.setStringField("Dir", textureFilePath.substring(0, lastSlashIndex))
        this.setStringField("file", textureFilePath.substring(lastSlashIndex + 1))
    }

    public get popcornFxFilePath(): string {
        return this.getStringField("FxFile")
    }

    public set popcornFxFilePath(popcornFxFilePath: string) {
        this.setStringField("FxFile", popcornFxFilePath)
    }

    public get averageSegmentLength(): number {
        return this.getNumberField("AvgSegLen")
    }

    public set averageSegmentLength(averageSegmentLength: number) {
        this.setNumberField("AvgSegLen", averageSegmentLength)
    }

    public get width(): number {
        return this.getNumberField("Width")
    }

    public set width(width: number) {
        this.setNumberField("Width", width)
    }

    public get tintingColor(): Color {
        return Color.of(
            this.getNumberField("R"),
            this.getNumberField("G"),
            this.getNumberField("B"),
            this.getNumberField("A"),
        )
    }

    public set tintingColor(tintingColor: Color) {
        this.setNumberField("R", tintingColor.r)
        this.setNumberField("G", tintingColor.g)
        this.setNumberField("B", tintingColor.b)
        this.setNumberField("A", tintingColor.a)
    }

    public get noiseScale(): number {
        return this.getNumberField("NoiseScale")
    }

    public set noiseScale(noiseScale: number) {
        this.setNumberField("NoiseScale", noiseScale)
    }

    public get textureCoordinatesScale(): number {
        return this.getNumberField("TexCoordScale")
    }

    public set textureCoordinatesScale(textureCoordinatesScale: number) {
        this.setNumberField("TexCoordScale", textureCoordinatesScale)
    }

    public get duration(): number {
        return this.getNumberField("Duration")
    }

    public set duration(duration: number) {
        this.setNumberField("Duration", duration)
    }

    public get version(): number {
        return this.getNumberField("version")
    }

    public set version(version: number) {
        this.setNumberField("version", version)
    }
}
