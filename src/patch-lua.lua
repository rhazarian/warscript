local getmetatable = _G.getmetatable
local ipairs = _G.ipairs

_G.ipairs = function(t)
    local metatable = getmetatable(t)
    if metatable and metatable.__ipairs then
        return metatable.__ipairs(t)
    end
    return ipairs(t)
end
