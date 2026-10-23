-- Run after tstl: node_modules/.bin/warpack exec tests/object-field-snapshot.test.lua
-- Tests the emitted Lua of the capture of object field values: a field reads a snapshot of an
-- instance the way it reads the instance itself -- the values it keeps itself are captured for
-- the snapshot, at the one level the snapshot is of, and the values kept elsewhere are read back
-- through the fields of the snapshot.
package.path = "dist/?.lua;node_modules/typescript-to-lua/dist/lualib/universal/?.lua;" .. package.path

local function fourCC(id)
    local a, b, c, d = id:byte(1, 4)
    return ((a * 256 + b) * 256 + c) * 256 + d
end
_G.fourCC = fourCC
compiletime = function(callback) return callback() end
postcompile = function(callback) return callback() end
util = { id2s = function(id) return tostring(id) end }
warpack = { safeCall = function(callback, ...) return true, callback(...) end, compiletime = false }

local lualib = require("lualib_bundle")
local new, instanceOf = lualib.__TS__New, lualib.__TS__InstanceOf
local objectField = require("engine.object-field")

-- The object a field has values for: its own id, a value per level, and nothing else a field
-- needs. A snapshot of one is the same thing with the values as they were.
local Instance = lualib.__TS__Class()
Instance.name = "Instance"
function Instance.prototype.____constructor(self, typeId, valueByLevel)
    self.typeId = typeId
    self.valueByLevel = valueByLevel
    self.levelCount = 3
end
function Instance.prototype.getField(self, _, level)
    return self.valueByLevel[level]
end
function Instance.prototype.setField(self, _, level, value)
    self.valueByLevel[level] = value
    return true
end

-- A level field over those objects, as the ability level fields are over abilities.
local TestLevelField = lualib.__TS__Class()
TestLevelField.name = "TestLevelField"
lualib.__TS__ClassExtends(TestLevelField, objectField.ObjectLevelField)
TestLevelField.prototype.defaultValue = -1
TestLevelField.prototype.instanceClass = Instance
function TestLevelField.prototype.getNativeFieldById(_, id)
    return id
end
function TestLevelField.prototype.getObjectDataEntryId(_, instance)
    return instance.typeId
end
function TestLevelField.prototype.hasNativeFieldValue()
    return true
end
function TestLevelField.prototype.getLevelCount(_, entry)
    return entry.levelCount
end
function TestLevelField.prototype.getNativeFieldValue(self, instance, level)
    return instance:getField(self.nativeField, level)
end
function TestLevelField.prototype.setNativeFieldValue(self, instance, level, value)
    return instance:setField(self.nativeField, level, value)
end

local instance = new(Instance, fourCC("Inst"), { [0] = 10, 20, 30 })
local snapshot = new(Instance, fourCC("Inst"), { [0] = 10, 20, 30 })
assert(instanceOf(snapshot, Instance), "a field supports the snapshot as it does the instance")

-- === The values the field keeps itself ===

local keptField = new(TestLevelField, fourCC("Kep1"), true) -- global: the field keeps the values
keptField:setValue(instance, 1, 99)
assert(keptField:getValue(instance, 1) == 99)

objectField.captureObjectFieldValues(instance, snapshot, 1)

keptField:setValue(instance, 1, 7)
assert(keptField:getValue(instance, 1) == 7, "the instance is live")
assert(keptField:getValue(snapshot, 1) == 99, "the snapshot answers with what was captured")
assert(keptField:getValue(snapshot, 0) == -1 and keptField:getValue(snapshot, 2) == -1,
    "no level but the one the snapshot is of is captured")

-- === The values kept elsewhere ===
-- Nothing is captured for them; the field reads them through the fields of the snapshot, which
-- is what makes the snapshot of an ability answer for its native fields.

local nativeField = new(TestLevelField, fourCC("Nat1"), false)
objectField.captureObjectFieldValues(instance, snapshot, 1)
instance.valueByLevel[1] = 55
assert(nativeField:getValue(instance, 1) == 55, "the instance is live")
assert(nativeField:getValue(snapshot, 1) == 20, "the snapshot answers from its own fields")
assert(nativeField:getValue(snapshot, 2) == 30, "... for any level it holds the field of")

-- === An array field ===
-- An array is of indices rather than of levels, so a snapshot cannot answer for one itself: the
-- field captures the values of every index, the ones the game keeps itself included.

local TestArrayField = lualib.__TS__Class()
TestArrayField.name = "TestArrayField"
lualib.__TS__ClassExtends(TestArrayField, objectField.ObjectArrayField)
TestArrayField.prototype.defaultValue = ""
TestArrayField.prototype.instanceClass = Instance
function TestArrayField.prototype.getNativeFieldById(_, id)
    return id
end
function TestArrayField.prototype.getObjectDataEntryId(_, instance)
    return instance.typeId
end
function TestArrayField.prototype.hasNativeFieldValue()
    return true
end
function TestArrayField.prototype.getNativeFieldValue(_, instance, index)
    return instance.models[index] or ""
end
function TestArrayField.prototype.setNativeFieldValue(_, instance, index, value)
    instance.models[index] = value
    return true
end

instance.models = { [0] = "A", [1] = "B" }
snapshot.models = {}

local arrayField = new(TestArrayField, fourCC("Arr1"), false)
objectField.captureObjectFieldValues(instance, snapshot, 1)

instance.models[0] = "C"
assert(arrayField:getValue(instance, 0) == "C", "the instance is live")
assert(arrayField:getValue(snapshot, 0) == "A", "every index of the snapshot is captured")
assert(arrayField:getValue(snapshot, 1) == "B")
assert(arrayField:getValue(snapshot, 2) == "", "and nothing beyond them")
local values = arrayField:getValue(snapshot)
assert(#values == 2 and values[1] == "A" and values[2] == "B", "... as the array it was")

-- === The modifiers of a field ===
-- What is captured is the actual value: whatever the modifiers of the field make of the value
-- that was set. It is what the field answers for the ability itself, so it is what a buff of a
-- snapshot and a buff of the ability agree on.

local modifierSnapshot = new(Instance, fourCC("Inst"), { [0] = 10, 20, 30 })
local modifiedField = new(TestLevelField, fourCC("Mod1"), true) -- global: the field keeps the values
local modifier = function(_, _, value) return value * 2 end
modifiedField:setValue(instance, 1, 50)
modifiedField:applyModifier(instance, modifier)
assert(modifiedField:getValue(instance, 1) == 50, "the value that was set is the original one")
assert(modifiedField:getValue(instance, 1, true) == 100, "and the actual value is the modified one")

objectField.captureObjectFieldValues(instance, modifierSnapshot, 1)

modifiedField:removeModifier(instance, modifier)
assert(modifiedField:getValue(instance, 1, true) == 50, "the instance is back to what was set")
assert(modifiedField:getValue(modifierSnapshot, 1) == 100,
    "and the capture is of what the modifier made of it")

print("object-field-snapshot: ok")
