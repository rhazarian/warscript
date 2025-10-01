import { Handle } from "../../core/types/handle"
import { Event } from "../../event"
import type { Item } from "../../core/types/item"
import type { Unit } from "./unit"
import type { AbilityTypeId } from "../object-data/entry/ability-type"
import {
    abilityActionDummy,
    doAbilityAction,
    doAbilityActionForceDummy,
    startItemCooldown,
} from "./item/ability"

const getUnitAbilityLevel = GetUnitAbilityLevel
const setUnitAbilityLevel = SetUnitAbilityLevel
const setAbilityIntegerField = BlzSetAbilityIntegerField
const setAbilityRealField = BlzSetAbilityRealField
const setAbilityBooleanField = BlzSetAbilityBooleanField
const setAbilityStringField = BlzSetAbilityStringField
const setAbilityIntegerLevelField = BlzSetAbilityIntegerLevelField
const setAbilityRealLevelField = BlzSetAbilityRealLevelField
const setAbilityBooleanLevelField = BlzSetAbilityBooleanLevelField
const setAbilityStringLevelField = BlzSetAbilityStringLevelField
const getAbilityIntegerField = BlzGetAbilityIntegerField
const getAbilityRealField = BlzGetAbilityRealField
const getAbilityBooleanField = BlzGetAbilityBooleanField
const getAbilityStringField = BlzGetAbilityStringField
const getAbilityIntegerLevelField = BlzGetAbilityIntegerLevelField
const getAbilityRealLevelField = BlzGetAbilityRealLevelField
const getAbilityBooleanLevelField = BlzGetAbilityBooleanLevelField
const getAbilityStringLevelField = BlzGetAbilityStringLevelField
const getUnitAbilityCooldownRemaining = BlzGetUnitAbilityCooldownRemaining
const startUnitAbilityCooldown = BlzStartUnitAbilityCooldown
const getHandleId = GetHandleId
const getItemBooleanField = BlzGetItemBooleanField
const setItemBooleanField = BlzSetItemBooleanField
const unitHideAbility = BlzUnitHideAbility
const unitDisableAbility = BlzUnitDisableAbility
const match = string.match
const type = _G.type
const tostring = _G.tostring

const commonFields = compiletime(() => {
    const commonFields: Record<number, true | undefined> = {}
    for (const id of [
        "anam",
        "ansf",
        "aher",
        "aite",
        "arac",
        "abpx",
        "abpy",
        "aubx",
        "auby",
        "arpx",
        "arpy",
        "aart",
        "auar",
        "arar",
        "acat",
        "atat",
        "asat",
        "aeat",
        "aaea",
        "alig",
        "amat",
        "amsp",
        "amac",
        "amho",
        "atac",
        "ata0",
        "ata1",
        "ata2",
        "ata3",
        "ata4",
        "ata5",
        "acac",
        "acap",
        "aca1",
        "aspt",
        "aani",
        "atp1",
        "aut1",
        "aub1",
        "auu1",
        "aret",
        "arut",
        "arhk",
        "ahky",
        "auhk",
        "areq",
        "arqa",
        "achd",
        "apri",
        "aord",
        "aoru",
        "aoro",
        "aorf",
        "aefs",
        "aefl",
        "alev",
        "arlv",
        "alsk",
        "atar",
        "acas",
        "adur",
        "ahdu",
        "acdn",
        "amcs",
        "aare",
        "aran",
        "abuf",
        "aeff",
        "ausk",
    ]) {
        commonFields[fourCC(id)] = true
    }
    return commonFields
})

const availableFields = postcompile(() => {
    const availableFields: Record<number, number | Record<number, true | undefined> | undefined> =
        {}
    if (currentMap) {
        for (const [id, ability] of pairs(currentMap.objects.ability.all)) {
            if (ability.parentId) {
                availableFields[fourCC(id)] = fourCC(ability.parentId)
            } else {
                const fields = ability.all.map((id) => fourCC(id)).filter((id) => !commonFields[id])
                if (fields.length != 0) {
                    const set: Record<number, true | undefined> = {}
                    for (const field of fields) {
                        set[field] = true
                    }
                    availableFields[fourCC(id)] = set
                }
            }
        }
    }
    return availableFields
})

const orders = postcompile(() => {
    const orders: Record<number, string | undefined> = {}
    if (currentMap) {
        for (const [id, ability] of pairs(currentMap.objects.ability.all)) {
            if (!ability.parentId) {
                orders[fourCC(id)] = ability["aord"] // fixme (aord can be changed and it won't change the ord)
            }
        }
    }
    return orders
})

export type jabilityfield =
    | jabilityintegerfield
    | jabilityrealfield
    | jabilitybooleanfield
    | jabilitystringfield
    | jabilityintegerlevelfield
    | jabilityreallevelfield
    | jabilitybooleanlevelfield
    | jabilitystringlevelfield

