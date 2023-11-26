class SidebarManager {
    sourceDir
    themeConfig

    constructor(ctx) {
        this.sourceDir = ctx
        this.themeConfig = ctx
    }

    load() {
        // 自动设置front matter
        setFrontmatter(sourceDir, themeConfig)

        // 自动生成结构化侧边栏
        const sidebar = themeConfig.sidebar
        if (sidebar.mode === Sidebar.STRUCTURING) {
            const collapsable = themeConfig.sidebar.collapsable
            const sidebarData = side.create(sourceDir, collapsable)
            if (sidebarData) {
                themeConfig.sidebar = sidebarData
                log(chalk.blue('tip ') + chalk.green('成功生成侧边栏数据。'))
            } else {
                themeConfig.sidebar = 'auto'
                log(chalk.yellow('warning: 未能添加侧边栏数据，将切换为“auto”。'))
            }
        }
    }
}

module.exports = { SidebarManager };