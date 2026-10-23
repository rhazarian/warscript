-- Run after tstl: node_modules/.bin/warpack exec tests/ability-snapshot.test.lua
-- Tests the emitted Lua of AbilitySnapshot: it holds the ability, the level it was at and the
-- values of its fields at that level, and nothing else -- no values of other levels, and no
-- state of the ability itself, and nothing of it can be set: it is what the ability was.
package.path = "dist/?.lua;node_modules/typescript-to-lua/dist/lualib/universal/?.lua;" .. package.path

local function fourCC(id)
    local a, b, c, d = id:byte(1, 4)
    return ((a * 256 + b) * 256 + c) * 256 + d
end
_G.fourCC = fourCC
compiletime = function(callback) return callback() end
postcompile = function(callback) return callback() end
util = { id2s = function(id) return tostring(id) end }
warpack = { safeCall = function(callback, ...) return true, callback(...) end }
OrderId = function() return 0 end
Condition = function(callback) return callback end
CreateTrigger = function() return {} end
DestroyTrigger = function() end
TriggerAddCondition = function() end
TriggerClearConditions = function() end
BlzTriggerInterrupt = function() end
BlzTriggerIsRunning = function() return false end
GetHandleId = function(handle) return handle.id end

-- Native ability fields are found through their ABILITY_* globals and told apart by tostring.
local function field(kind, rawId)
    return setmetatable({ id = fourCC(rawId) }, { __tostring = function(self) return kind .. ": " .. self.id end })
end
ABILITY_IF_LEVELS = field("abilityintegerfield", "alev")
ABILITY_SLF_BASE_ORDER_ID_NCL6 = field("abilitystringlevelfield", "Ncl6")
ABILITY_SLF_BASE_ORDER_ID_SPB5 = field("abilitystringlevelfield", "Spb5")
ABILITY_SLF_BASE_ORDER_ID_ANS5 = field("abilitystringlevelfield", "Ans5")
ABILITY_RLF_TEST_DAMAGE = field("abilityreallevelfield", "Tst1")
ABILITY_BF_TEST_FLAG = field("abilitybooleanfield", "Tst2")
ABILITY_SF_TEST_NAME = field("abilitystringfield", "Tst3")
ABILITY_ILF_OTHER_TYPE = field("abilityintegerlevelfield", "Oth1") -- not a field of the tested type
NOT_A_FIELD_ABILITY_ = 5 -- must be skipped by the discovery

-- The object data: one ability type with the three test fields.
currentMap = { objects = { ability = { all = {
    Atst = { all = { "Tst1", "Tst2", "Tst3" }, aord = "test" },
    Aoth = { all = { "Oth1" }, aord = "other" },
} } } }

-- The game state behind the natives: per handle, plain values and values per level.
local function readField(handle, f) return handle.values[f.id] end
local function readLevelField(handle, f, level) return handle.levelValues[f.id][level] end
BlzGetAbilityBooleanField, BlzGetAbilityIntegerField = readField, readField
BlzGetAbilityRealField, BlzGetAbilityStringField = readField, readField
BlzGetAbilityBooleanLevelField, BlzGetAbilityIntegerLevelField = readLevelField, readLevelField
BlzGetAbilityRealLevelField, BlzGetAbilityStringLevelField = readLevelField, readLevelField
GetUnitAbilityLevel = function(unit) return unit.level + 1 end
local setLevelCalls, setCooldownCalls = {}, {}
SetUnitAbilityLevel = function(unit, typeId, level) setLevelCalls[#setLevelCalls + 1] = level - 1 end
BlzSetUnitAbilityCooldownRemaining = function(unit, typeId, value) setCooldownCalls[#setCooldownCalls + 1] = value end
BlzGetUnitAbilityCooldownRemaining = function() return 0 end

local capturedObjectFieldValues = {}
package.loaded["engine.object-field"] = { captureObjectFieldValues = function(instance, snapshot, level)
    capturedObjectFieldValues[#capturedObjectFieldValues + 1] =
        { instance = instance, snapshot = snapshot, level = level }
end }
package.loaded["engine.internal.item.ability"] = {
    abilityActionDummy = {},
    doAbilityAction = function(handle, action, ...) return action(handle, ...) end,
    doAbilityActionForceDummy = function(handle, owner, action, ...) return action(handle, ...) end,
    startItemCooldown = function() end,
}

local lualib = require("lualib_bundle")
local instanceOf = lualib.__TS__InstanceOf
local module = require("engine.internal.ability")
local Ability, UnitAbility, AbilitySnapshot = module.Ability, module.UnitAbility, module.AbilitySnapshot
local ItemAbility = module.ItemAbility

local unit = { id = 1, level = 1 }
local owner = { handle = unit, state = 1, removeAbility = function() end }
local handle = {
    id = 100,
    values = { [fourCC("alev")] = 3, [fourCC("Tst2")] = false, [fourCC("Tst3")] = "Bolt" },
    levelValues = { [fourCC("Tst1")] = { [0] = 50, 75, 100 }, [fourCC("Oth1")] = { [0] = 1, 2, 3 } },
}
local ability = lualib.__TS__New(UnitAbility, handle, fourCC("Atst"), owner)
assert(ability.level == 1)

local snapshot = ability:getSnapshot()

-- The capture: the level, the fields of the type as they were, `false` included, and the fields
-- kept by the fields themselves, which are captured for this level alone.
assert(snapshot.level == 1)
assert(snapshot.ability == ability)
assert(snapshot.typeId == fourCC("Atst"))
assert(snapshot.owner == owner and snapshot.unit == owner, "what and whose it was is captured too")
assert(snapshot.levelCount == 3, "the number of levels is the captured one")
assert(snapshot:hasField(ABILITY_RLF_TEST_DAMAGE) and not snapshot:hasField(ABILITY_ILF_OTHER_TYPE),
    "the fields of a snapshot are those of the type of the ability")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false)
assert(snapshot:getField(ABILITY_SF_TEST_NAME) == "Bolt")
assert(snapshot:getField(ABILITY_IF_LEVELS) == 3, "common fields are captured")
assert(#capturedObjectFieldValues == 1 and capturedObjectFieldValues[1].instance == ability
    and capturedObjectFieldValues[1].snapshot == snapshot
    and capturedObjectFieldValues[1].level == 1, "object fields are captured at the level")

unit.level = 2
handle.values[fourCC("alev")] = 4
handle.values[fourCC("Tst2")] = true
handle.values[fourCC("Tst3")] = "Storm Bolt"
handle.levelValues[fourCC("Tst1")][1] = 80
handle.levelValues[fourCC("Tst1")][2] = 120
assert(ability.level == 2 and ability:getField(ABILITY_RLF_TEST_DAMAGE) == 120, "the ability is live")
assert(snapshot.level == 1, "the level is the captured one")
assert(snapshot.levelCount == 3, "and so is the number of levels")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75, "level fields are read at the captured level")
-- The captured level is the only level a snapshot has: `getField` of one takes no level at all,
-- and whatever is passed to it from code that is not typed is ignored rather than read.
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE, 2) == 75, "a passed level is no level of its own")
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false, "a captured false does not fall through")
assert(snapshot:getField(ABILITY_SF_TEST_NAME) == "Bolt")
assert(snapshot:getField(ABILITY_ILF_OTHER_TYPE) == 2,
    "a field the type lacks is read from the ability, at the captured level")