const fieldGetters: Record<
    string,
    (ability: Ability, field: any, level?: number) => number | boolean | string
> = {
    abilityintegerfield: (ability: Ability, field: jabilityintegerfield): number => {
        return getAbilityIntegerField(ability.handle, field)
    },
    abilityrealfield: (ability: Ability, field: jabilityrealfield): number => {
        return getAbilityRealField(ability.handle, field)
    },
    abilitybooleanfield: (ability: Ability, field: jabilitybooleanfield): boolean => {
        return getAbilityBooleanField(ability.handle, field)
    },
    abilitystringfield: (ability: Ability, field: jabilitystringfield): string => {
        return getAbilityStringField(ability.handle, field)
    },
    abilityintegerlevelfield: (
        ability: Ability,
        field: jabilityintegerlevelfield,
        level?: number,
    ): number => {
        return getAbilityIntegerLevelField(ability.handle, field, level ?? ability.level)
    },
    abilityreallevelfield: (
        ability: Ability,
        field: jabilityreallevelfield,
        level?: number,
    ): number => {
        return getAbilityRealLevelField(ability.handle, field, level ?? ability.level)
    },
    abilitybooleanlevelfield: (
        ability: Ability,
        field: jabilitybooleanlevelfield,
        level?: number,
    ): boolean => {
        return getAbilityBooleanLevelField(ability.handle, field, level ?? ability.level)
    },
    abilitystringlevelfield: (
        ability: Ability,
        field: jabilitystringlevelfield,
        level?: number,
    ): string => {
        return getAbilityStringLevelField(ability.handle, field, level ?? ability.level)
    },
}

const fieldSetters: Record<
    string,
    (ability: Ability, field: any, value: any, level?: number) => boolean
> = {
    abilityintegerfield: (ability: Ability, field: jabilityintegerfield, value: number) => {
        return setAbilityIntegerField(ability.handle, field, value)
    },
    abilityrealfield: (ability: Ability, field: jabilityrealfield, value: number) => {
        return setAbilityRealField(ability.handle, field, value)
    },
    abilitybooleanfield: (ability: Ability, field: jabilitybooleanfield, value: boolean) => {
        return setAbilityBooleanField(ability.handle, field, value)
    },
    abilitystringfield: (ability: Ability, field: jabilitystringfield, value: string) => {
        return setAbilityStringField(ability.handle, field, value)
    },
    abilityintegerlevelfield: (
        ability: Ability,
        field: jabilityintegerlevelfield,
        value: number,
        level?: number,
    ) => {
        return setAbilityIntegerLevelField(ability.handle, field, level ?? ability.level, value)
    },
    abilityreallevelfield: (
        ability: Ability,
        field: jabilityreallevelfield,
        value: number,
        level?: number,
    ) => {
        return setAbilityRealLevelField(ability.handle, field, level ?? ability.level, value)
    },
    abilitybooleanlevelfield: (
        ability: Ability,
        field: jabilitybooleanlevelfield,
        value: boolean,
        level?: number,
    ) => {
        return setAbilityBooleanLevelField(ability.handle, field, level ?? ability.level, value)
    },
    abilitystringlevelfield: (
        ability: Ability,
        field: jabilitystringlevelfield,
        value: string,
        level?: number,
    ) => {
        return setAbilityStringLevelField(ability.handle, field, level ?? ability.level, value)
    },
}

const levelRefreshFields = {
    [fourCC("Isx1")]: true,
    [fourCC("Idam")]: true,
    [fourCC("Iob5")]: true,
    [fourCC("Neg1")]: true,
}
const levelsField = ABILITY_IF_LEVELS

const order2orderId = _G.OrderId

const orderIdFieldByParentTypeId = {
    [fourCC("ANcl")]: ABILITY_SLF_BASE_ORDER_ID_NCL6,
    [fourCC("Aspb")]: ABILITY_SLF_BASE_ORDER_ID_SPB5,
    [fourCC("AAns")]: ABILITY_SLF_BASE_ORDER_ID_ANS5,
} // fixme: fill programmatically

export class AbilitySnapshot {
    // TOOD: implement
}

/** @internal For use by internal systems only. */
export const getOrderIdByAbilityTypeId = (abilityTypeId: AbilityTypeId): number => {
    const parentTypeId = availableFields[abilityTypeId]
    return order2orderId(
        orders[type(parentTypeId) == "number" ? (parentTypeId as number) : abilityTypeId] ?? "",
    )
}

export abstract class Ability extends Handle<jability> {
    public readonly typeId: AbilityTypeId

    protected constructor(handle: jability, typeId: number) {
        super(handle)
        this.typeId = typeId as AbilityTypeId
    }

