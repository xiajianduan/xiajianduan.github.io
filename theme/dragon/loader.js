const { SidebarManager } = require('./manager/sidebarManager')
const { FormatManager } = require('./manager/formatManager')

class Loader {

    sidebarManager
    formatManager

    init(ctx) {
        this.create(ctx)
        // this.load()
    }

    create(ctx) {
        this.sidebarManager = new SidebarManager(ctx)
        this.formatManager = new FormatManager(ctx)
    }

    load() {
        this.sidebarManager.load()
        this.formatManager.load()
    }
}

let loader = new Loader();
module.exports = loader