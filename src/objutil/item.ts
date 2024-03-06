import { ObjectDefinition } from "./object"
import * as idgen from "./idgen"

export class ItemDefinition extends ObjectDefinition {
    public readonly id: string

    public constructor(
        baseId: string,
        id?: string,
        ctor?: Readonly<Partial<Omit<ItemDefinition, "id">>>
    ) {
        super(currentMap!.objects.item.newObject(id ?? idgen.item(), baseId))
        this.id = this.object.id
        if (ctor) {
            for (const [key, value] of pairs(ctor)) {
                this[key] = value as never
            }
        }
    }

    public get name(): string {
        return this.getStringField("unam")
    }

    public set name(v: string) {
        this.setStringField("unam", v)
    }

    public get description(): string {
        return this.getStringField("ides")
    }

    public set description(v: string) {
        this.setStringField("ides", v)
    }

    public get tooltip(): string {
        return this.getStringField("utip")
    }

    public set tooltip(v: string) {
        this.setStringField("utip", v)
    }

    public get tooltipExtended(): string {
        return this.getStringField("utub")
    }

    public set tooltipExtended(v: string) {
        this.setStringField("utub", v)
    }

    public get icon(): string {
        return this.getStringField("iico")
    }

    public set icon(v: string) {
        this.setStringField("iico", v)
    }

    public get model(): string {
        return this.getStringField("ifil")
    }

    public set model(v: string) {
        this.setStringField("ifil", v)
    }

    public get sellable(): boolean {
        return this.getBooleanField("isel")
    }

    public set sellable(sellable: boolean) {
        this.setBooleanField("isel", sellable)
    }

    public get pawnable(): boolean {
        return this.getBooleanField("ipaw")
    }

    public set pawnable(pawnable: boolean) {
        this.setBooleanField("ipaw", pawnable)
    }

    public get goldCost(): number {
        return this.getNumberField("igol")
    }

    public set goldCost(goldCost: number) {
        this.setNumberField("igol", goldCost)
    }

    public get lumberCost(): number {
        return this.getNumberField("ilum")
    }

    public set lumberCost(lumberCost: number) {
        this.setNumberField("ilum", lumberCost)
    }

    public get usable(): boolean {
        return this.getBooleanField("iusa")
    }

    public set usable(usable: boolean) {
        this.setBooleanField("iusa", usable)
    }

    public get perishable(): boolean {
        return this.getBooleanField("iper")
    }

    public set perishable(perishable: boolean) {
        this.setBooleanField("iper", perishable)
    }

    public get stack(): number {
        return this.getNumberField("iuse")
    }

    public set stack(maxStack: number) {
        this.setNumberField("iuse", maxStack)
    }

    public get maxStack(): number {
        return this.getNumberField("ista")
    }

    public set maxStack(maxStack: number) {
        this.setNumberField("ista", maxStack)
    }

    public get abilities(): number[] {
        return this.getStringField("iabi")
            .split(",")
            .map((v) => util.s2id(v))
    }

    public set abilities(v: (number | string)[]) {
        const value = v.map((v) => util.id2s(v)).join(",")
        this.setStringField("iabi", value)
    }

    public get cooldownGroupId(): number {
        return util.s2id(this.getStringField("icid"))
    }

    public set cooldownGroupId(v: number | string) {
        this.setStringField("icid", util.id2s(v))
    }
}