    public override toString(): string {
        return `${this.constructor.name}$${util.id2s(this.typeId)}@${getHandleId(this.handle)}`
    }

    public get parentTypeId(): number {
        let parentTypeId = availableFields[this.typeId]
        parentTypeId = type(parentTypeId) == "number" ? (parentTypeId as number) : this.typeId
        rawset(this, "parentTypeId", parentTypeId)
        return parentTypeId
    }

    public get orderTypeStringId(): string {
        const field = orderIdFieldByParentTypeId[this.parentTypeId]
        return field != undefined
            ? getAbilityStringLevelField(this.handle, field, this.level)
            : (orders[this.parentTypeId] ?? "")
    }

    public get orderTypeId(): number {
        return order2orderId(this.orderTypeStringId)
    }

    public abstract readonly owner: Unit | Item

    public getSnapshot(): AbilitySnapshot {
        return null!
    }

    public hasField(field: jabilityfield | number): boolean {
        field = type(field) == "number" ? (field as number) : getHandleId(field as jabilityfield)
        if (commonFields[field]) {
            return true
        }
        let id = availableFields[this.typeId]
        if (type(id) == "number") {
            id = availableFields[id as number]
        }
        return !!(id && (id as Record<number, true | undefined>)[field])
    }

    public getField(field: jabilityintegerfield | jabilityrealfield): number
    public getField(field: jabilitybooleanfield): boolean
    public getField(field: jabilitystringfield): string
    public getField(
        field: jabilityintegerlevelfield | jabilityreallevelfield,
        level?: number,
    ): number
    public getField(field: jabilitybooleanlevelfield, level?: number): boolean
    public getField(field: jabilitystringlevelfield, level?: number): string

    public getField(field: jabilityfield, level?: number): number | boolean | string {
        const [fieldType] = match(tostring(field), "^(.-):")
        return fieldGetters[fieldType](this, field, level)
    }

    public setField(field: jabilityintegerfield | jabilityrealfield, value: number): boolean
    public setField(field: jabilitybooleanfield, value: boolean): boolean
    public setField(field: jabilitystringfield, value: string): boolean
    public setField(field: jabilityintegerlevelfield, value: number): boolean
    public setField(field: jabilityreallevelfield, value: number): boolean
    public setField(field: jabilitybooleanlevelfield, value: boolean): boolean
    public setField(field: jabilitystringlevelfield, value: string): boolean
    public setField(
        field: jabilityintegerlevelfield | jabilityreallevelfield,
        level: number,
        value: number,
    ): boolean
    public setField(field: jabilitybooleanlevelfield, level: number, value: boolean): boolean
    public setField(field: jabilitystringlevelfield, level: number, value: string): boolean

    public setField(
        field: jabilityfield,
        levelOrValue: number | boolean | string,
        value?: number | boolean | string,
    ): boolean {
        const [fieldType] = match(tostring(field), "^(.-):")
        const success =
            value != undefined
                ? fieldSetters[fieldType](this, field, value, levelOrValue as number)
                : fieldSetters[fieldType](this, field, levelOrValue)
        if (levelRefreshFields[getHandleId(field)] && success && this instanceof UnitAbility) {
            const unit = this.owner.handle
            const ability = this.handle
            const typeId = this.typeId
            const levels = getAbilityIntegerField(ability, levelsField)
            setAbilityIntegerField(ability, levelsField, levels + 1)
            const level = getUnitAbilityLevel(unit, typeId)
            setUnitAbilityLevel(unit, typeId, levels + 1)
            setUnitAbilityLevel(unit, typeId, level)
            setAbilityIntegerField(ability, levelsField, levels)
        }
        return success
    }

    public get levelCount(): number {
        return this.getField(ABILITY_IF_LEVELS)
    }

    public abstract get level(): number

    public abstract get cooldownRemaining(): number

    public abstract set cooldownRemaining(cooldownRemaining: number)

    public abstract interruptCast(): void

    public static get onCreate(): Event<[Ability]> {
        return this.onCreateEvent
    }

    public static get destroyEvent(): Event<[Ability]> {
        return this.onDestroyEvent
    }
}

/**
 * Can happen in extreme edge cases such as removing an ability from a unit during a chain of ability events.
 */
export class UnrecognizedAbility extends Ability {
    public constructor(
        typeId: number,
        public readonly owner: Unit,
    ) {
        super(null as unknown as jability, typeId)
    }

    public override get level(): number {
        return 0
    }

    public override get cooldownRemaining(): number {
        return 0
    }

    public override set cooldownRemaining(_: number) {}

    public override interruptCast(): void {}
}

export class UnitAbility extends Ability {
    private readonly u: junit

    public constructor(
        handle: jability,
        typeId: number,
        public readonly owner: Unit,
    ) {
        super(handle, typeId)
        this.u = owner.handle
    }

