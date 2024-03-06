local setmetatable = setmetatable
local getmetatable = getmetatable
local sqrt = math.sqrt
local max = math.max
local min = math.min
local floor = math.floor
local ceil = math.ceil
local acos = math.acos
local atan = math.atan
local sin = math.sin
local cos = math.cos
local deg = math.deg
local rad = math.rad
local abs = math.abs

local location = Location and Location(0, 0)
local moveLocation = MoveLocation
local getLocationZ = GetLocationZ

local vec2 = {}

local mt = {}

local function new(x, y)
    return setmetatable({x = x, y = y}, mt)
end

function mt.__eq(a, b)
    return getmetatable(a) == mt and getmetatable(b) == mt and a.x == b.x and a.y == b.y
end

function mt.__unm(v)
    return new(-v.x, -v.y)
end

function mt.__add(a, b)
    return new(a.x + b.x, a.y + b.y)
end

function mt.__sub(a, b)
    return new(a.x - b.x, a.y - b.y)
end

function mt.__mul(a, b)
    return new(a.x * b, a.y * b)
end

function mt.__div(a, b)
    return new(a.x / b, a.y / b)
end

function mt.__tostring(v)
    return 'vec2('..v.x..', '..v.y..')'
end

function mt.__compiletime(v)
    return '_G.vec2('..v.x..', '..v.y..')'
end

function vec2.terrainZ(v)
    moveLocation(location, v.x, v.y)
    return getLocationZ(location)
end

function vec2.equals(a, b, eps)
    eps = eps or 1e-5
    return abs(b.x - a.x) <= eps and abs(b.y - a.y) <= eps
end

function vec2.magnitude(v)
    return sqrt(v.x * v.x + v.y * v.y)
end

function vec2.angle(a, b)
    return deg(atan(b.y - a.y, b.x - a.x))
    --local denominator = sqrt((a.x * a.x + a.y * a.y) * (b.x * b.x + b.y * b.y))
    --if denominator < 1e-15 then
    --    return 0
    --end
    --return deg(acos(min(max((a.x * b.x + a.y * b.y) / denominator, -1), 1)))
end

function vec2.distance(a, b)
    local dx = b.x - a.x
    local dy = b.y - a.y
    return sqrt(dx * dx + dy * dy)
end

function vec2.dot(a, b)
    return (a.x * b.x) + (a.y * b.y)
end

function vec2.lerp(a, b, t)
    return new(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
end

function vec2.max(a, b)
    return new(max(a.x, b.x), max(a.y, b.y))
end

function vec2.min(a, b)
    return new(min(a.x, b.x), min(a.y, b.y))
end

function vec2.floor(v)
    return new(floor(v.x), floor(v.y))
end

function vec2.ceil(v)
    return new(ceil(v.x), ceil(v.y))
end

function vec2.moveTowards(a, b, dist)
    local dx = b.x - a.x
    local dy = b.y - a.y

    local d = sqrt(dx * dx + dy * dy)

    return d ~= 0 and new(a.x + dx / d * dist, a.y + dy / d * dist) or new(a.x + dist, a.y)
end

function vec2.polarOffset(v, angle, dist)
    angle = rad(angle)
    return new(v.x + cos(angle) * dist, v.y + sin(angle) * dist)
end

function vec2.rotate(v, angle)
    angle = rad(angle)
    local s = sin(angle)
    local c = cos(angle)
    return new(c * v.x - s * v.y, s * v.x + c * v.y)
end

function vec2.perpendicular(v)
    return new(-v.y, v.x)
end

function vec2.reflect(v, n)
    local f = -2 * ((n.x * v.x) + (n.y * v.y))
    return new(f * n.x + v.x, f * n.y + v.y)
end

function vec2.scale(a, b)
    return new(a.x * b.x, a.y * b.y)
end

function vec2.copy(v)
    return new(v.x, v.y)
end

function vec2.withZ(v, z)
    return vec3(v.x, v.y, z)
end

function vec2.withTerrainZ(v, z)
    moveLocation(location, v.x, v.y)
    return vec3(v.x, v.y, getLocationZ(location) + (z or 0))
end

vec2.zero = new(0, 0)
vec2.one = new(1, 1)
vec2.up = new(0, 1)
vec2.down = new(0, -1)
vec2.left = new(-1, 0)
vec2.right = new(1, 0)
vec2.maxinteger = new(math.maxinteger, math.maxinteger)
vec2.mininteger = new(math.mininteger, math.mininteger)

_G.vec2 = setmetatable(vec2, { __call = function(_, x, y) return new(x or 0, y or 0) end })
