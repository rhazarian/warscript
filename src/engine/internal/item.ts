import { Handle, HandleDestructor } from "../../core/types/handle"
import { Color } from "../../core/types/color"
import { Event } from "../../event"
import { ReadonlyRect, Rect } from "../../core/types/rect"
import { ItemAbility } from "./ability"
import { AbilityTypeId } from "../object-data/entry/ability-type"
import { doAbilityAction } from "./item/ability"
import { DUMMY_ITEM_ID } from "./object-data/dummy-item"
import { SLOT_FILLER_ITEM_TYPE_ID } from "./unit/add-item-to-slot"
import { distance } from "../../math/vec2"
import type { ItemTypeId } from "../object-data/entry/item-type"

const itemAddAbility = BlzItemAddAbility
const itemRemoveAbility = BlzItemRemoveAbility
const getItemAbility = BlzGetItemAbility
const isItemPowerup = IsItemPowerup
const getItemAbilityByIndex = BlzGetItemAbilityByIndex
const getAbilityId = BlzGetAbilityId
const getWidgetLife = GetWidgetLife
const removeItem = RemoveItem
const getHandleId = GetHandleId
const setRect = SetRect
const enumItemsInRect = EnumItemsInRect
const getEnumItem = GetEnumItem
const getItemTypeId = GetItemTypeId
const getItemX = GetItemX
const getItemY = GetItemY

const getItemIntegerField = BlzGetItemIntegerField

const setItemBooleanField = BlzSetItemBooleanField
const getItemBooleanField = BlzGetItemBooleanField

const enumRect = Rect.create(0, 0, 0, 0).handle

type DefenseType = 0 | 1 | 2 | 3 | 4 | 5

export const addAndGetAbility = (handle: jitem, abilityTypeId: AbilityTypeId): jability | null => {
    if (itemAddAbility(handle, abilityTypeId)) {
        return getItemAbility(handle, abilityTypeId)
    }
    return null
}

const getItemAbilities = (handle: jitem, item: Item): ItemAbility[] => {
    const abilities: ItemAbility[] = []
    for (
        let i = 0, ability = getItemAbilityByIndex(handle, i);
        ability != undefined;
        i++, ability = getItemAbilityByIndex(handle, i)
    ) {
        abilities[i] = ItemAbility.of(ability, getAbilityId(ability), item)
    }
    return abilities
}

let targetCollection: Item[]
let targetCollectionNextIndex: number
let centerX: number
let centerY: number
let enumRange: number
const collectIntoTarget = () => {
    const item = getEnumItem()
    const typeId = getItemTypeId(item)
    if (typeId != DUMMY_ITEM_ID && typeId != SLOT_FILLER_ITEM_TYPE_ID) {
        targetCollection[targetCollectionNextIndex - 1] = Item.of(item)
        ++targetCollectionNextIndex
    }
}
const collectIntoTargetRange = () => {
    const item = getEnumItem()
    const typeId = getItemTypeId(item)
    if (
        distance(getItemX(item), getItemY(item), centerX, centerY) <= enumRange &&
        typeId != DUMMY_ITEM_ID &&
        typeId != SLOT_FILLER_ITEM_TYPE_ID
    ) {
        targetCollection[targetCollectionNextIndex - 1] = Item.of(item)
        ++targetCollectionNextIndex
    }
}

const enum ItemPropertyKey {
    ABILITIES = 100,
    LUA_INDEX_BY_ABILITY_TYPE_ID = 101,
}

export class Item extends Handle<jitem> {
    private readonly [ItemPropertyKey.ABILITIES]: ItemAbility[]
    private readonly [ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID]: Record<
        AbilityTypeId,
        number | undefined
    >

    public constructor(handle: jitem) {
        super(handle)

        const abilities = doAbilityAction(handle, getItemAbilities, this)
        this[ItemPropertyKey.ABILITIES] = abilities

        const luaIndexByAbilityTypeId = {} as Record<AbilityTypeId, number | undefined>
        for (const i of $range(1, abilities.length)) {
            luaIndexByAbilityTypeId[abilities[i - 1].typeId] = i
        }
        this[ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID] = luaIndexByAbilityTypeId
    }

    protected override onDestroy(): HandleDestructor {
        const abilities = this[ItemPropertyKey.ABILITIES]
        for (const i of $range(1, abilities.length)) {
            abilities[i - 1].destroy()
        }
        removeItem(this.handle)
        return super.onDestroy()
    }

    public static create<T extends Item>(
        this: typeof Item & (new (handle: jitem) => T),
        id: number,
        x: number,
        y: number,
        skinId?: number,
    ): T {
        return this.of(BlzCreateItemWithSkin(id, x, y, skinId ?? id))
    }

    public get typeId(): ItemTypeId {
        return GetItemTypeId(this.handle) as ItemTypeId
    }

    public set skinId(v: number) {
        BlzSetItemSkin(this.handle, v)
    }

    public get skinId(): number {
        return BlzGetItemSkin(this.handle)
    }

    public set name(v: string) {
        BlzSetItemName(this.handle, v)
    }

