import { LevelFieldValueProvider, ObjectDefinition } from "./object"
import * as idgen from "./idgen"

export class UpgradeDefinition extends ObjectDefinition {
    public readonly id: string

    public constructor(baseId: string, id?: string) {
        super(currentMap!.objects.upgrade.newObject(id ?? idgen.upgrade(), baseId))
        this.id = this.object.id
    }

    public get name(): string[] {
        return this.getStringLevelField("gnam")
    }

    public set name(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("gnam", v)
    }

    public get tooltip(): string[] {
        return this.getStringLevelField("gtp1")
    }

    public set tooltip(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("gtp1", v)
    }

    public get tooltipExtended(): string[] {
        return this.getStringLevelField("gub1")
    }

    public set tooltipExtended(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("gub1", v)
    }

    public get hotkey(): string[] {
        return this.getStringLevelField("ghk1")
    }

    public set hotkey(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("ghk1", v)
    }

    public get buttonPositionX(): 0 | 1 | 2 | 3 {
        return this.getNumberField("gbpx") as 0 | 1 | 2 | 3
    }

    public set buttonPositionX(v: 0 | 1 | 2 | 3) {
        this.setNumberField("gbpx", v)
    }

    public get buttonPositionY(): 0 | 1 | 2 {
        return this.getNumberField("gbpy") as 0 | 1 | 2
    }

    public set buttonPositionY(v: 0 | 1 | 2) {
        this.setNumberField("gbpy", v)
    }

    public get levels(): number {
        return this.getNumberField("glvl")
    }

    public set levels(v: number) {
        this.setNumberField("glvl", v)
    }

    public get icon(): string[] {
        return this.getStringLevelField("gar1")
    }

    public set icon(v: LevelFieldValueProvider<string>) {
        this.setStringLevelField("gar1", v)
    }
}
