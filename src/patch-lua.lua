local error = _G.error
local getmetatable = _G.getmetatable
local ipairs = _G.ipairs
local select = _G.select
local tostring = _G.tostring
local tableconcat = table.concat

_G.ipairs = function(t)
    local metatable = getmetatable(t)
    if metatable and metatable.__ipairs then
        return metatable.__ipairs(t)
    end
    return ipairs(t)
end

_G.assert = function(v, ...)
    if not v then
        local args = {}
        for i = 1, select("#", ...) do
            args[i] = tostring(select(i, ...))
        end
        error(tableconcat(args, " "))
    end
    return v, ...
end
