local setmetatable = setmetatable
local getmetatable = getmetatable
local sqrt = math.sqrt
local max = math.max
local min = math.min
local floor = math.floor
local ceil = math.ceil
local acos = math.acos
local atan = math.atan
local deg = math.deg

local vec3 = {}

local mt = {}

local function new(x, y, z)
    return setmetatable({x = x, y = y, z = z}, mt)
end

function mt.__eq(a, b)
    return getmetatable(a) == mt and getmetatable(b) == mt and a.x == b.x and a.y == b.y and a.z == a.z
end

function mt.__unm(v)
    return new(-v.x, -v.y, -v.z)
end

function mt.__add(a, b)
    return new(a.x + b.x, a.y + b.y, a.z + b.z)
end

function mt.__sub(a, b)
    return new(a.x - b.x, a.y - b.y, a.z - b.z)
end

function mt.__mul(a, b)
    return new(a.x * b, a.y * b, a.z * b)
end

function mt.__div(a, b)
    return new(a.x / b, a.y / b, a.z / b)
end

function mt.__tostring(v)
    return 'vec3('..v.x..', '..v.y..', '..v.z..')'
end

function mt.__compiletime(v)
    return '_G.vec3('..v.x..', '..v.y..','..v.z..')'
end

function vec3.magnitude(v)
    return sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
end

function vec3.angles(a, b)
    local dx = b.x - a.x
    local dy = b.y - a.y
    local dz = b.z - a.z
    return deg(atan(dy, dx)), deg(atan(dz, sqrt(dx * dx + dy * dy)))
end

function vec3.distance(a, b)
    local dx = b.x - a.x
    local dy = b.y - a.y
    local dz = b.z - a.z
    return sqrt(dx * dx + dy * dy + dz * dz)
end

function vec3.max(a, b)
    return new(max(a.x, b.x), max(a.y, b.y), max(a.z, b.z))
end

function vec3.min(a, b)
    return new(min(a.x, b.x), min(a.y, b.y), min(a.z, b.z))
end

function vec3.floor(v)
    return new(floor(v.x), floor(v.y), floor(v.z))
end

function vec3.ceil(v)
    return new(ceil(v.x), ceil(v.y), ceil(v.z))
end

function vec3.moveTowards(a, b, dist)
    local dx = b.x - a.x
    local dy = b.y - a.y
    local dz = b.z - a.z

    local d = sqrt(dx * dx + dy * dy + dz * dz)

    return d ~= 0 and new(a.x + dx / d * dist, a.y + dy / d * dist, a.z + dz / d * dist) or new(a.x + dist, a.y, a.z)
end

function vec3.scale(a, b)
    return new(a.x * b.x, a.y * b.y, a.z * b.z)
end

vec3.zero = new(0, 0, 0)

_G.vec3 = setmetatable(vec3, { __call = function(_, x, y, z) return new(x or 0, y or 0, z or 0) end })