-- A snapshot holds nothing of the live state of the ability.
assert(snapshot.handle == nil and snapshot.cooldownRemaining == nil)
assert(tostring(snapshot):find("#snapshot", 1, true), tostring(snapshot))
assert(tostring(snapshot):find(tostring(ability), 1, true))

-- A snapshot is read-only: what the ability was is not something that can be set, and there is
-- no setter of a field on it to reach at all, not even one that throws.
assert(snapshot.setField == nil, "a snapshot has no setter of a field")
assert(#setCooldownCalls == 0 and #setLevelCalls == 0, "nothing of the ability was ever set")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75, "the capture is untouched")

-- A snapshot is a snapshot, not an ability.
assert(instanceOf(snapshot, AbilitySnapshot))
assert(not instanceOf(snapshot, UnitAbility) and not instanceOf(snapshot, Ability))
assert(not instanceOf(ability, AbilitySnapshot))

-- Snapshots are independent of one another.
local later = ability:getSnapshot()
assert(later.level == 2 and later:getField(ABILITY_RLF_TEST_DAMAGE) == 120)
assert(later.levelCount == 4)
assert(snapshot.level == 1 and snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)

-- The snapshot outlives the ability.
ability:destroy()
assert(snapshot.level == 1 and snapshot.levelCount == 3)
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false and snapshot:getField(ABILITY_IF_LEVELS) == 3)
assert(snapshot.typeId == fourCC("Atst") and snapshot.ability == ability)
assert(snapshot.owner == owner and snapshot.unit == owner,
    "what and whose it was is still known once the ability is gone")
assert(snapshot:hasField(ABILITY_RLF_TEST_DAMAGE), "the fields of the type are known without it")

-- An ability of an item is of whoever holds the item, and an item changes hands: the unit a
-- snapshot is of is the one that held it when the snapshot was taken, not the one holding it by
-- the time the missile of the cast arrives.
local otherOwner = { handle = { id = 2, level = 1 }, state = 1, removeAbility = function() end }
local item = { handle = { id = 200 }, owner = owner }
local itemHandle = {
    id = 101,
    values = { [fourCC("alev")] = 1, [fourCC("Tst2")] = true, [fourCC("Tst3")] = "Charge" },
    levelValues = { [fourCC("Tst1")] = { [0] = 10, 20, 30 }, [fourCC("Oth1")] = { [0] = 1, 2, 3 } },
}
local itemAbility = lualib.__TS__New(ItemAbility, itemHandle, fourCC("Atst"), item)
assert(itemAbility.unit == owner, "an ability of an item is of the unit holding it")

local itemSnapshot = itemAbility:getSnapshot()
item.owner = otherOwner

assert(itemAbility.unit == otherOwner, "the ability is of whoever holds the item now")
assert(itemSnapshot.owner == item, "the snapshot is of the item it was of")
assert(itemSnapshot.unit == owner, "... and of the unit that held that item then")

print("ability-snapshot: ok")
