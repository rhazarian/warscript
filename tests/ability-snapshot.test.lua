-- Run after tstl: node_modules/.bin/warpack exec tests/ability-snapshot.test.lua
-- Tests the emitted Lua of AbilitySnapshot: a snapshot is a proxy table that holds the level
-- and the native field values of the ability as captured, and falls back to the ability for
-- everything else (reads and writes alike), so that it passes for the ability wherever the
-- ability is used, `instanceof` included.
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
package.loaded["engine.object-field"] = { captureObjectFieldValues = function(instance, snapshot)
    capturedObjectFieldValues[#capturedObjectFieldValues + 1] = { instance = instance, snapshot = snapshot }
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

-- The capture: level and fields of the type as they were, `false` included.
assert(snapshot.level == 1)
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false)
assert(snapshot:getField(ABILITY_SF_TEST_NAME) == "Bolt")
assert(snapshot:getField(ABILITY_IF_LEVELS) == 3, "common fields are captured")
assert(#capturedObjectFieldValues == 1 and capturedObjectFieldValues[1].instance == ability
    and capturedObjectFieldValues[1].snapshot == snapshot, "object fields are captured into the snapshot")

unit.level = 2
handle.values[fourCC("Tst2")] = true
handle.values[fourCC("Tst3")] = "Storm Bolt"
handle.levelValues[fourCC("Tst1")][1] = 80
handle.levelValues[fourCC("Tst1")][2] = 120
assert(ability.level == 2 and ability:getField(ABILITY_RLF_TEST_DAMAGE) == 120, "the ability is live")
assert(snapshot.level == 1, "the level is the captured one")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75, "level fields are read at the captured level")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE, 1) == 75, "... also when that level is passed")
assert(snapshot:getField(ABILITY_RLF_TEST_DAMAGE, 2) == 120, "other levels are read from the ability")
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false, "a captured false does not fall through")
assert(snapshot:getField(ABILITY_SF_TEST_NAME) == "Bolt")
assert(snapshot:getField(ABILITY_ILF_OTHER_TYPE) == 3, "fields the type lacks are read from the ability")

-- Everything else is the ability's.
assert(snapshot.ability == ability)
assert(snapshot.handle == handle)
assert(snapshot.typeId == fourCC("Atst"))
assert(snapshot.owner == owner, "plain fields fall through")
assert(snapshot.levelCount == 3, "getters fall through with the ability as `this`")
assert(snapshot:hasField(ABILITY_RLF_TEST_DAMAGE) and not snapshot:hasField(ABILITY_ILF_OTHER_TYPE))
assert(tostring(snapshot):find("#snapshot", 1, true), tostring(snapshot))
assert(tostring(snapshot):find(tostring(ability), 1, true))

-- Writes go to the ability: setters run there, and the captured level stays.
snapshot.cooldownRemaining = 5
assert(#setCooldownCalls == 1 and setCooldownCalls[1] == 5, "setters fall through")
snapshot.level = 0
assert(#setLevelCalls == 1 and setLevelCalls[1] == 0, "the level setter of the ability runs")
assert(rawget(snapshot, "level") == nil and snapshot.level == 1, "the captured level is untouched")

-- The snapshot passes for the ability, and is recognizable as a snapshot.
assert(instanceOf(snapshot, UnitAbility) and instanceOf(snapshot, Ability))
assert(instanceOf(snapshot, AbilitySnapshot))
assert(not instanceOf(ability, AbilitySnapshot))
assert(not instanceOf({}, AbilitySnapshot) and not instanceOf(5, AbilitySnapshot))

-- Snapshots are independent of one another.
local later = ability:getSnapshot()
assert(later.level == 2 and later:getField(ABILITY_RLF_TEST_DAMAGE) == 120)
assert(snapshot.level == 1 and snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)

-- The snapshot outlives the ability.
ability:destroy()
assert(snapshot.level == 1 and snapshot:getField(ABILITY_RLF_TEST_DAMAGE) == 75)
assert(snapshot:getField(ABILITY_BF_TEST_FLAG) == false and snapshot:getField(ABILITY_IF_LEVELS) == 3)
assert(snapshot.owner == owner and snapshot.typeId == fourCC("Atst") and snapshot.ability == ability)
assert(instanceOf(snapshot, UnitAbility) and instanceOf(snapshot, AbilitySnapshot))

print("ability-snapshot: ok")