    public get name(): string {
        return GetItemName(this.handle)
    }

    public set description(v: string) {
        BlzSetItemDescription(this.handle, v)
    }

    public get description(): string {
        return BlzGetItemDescription(this.handle)
    }

    public set tooltip(v: string) {
        BlzSetItemTooltip(this.handle, v)
    }

    public get tooltip(): string {
        return BlzGetItemTooltip(this.handle)
    }

    public set extendedTooltip(v: string) {
        BlzSetItemExtendedTooltip(this.handle, v)
    }

    public get extendedTooltip(): string {
        return BlzGetItemExtendedTooltip(this.handle)
    }

    public set iconPath(v: string) {
        BlzSetItemIconPath(this.handle, v)
    }

    public get iconPath(): string {
        return BlzGetItemIconPath(this.handle)
    }

    public set dropOnDeath(v: boolean) {
        SetItemDropOnDeath(this.handle, v)
    }

    public get dropOnDeath(): boolean {
        return BlzGetItemBooleanField(this.handle, ITEM_BF_DROPPED_WHEN_CARRIER_DIES)
    }

    public set droppable(v: boolean) {
        SetItemDroppable(this.handle, v)
    }

    public get droppable(): boolean {
        return BlzGetItemBooleanField(this.handle, ITEM_BF_CAN_BE_DROPPED)
    }

    public set pawnable(v: boolean) {
        SetItemPawnable(this.handle, v)
    }

    public get pawnable(): boolean {
        return IsItemPawnable(this.handle)
    }

    public set perishable(v: boolean) {
        BlzSetItemBooleanField(this.handle, ITEM_BF_PERISHABLE, v)
    }

    public get perishable(): boolean {
        return BlzGetItemBooleanField(this.handle, ITEM_BF_PERISHABLE)
    }

    public set powerup(v: boolean) {
        setItemBooleanField(this.handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, v)
    }

    public get powerup(): boolean {
        return isItemPowerup(this.handle)
    }

    public get isAlive(): boolean {
        return getWidgetLife(this.handle) > 0
    }

    public get isDead(): boolean {
        return getWidgetLife(this.handle) <= 0
    }

    public set isInvulnerable(isInvulnerable: boolean) {
        SetItemInvulnerable(this.handle, isInvulnerable)
    }

    public get isInvulnerable(): boolean {
        return IsItemInvulnerable(this.handle)
    }

    public set usable(v: boolean) {
        const handle = this.handle
        const powerup = isItemPowerup(handle)
        setItemBooleanField(handle, ITEM_BF_ACTIVELY_USED, v)
        setItemBooleanField(handle, ITEM_BF_USE_AUTOMATICALLY_WHEN_ACQUIRED, powerup)
    }

    public get usable(): boolean {
        return getItemBooleanField(this.handle, ITEM_BF_ACTIVELY_USED)
    }

    public set visible(v: boolean) {
        SetItemVisible(this.handle, v)
    }

    public get visible(): boolean {
        return IsItemVisible(this.handle)
    }

    public set level(v: number) {
        BlzSetItemIntegerField(this.handle, ITEM_IF_LEVEL, v)
    }

    public get level(): number {
        return GetItemLevel(this.handle)
    }

    public set priority(v: number) {
        BlzSetItemIntegerField(this.handle, ITEM_IF_PRIORITY, v)
    }

    public get priority(): number {
        return BlzGetItemIntegerField(this.handle, ITEM_IF_PRIORITY)
    }

    public set health(v: number) {
        SetWidgetLife(this.handle, v)
    }

    public get health(): number {
        return GetWidgetLife(this.handle)
    }

    public set maxHealth(v: number) {
        BlzSetItemIntegerField(this.handle, ITEM_IF_MAX_HIT_POINTS, v)
    }

    public get maxHealth(): number {
        return BlzGetItemIntegerField(this.handle, ITEM_IF_MAX_HIT_POINTS)
    }

    public set defenseType(v: DefenseType) {
        BlzSetItemIntegerField(this.handle, ITEM_IF_ARMOR_TYPE, v)
    }

    public get defenseType(): DefenseType {
        return BlzGetItemIntegerField(this.handle, ITEM_IF_ARMOR_TYPE) as DefenseType
    }

    public set cooldownId(v: number) {
        BlzSetItemIntegerField(this.handle, ITEM_IF_COOLDOWN_GROUP, v)
    }

    public get cooldownId(): number {
        return BlzGetItemIntegerField(this.handle, ITEM_IF_COOLDOWN_GROUP)
    }

    public get x(): number {
        return GetItemX(this.handle)
    }

    public set x(v: number) {
        SetItemPosition(this.handle, v, GetItemY(this.handle))
    }

    public get y(): number {
        return GetItemY(this.handle)
    }

    public set y(v: number) {
        SetItemPosition(this.handle, GetItemX(this.handle), v)
    }

    public set scale(v: number) {
        BlzSetItemRealField(this.handle, ITEM_RF_SCALING_VALUE, v)
    }

