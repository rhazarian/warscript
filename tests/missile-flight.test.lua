-- Run after tstl: node_modules/.bin/warpack exec tests/missile-flight.test.lua
-- Tests the emitted Lua of the missile flight: the speed is in units per second, the model is
-- moved and pointed every tick, the arrival parameters are handed over as given (an omitted one
-- among them included), and retargeting from the arrival handler keeps the missile flying.
package.path = "dist/?.lua;node_modules/typescript-to-lua/dist/lualib/universal/?.lua;" .. package.path

local TERRAIN_Z = 100

warpack = { safeCall = function(callback, ...)
    local results = table.pack(pcall(callback, ...))
    if not results[1] then
        error(results[2], 0)
    end
    return table.unpack(results, 1, results.n)
end }

Location = function() return { x = 0, y = 0 } end
MoveLocation = function(location, x, y)
    location.x, location.y = x, y
end
GetLocationZ = function() return TERRAIN_Z end

-- The effect the missile shows: every move and turn is recorded.
local effects = {}
local function newEffect(modelPath)
    local effect = { modelPath = modelPath, positions = {}, yaws = {}, pitches = {} }
    effects[#effects + 1] = effect
    return effect
end
AddSpecialEffect = function(modelPath) return newEffect(modelPath) end
DestroyEffect = function(effect) effect.destroyed = true end
BlzSetSpecialEffectScale = function(effect, scale) effect.scale = scale end
BlzSetSpecialEffectColorByPlayer = function(effect, player) effect.player = player end
BlzSetSpecialEffectPosition = function(effect, x, y, z)
    effect.positions[#effect.positions + 1] = { x = x, y = y, z = z }
    effect.x, effect.y, effect.z = x, y, z
end
BlzSetSpecialEffectYaw = function(effect, yaw)
    effect.yaws[#effect.yaws + 1] = yaw
    effect.yaw = yaw
end
BlzSetSpecialEffectPitch = function(effect, pitch)
    effect.pitches[#effect.pitches + 1] = pitch
    effect.pitch = pitch
end

GetOwningPlayer = function(unit) return unit.player end
GetUnitX = function(unit) return unit.x end
GetUnitY = function(unit) return unit.y end
BlzGetUnitZ = function(unit) return TERRAIN_Z end
GetUnitFlyHeight = function(unit) return unit.flyHeight or 0 end
GetUnitFacing = function(unit) return unit.facing or 0 end
GetWidgetX = function(widget) return widget.x end
GetWidgetY = function(widget) return widget.y end

-- The handle state the missile checks a widget target against (HandleState.CREATED).
local CREATED, DESTROYED = 1, 3

local Unit = { prototype = {} }
Unit.prototype.__index = Unit.prototype
Unit.prototype.constructor = Unit
local function unit(x, y, parameters)
    parameters = parameters or {}
    local handle = { x = x, y = y, flyHeight = parameters.flyHeight, facing = parameters.facing,
        player = parameters.player or "player 1" }
    return setmetatable({ handle = handle, typeId = parameters.typeId or 1, state = CREATED,
        x = x, y = y }, Unit.prototype)
end

local Item = { prototype = {} }
Item.prototype.__index = Item.prototype
Item.prototype.constructor = Item
local function item(x, y)
    return setmetatable({ handle = { x = x, y = y }, state = CREATED, x = x, y = y }, Item.prototype)
end

local tick
package.loaded["core.types.timer"] = { Timer = { onPeriod = setmetatable({}, {
    __index = function(self, period)
        assert(period == 1 / 64, "the missile must be updated 64 times per second")
        local listeners = {}
        local event = { addListener = function(_, listener) listeners[#listeners + 1] = listener end }
        tick = function() for _, listener in ipairs(listeners) do listener() end end
        rawset(self, period, event)
        return event
    end,
}) } }
package.loaded["core.types.unit"] = { Unit = Unit }

local DEFAULTS = { impactOffsetZ = 60, launchOffsetX = 0, launchOffsetY = 0, launchOffsetZ = 60,
    launchVisualOffsetX = 0, launchVisualOffsetY = 0 }
-- Read as a map, which the emitted Lua indexes directly.
local missileDataByUnitTypeId = setmetatable({}, { __index = function() return DEFAULTS end })
package.loaded["engine.internal.unit-missile-data"] = {
    DEFAULT_MISSILE_IMPACT_OFFSET_Z = 60,
    MISSILE_DATA_BY_UNIT_TYPE_ID = missileDataByUnitTypeId,
}

local Missile = require("core.types.missile").Missile
assert(tick ~= nil, "the update is not registered at load")

local function ticksUntilArrival(missile, limit)
    for i = 1, limit or 1000 do
        if missile.isDestroyed then
            return i - 1
        end
        tick()
    end
    error("the missile never arrived")
end

-- === The speed is in units per second ===

local arrivals = {}
local function onArrival(missile, success, ...)
    arrivals[#arrivals + 1] = { missile = missile, success = success, parameters = table.pack(...) }
end

local config = { art = "missile.mdx", speed = 640 }
local missile = Missile.launch(Missile, config, 0, 0, 640, 0, onArrival)
local ticks = ticksUntilArrival(missile)
-- 640 units at 640 units per second is one second, which is 64 ticks.
assert(ticks == 64, "took " .. ticks .. " ticks")
assert(#arrivals == 1 and arrivals[1].success == true, "arrived unsuccessfully")
assert(arrivals[1].missile == missile)
assert(missile.isDestroyed, "the missile is not destroyed after the arrival")

local effect = effects[#effects]
assert(effect.modelPath == "missile.mdx")
assert(effect.destroyed, "the effect is not destroyed with the missile")
-- Placed at the launch point, then moved once per tick.
assert(#effect.positions == ticks + 1, "the model moved " .. #effect.positions .. " times")
assert(#effect.pitches == ticks + 1, "the model is pointed every tick")
assert(effect.x == 640 and effect.y == 0, "ended at " .. effect.x .. ", " .. effect.y)
assert(effect.z == TERRAIN_Z, "a point target without a Z lies on the ground")
assert(effect.positions[1].x == 0 and effect.positions[1].y == 0, "launched off the source")
assert(effect.positions[2].x > 0 and effect.positions[2].x < 640, "the first step is a step")
assert(effect.yaw == 0, "a missile flying east has a yaw of 0, not " .. tostring(effect.yaw))

-- Twice the speed takes half as long.
arrivals = {}
missile = Missile.launch(Missile, { art = "missile.mdx", speed = 1280 }, 0, 0, 640, 0, onArrival)
ticks = ticksUntilArrival(missile)
assert(ticks == 32, "took " .. ticks .. " ticks")

-- === The arrival parameters are handed over as given ===

arrivals = {}
missile = Missile.launch(Missile, config, 0, 0, 64, 0, onArrival, "first", nil, "third")
ticksUntilArrival(missile)
local parameters = arrivals[1].parameters
assert(parameters.n == 3, "the handler got " .. parameters.n .. " parameters, not 3")
assert(parameters[1] == "first" and parameters[2] == nil and parameters[3] == "third",
    "an omitted parameter must not cut the rest off")

-- === Widget targets ===

local targetUnit = unit(320, 0, { flyHeight = 150 })
arrivals = {}
missile = Missile.launch(Missile, config, 0, 0, targetUnit, onArrival)
ticksUntilArrival(missile)
assert(arrivals[1].success == true)
effect = effects[#effects]
assert(effect.x == 320 and effect.y == 0)
assert(effect.z == TERRAIN_Z + 150 + 60, "the impact height is the target's, got " .. effect.z)

-- A moving target is followed.
targetUnit = unit(320, 0)
arrivals = {}
missile = Missile.launch(Missile, config, 0, 0, targetUnit, onArrival)
tick()
targetUnit.handle.x, targetUnit.handle.y = 320, 320
ticksUntilArrival(missile)
effect = effects[#effects]
assert(effect.x == 320 and effect.y == 320, "ended at " .. effect.x .. ", " .. effect.y)

-- An item target is reached at the default impact height.
arrivals = {}
missile = Missile.launch(Missile, config, 0, 0, item(64, 0), onArrival)
ticksUntilArrival(missile)
assert(arrivals[1].success == true)
assert(effects[#effects].z == TERRAIN_Z + 60)

-- A target removed from the game in flight: the missile flies on, and arrives unsuccessfully.
targetUnit = unit(320, 0)
arrivals = {}
missile = Missile.launch(Missile, config, 0, 0, targetUnit, onArrival)
tick()
targetUnit.state = DESTROYED
ticksUntilArrival(missile)
assert(arrivals[1].success == false, "a removed target must arrive unsuccessfully")
assert(effects[#effects].x == 320, "the missile flies on to where the target was last seen")

-- === A unit source takes its launch offsets and its owner's color ===

missileDataByUnitTypeId[2] = setmetatable(
    { launchOffsetX = 50, launchOffsetY = 30, launchOffsetZ = 90 },
    { __index = DEFAULTS }
)
local function assertLaunchedAt(effect, x, y)
    local position = effect.positions[1]
    assert(math.abs(position.x - x) < 1e-6 and math.abs(position.y - y) < 1e-6,
        "launched at " .. position.x .. ", " .. position.y .. ", expected " .. x .. ", " .. y)
end

-- The launch offsets are in the unit's own frame: X to its right, Y forward.
local caster = unit(0, 0, { typeId = 2, facing = 90, player = "player 7" })
arrivals = {}
missile = Missile.launch(Missile, config, caster, 640, 0, onArrival)
effect = effects[#effects]
assert(effect.player == "player 7", "the missile takes the color of the source unit's owner")
assertLaunchedAt(effect, 50, 30) -- facing north: right is east, forward is north
assert(effect.positions[1].z == TERRAIN_Z + 90, "the launch height is the source's")
ticksUntilArrival(missile)

caster = unit(0, 0, { typeId = 2, facing = 0 })
missile = Missile.launch(Missile, config, caster, 640, 0, onArrival)
assertLaunchedAt(effects[#effects], 30, -50) -- facing east: forward is east, right is south
ticksUntilArrival(missile)

-- The visual launch offsets are not applied, as the engine does not apply them either.
missileDataByUnitTypeId[3] = setmetatable(
    { launchVisualOffsetX = 70, launchVisualOffsetY = 80 },
    { __index = DEFAULTS }
)
caster = unit(0, 0, { typeId = 3, facing = 0 })
missile = Missile.launch(Missile, config, caster, 640, 0, onArrival)
assertLaunchedAt(effects[#effects], 0, 0)
ticksUntilArrival(missile)

-- === Retargeting from the arrival handler keeps the missile flying (a bouncing missile) ===

local bounces = 0
local bounced
local function onBounce(m, success)
    bounces = bounces + 1
    if bounces < 3 then
        m.retarget(640 * bounces + 640, 0)
    else
        bounced = m
    end
end
missile = Missile.launch(Missile, config, 0, 0, 640, 0, onBounce)
for _ = 1, 400 do
    if missile.isDestroyed then break end
    tick()
end
assert(bounces == 3, "bounced " .. bounces .. " times, not 3")
assert(bounced == missile and missile.isDestroyed, "the missile outlived its last arrival")
assert(effects[#effects].x == 1920, "ended at " .. effects[#effects].x)

-- === Destroying a missile from another missile's handler keeps the update loop going ===

local other
missile = Missile.launch(Missile, config, 0, 0, 64, 0, function()
    other.destroy(other)
end)
other = Missile.launch(Missile, config, 0, 0, 128, 0, onArrival)
local third = Missile.launch(Missile, config, 0, 0, 192, 0, onArrival)
arrivals = {}
ticksUntilArrival(third, 200)
assert(other.isDestroyed, "the destroyed missile is gone")
assert(third.isDestroyed, "a missile after the destroyed one still arrives")
assert(#arrivals == 1 and arrivals[1].missile == third, "only the surviving missile arrived")

-- === A missile destroyed twice does not take the others with it ===

missile = Missile.launch(Missile, config, 0, 0, 64, 0, onArrival)
other = Missile.launch(Missile, config, 0, 0, 64, 0, onArrival)
missile.destroy(missile)
missile.destroy(missile)
arrivals = {}
ticksUntilArrival(other, 200)
assert(#arrivals == 1 and arrivals[1].missile == other)

print("missile-flight: ok")
