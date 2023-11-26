function Enum(baseEnum) {
    return new Proxy(baseEnum, {
        get(target, name) {
            if (!baseEnum.hasOwnProperty(name)) {
                throw new TypeError(`"${name}" 枚举值不存在!`)
            }
            return baseEnum[name]
        },
        set(target, name, value) {
            throw new TypeError('不能够添加枚举值!')
        }
    })
}

module.exports = { Enum }