    public get scale(): number {
        return BlzGetItemRealField(this.handle, ITEM_RF_SCALING_VALUE)
    }

    public set vertexColor(v: Color) {
        const handle = this.handle
        BlzSetItemIntegerField(handle, ITEM_IF_TINTING_COLOR_RED, v.r)
        BlzSetItemIntegerField(handle, ITEM_IF_TINTING_COLOR_GREEN, v.g)
        BlzSetItemIntegerField(handle, ITEM_IF_TINTING_COLOR_BLUE, v.b)
        BlzSetItemIntegerField(handle, ITEM_IF_TINTING_COLOR_ALPHA, v.a)
    }

    public get vertexColor(): Color {
        const handle = this.handle
        return Color.of(
            getItemIntegerField(handle, ITEM_IF_TINTING_COLOR_RED),
            getItemIntegerField(handle, ITEM_IF_TINTING_COLOR_GREEN),
            getItemIntegerField(handle, ITEM_IF_TINTING_COLOR_BLUE),
            getItemIntegerField(handle, ITEM_IF_TINTING_COLOR_ALPHA),
        )
    }

    public get model(): string {
        return BlzGetItemStringField(this.handle, ITEM_SF_MODEL_USED)
    }

    public get position(): Vec2 {
        return vec2(GetItemX(this.handle), GetItemY(this.handle))
    }

    public set position(v: Vec2) {
        SetItemPosition(this.handle, v.x, v.y)
    }

    public set charges(v: number) {
        SetItemCharges(this.handle, v)
    }

    public get charges(): number {
        return GetItemCharges(this.handle)
    }

    public addAbility(abilityTypeId: AbilityTypeId): ItemAbility | undefined {
        const nativeAbility = doAbilityAction(this.handle, addAndGetAbility, abilityTypeId)
        if (nativeAbility != null) {
            const ability = ItemAbility.of(nativeAbility, abilityTypeId, this)
            const abilities = this[ItemPropertyKey.ABILITIES]
            const luaIndex = abilities.length + 1
            abilities[luaIndex - 1] = ability
            this[ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID][abilityTypeId] = luaIndex
            return ability
        }
        return undefined
    }

    public removeAbility(abilityTypeId: AbilityTypeId): boolean {
        const luaIndexByAbilityTypeId = this[ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID]
        const luaIndex = luaIndexByAbilityTypeId[abilityTypeId]
        if (
            luaIndex != undefined &&
            doAbilityAction(this.handle, itemRemoveAbility, abilityTypeId)
        ) {
            luaIndexByAbilityTypeId[abilityTypeId] = undefined
            const abilities = this[ItemPropertyKey.ABILITIES]
            abilities[luaIndex - 1].destroy()
            const abilityTypeIdsLength = abilities.length
            for (const j of $range(luaIndex, abilityTypeIdsLength)) {
                abilities[j - 1] = abilities[j]
            }
        }
        return false
    }

    public hasAbility(abilityTypeId: AbilityTypeId): boolean {
        return this[ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID][abilityTypeId] != undefined
    }

    public getAbility(abilityTypeId: AbilityTypeId): ItemAbility | undefined {
        const ability =
            this[ItemPropertyKey.LUA_INDEX_BY_ABILITY_TYPE_ID][abilityTypeId] != undefined &&
            doAbilityAction(this.handle, getItemAbility, abilityTypeId)
        return ability ? ItemAbility.of(ability, abilityTypeId, this) : undefined
    }

    public get abilities(): readonly ItemAbility[] {
        return this[ItemPropertyKey.ABILITIES]
    }

    public static getInRange(x: number, y: number, range: number): Item[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        centerX = x
        centerY = y
        enumRange = range
        setRect(enumRect, x - range, y - range, x + range, y + range)
        enumItemsInRect(enumRect, undefined, collectIntoTargetRange)
        return targetCollection
    }

    public static getInRect(rect: ReadonlyRect): Item[] {
        targetCollection = []
        targetCollectionNextIndex = 1
        enumItemsInRect(rect.handle, undefined, collectIntoTarget)
        return targetCollection
    }

    public static get onCreate(): Event<[Item]> {
        return this.onCreateEvent
    }

    public static override get destroyEvent(): Event<[Item]> {
        return this.onDestroyEvent
    }
}

const getManipulatedItem = GetManipulatedItem

const trigger = CreateTrigger()
TriggerRegisterAnyUnitEventBJ(trigger, EVENT_PLAYER_UNIT_PICKUP_ITEM)
TriggerAddAction(trigger, () => {
    const item = getManipulatedItem()
    const abilities = Item.of(item)[ItemPropertyKey.ABILITIES]

    const memoized = ItemAbility["memoized"]

    for (const ability of abilities) {
        const newHandle = getItemAbility(item, ability.typeId)
        if (newHandle != undefined) {
            const oldId = getHandleId(ability.handle)
            const newId = getHandleId(newHandle)
            delete memoized[oldId]
            memoized[newId] = ability
            ;(
                ability as {
                    handle: jhandle
                }
            ).handle = newHandle
        }
    }
})
