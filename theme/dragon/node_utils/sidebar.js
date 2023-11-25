const fs = require('fs'); // 文件模块
const paths = require('path'); // 路径模块
const chalk = require('chalk') // 命令行打印美化
const matter = require('gray-matter'); // front matter解析器
let log = console.log;

class DocFile {
    folder;
    filename;
    fullPath;
    isDir;
    order;
    title;
    extension;
    constructor(folder, filename) {
        this.folder = folder;
        this.filename = filename;
        //将路径或路径片段的序列解析为绝对路径
        this.fullPath = paths.resolve(folder, filename);
        const stat = fs.statSync(this.fullPath);
        this.isDir = stat.isDirectory();
        //文件信息
        const fileNameArr = filename.split('.')
        if (fileNameArr.length === 2) {
            this.order = parseInt(fileNameArr[0], 10);
            this.title = fileNameArr[1];
        } else {
            const firstDotIndex = filename.indexOf('.');
            const lastDotIndex = filename.lastIndexOf('.');
            this.order = parseInt(filename.substring(0, firstDotIndex), 10);
            if (this.isDir) {
                this.title = filename.substring(firstDotIndex + 1);
            } else {
                this.title = filename.substring(firstDotIndex + 1, lastDotIndex);
                this.extension = filename.substring(lastDotIndex + 1);
            }
        }
    }
    checkExtension() {
        const lastDotIndex = this.filename.lastIndexOf('.');
        if(this.extension !== "md") {
            log(chalk.yellow(`warning: 该文件 "${this.fullPath}" 非.md格式文件，不支持该文件类型`))
            return true;
        }
        return false;
    }
    checkOrder() {
        if (isNaN(this.order) || this.order < 0) {
            log(chalk.yellow(`warning: 该文件 "${this.fullPath}" 序号出错，请填写正确的序号`))
            return true;
        }
        return false;
    }
    checkExist(children) {
        // 判断序号是否已经存在
        let previous = children[this.title];
        if (!previous) {
            return false;
        }
        if(previous.order !== this.order) {
            log(chalk.yellow(`warning: 该文件 "${this.fullPath}" 的序号在同一级别中重复出现，将会被覆盖`))
            return false;
        }
        return true;
    }
}

class SidebarImpl {
    ignores = [".vuepress","@pages", "_posts"];
    folders = [];
    data = {docs: {},catalogue: {}};
    collapsable;

    create(root, collapsable) {
        this.collapsable = collapsable;
        this.filter(root);
        this.folders.forEach(name => {
            const file = new DocFile(root, name);
            const checkFail = file.checkOrder();
            if(checkFail) { return; }
            this.data.docs[file.title] = this.mapFolder(file);
        })
        return this.data
    }

    filter(root) {
        //读取目录 (包含文件夹和文件)
        const files = fs.readdirSync(root); 
        files.forEach(name => {
            //将路径或路径片段的序列解析为绝对路径
            const file = paths.resolve(root, name);
            // 是否为文件夹目录，并排除.vuepress文件夹
            if (!this.ignores.includes(name) && fs.statSync(file).isDirectory()) {
                this.folders.push(name);
            }
        })
    }
    
    mapFolder(file) {
        if (file.isDir) {
            let result = this.mapFolders(file);
            result.keys = Object.keys(result)
            result.order = file.order;
            result.title = file.title;
            result.collapsable = this.collapsable;
            return result;
        }
        return this.mapFile(file);
    }

    mapFolders(file) {
        //结构化文章侧边栏数据
        let result = {};
        //读取目录（文件和文件夹）
        const files = fs.readdirSync(file.fullPath);
        files.forEach(filename => {
            const tmpFile = new DocFile(file.fullPath, filename);
            if(tmpFile.checkOrder()) {
                return;
            }
            if(tmpFile.checkExist(result)) {
                let target = result[tmpFile.title];
                Object.assign(target, this.mapFolder(tmpFile));
            }else {
                result[tmpFile.title] = this.mapFolder(tmpFile);
            }
        });
        if (!files.length) {
            log(chalk.yellow(`warning: 该目录 "${file.fullPath}" 内部没有任何文件或文件序号出错，将忽略生成对应侧边栏`))
            return;
        }
        return result;
    }

    /**
     * 
     * @param DocFile file 
     * @returns 
     */
    mapFile(file) {
        if (file.checkExtension()) {
            return;
        }
        //读取md文件内容，返回字符串
        const contentStr = fs.readFileSync(file.fullPath, 'utf8')
        //解析出front matter数据
        const { data } = matter(contentStr, {})
        const { permalink = '', titleTag = '' } = data || {}

        // 目录页对应的永久链接，用于给面包屑提供链接
        const { pageComponent } = data
        if (pageComponent && pageComponent.name === "Catalogue") {
            this.data.catalogue[file.title] = permalink
        }
        const item = {};
        item.name = "prefix" + file.filename;
        item.title = data.title ? data.title : file.title;
        item.link = permalink;
        item.order = file.order;
        if (titleTag) { item.tag = titleTag; }
        //[<路径>, <标题>, <永久链接>, <?标题标签>]
        return item;
    }
}
let sidebar = new SidebarImpl();
module.exports = sidebar;