    public incrementHideCounter(): void {
        unitHideAbility(this.u, this.typeId, true)
    }

    public decrementHideCounter(): void {
        unitHideAbility(this.u, this.typeId, false)
    }

    public incrementDisableCounter(): void {
        unitDisableAbility(this.u, this.typeId, true, false)
    }

    public decrementDisableCounter(): void {
        unitDisableAbility(this.u, this.typeId, false, false)
    }

    public override get level(): number {
        return getUnitAbilityLevel(this.u, this.typeId) - 1
    }

    public set level(v: number) {
        setUnitAbilityLevel(this.u, this.typeId, v + 1)
    }

    public override get cooldownRemaining(): number {
        return getUnitAbilityCooldownRemaining(this.u, this.typeId)
    }

    public override set cooldownRemaining(cooldownRemaining: number) {
        startUnitAbilityCooldown(this.u, this.typeId, cooldownRemaining)
    }

    public override interruptCast(): void {
        this.owner.interruptCast(this.typeId)
    }

    public static get onCreate(): Event<[UnitAbility]> {
        return this.onCreateEvent
    }

    public static get onDestroy(): Event<[UnitAbility]> {
        return this.onDestroyEvent
    }
}

const getAbilityField = (
    _: jitem,
    ability: Ability,
    field: jabilityfield,
    level?: number,
): number | boolean | string => {
    return Ability.prototype.getField.call(ability, field as any, level)
}

const setAbilityField = (
    _: jitem,
    ability: Ability,
    field: jabilityfield,
    levelOrValue: number | boolean | string,
    value?: number | boolean | string,
): boolean => {
    return Ability.prototype.setField.call(ability, field as any, levelOrValue as any, value as any)
}

const getAbilityCooldown = (_: jitem, abilityTypeId: AbilityTypeId): number => {
    return getUnitAbilityCooldownRemaining(abilityActionDummy, abilityTypeId)
}

export class ItemAbility extends Ability {
    public constructor(
        handle: jability,
        typeId: number,
        public readonly owner: Item,
    ) {
        super(handle, typeId)
    }

    public getField(field: jabilityintegerfield | jabilityrealfield): number
    public getField(field: jabilitybooleanfield): boolean
    public getField(field: jabilitystringfield): string
    public getField(
        field: jabilityintegerlevelfield | jabilityreallevelfield,
        level?: number,
    ): number
    public getField(field: jabilitybooleanlevelfield, level?: number): boolean
    public getField(field: jabilitystringlevelfield, level?: number): string

    public getField(field: jabilityfield, level?: number): number | boolean | string {
        return doAbilityAction(this.owner.handle, getAbilityField, this, field, level)
    }

    public setField(field: jabilityintegerfield | jabilityrealfield, value: number): boolean
    public setField(field: jabilitybooleanfield, value: boolean): boolean
    public setField(field: jabilitystringfield, value: string): boolean
    public setField(field: jabilityintegerlevelfield, value: number): boolean
    public setField(field: jabilityreallevelfield, value: number): boolean
    public setField(field: jabilitybooleanlevelfield, value: boolean): boolean
    public setField(field: jabilitystringlevelfield, value: string): boolean
    public setField(
        field: jabilityintegerlevelfield | jabilityreallevelfield,
        level: number,
        value: number,
    ): boolean
    public setField(field: jabilitybooleanlevelfield, level: number, value: boolean): boolean
    public setField(field: jabilitystringlevelfield, level: number, value: string): boolean

    public setField(
        field: jabilityfield,
        levelOrValue: number | boolean | string,
        value?: number | boolean | string,
    ): boolean {
        return doAbilityAction(this.owner.handle, setAbilityField, this, field, levelOrValue, value)
    }

    public get level(): number {
        return 0
    }

    public override get cooldownRemaining(): number {
        const item = this.owner
        return doAbilityActionForceDummy(
            item.handle,
            item.owner?.handle,
            getAbilityCooldown,
            this.typeId,
        )
    }

    public override set cooldownRemaining(cooldownRemaining: number) {
        const item = this.owner
        startItemCooldown(item.handle, item.owner?.handle, cooldownRemaining)
    }

    public override interruptCast(): void {
        const handle = this.owner.handle
        const activelyUsed = getItemBooleanField(handle, ITEM_BF_ACTIVELY_USED)
        if (activelyUsed) {
            setItemBooleanField(handle, ITEM_BF_ACTIVELY_USED, false)
            setItemBooleanField(handle, ITEM_BF_ACTIVELY_USED, true)
        }
    }

    public static get onCreate(): Event<[ItemAbility]> {
        return this.onCreateEvent
    }

    public static get onDestroy(): Event<[ItemAbility]> {
        return this.onDestroyEvent
    }
}
