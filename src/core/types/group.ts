import { Widget } from "./widget"
import { Unit } from "../../engine/internal/unit"

const select = _G.select
const createGroup = CreateGroup
const destroyGroup = DestroyGroup
const groupAddGroupFast = BlzGroupAddGroupFast
const groupAddUnit = GroupAddUnit
const groupClear = GroupClear
const groupGetSize = BlzGroupGetSize
const groupRemoveGroupFast = BlzGroupRemoveGroupFast
const groupRemoveUnit = GroupRemoveUnit
const groupImmediateOrderById = GroupImmediateOrderById
const groupPointOrderById = GroupPointOrderById
const groupTargetOrderById = GroupTargetOrderById
const groupUnitAt = BlzGroupUnitAt

export class Group {
    private constructor(private readonly handle: jgroup) {
        // no-op
    }

    public static create(...units: Unit[]): Group {
        const handle = createGroup()
        for (const i of $range(1, select("#", ...units))) {
            groupAddUnit(handle, select(i, ...units)[0].handle)
        }
        return new this(handle)
    }

    private __gc(): void {
        destroyGroup(this.handle)
    }

    public add(unit: Unit): boolean {
        return groupAddUnit(this.handle, unit.handle)
    }

    public addAll(group: Group): number {
        return groupAddGroupFast(this.handle, group.handle)
    }

    public delete(unit: Unit): boolean {
        return groupRemoveUnit(this.handle, unit.handle)
    }

    public deleteAll(group: Group): number {
        return groupRemoveGroupFast(this.handle, group.handle)
    }

    public clear(): void {
        groupClear(this.handle)
    }

    public get size(): number {
        return groupGetSize(this.handle)
    }

    public toArray(): Unit[] {
        const handle = this.handle
        const array: Unit[] = []
        for (const i of $range(0, groupGetSize(handle) - 1)) {
            array[i] = Unit.of(groupUnitAt(handle, i))
        }
        return array
    }

    public toSet(): Set<Unit> {
        const handle = this.handle
        const set = new Set<Unit>()
        for (const i of $range(0, groupGetSize(handle) - 1)) {
            set.add(Unit.of(groupUnitAt(handle, i)))
        }
        return set
    }

    public toLuaSet(): LuaSet<Unit> {
        const handle = this.handle
        const luaSet = new LuaSet<Unit>()
        for (const i of $range(0, groupGetSize(handle) - 1)) {
            luaSet.add(Unit.of(groupUnitAt(handle, i)))
        }
        return luaSet
    }

    public issueImmediateOrder(order: number): boolean {
        return groupImmediateOrderById(this.handle, order)
    }

    public issuePointOrder(order: number, x: number, y: number): boolean {
        return groupPointOrderById(this.handle, order, x, y)
    }

    public issueTargetOrder(order: number, target: Widget): boolean {
        return groupTargetOrderById(this.handle, order, target.handle)
    }
}
