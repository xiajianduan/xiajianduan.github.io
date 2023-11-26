const { Enum } = require('./util/proxy')

const Sidebar = Enum({
    STRUCTURING: 'structuring',
    AUTO: 'auto'
})

module.exports = { Sidebar }