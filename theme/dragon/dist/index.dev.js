"use strict";

var path = require('path');

var setFrontmatter = require('./node_utils/setFrontmatter');

var getSidebarData = require('./node_utils/getSidebarData');

var _require = require('./node_utils/handlePage'),
    createPage = _require.createPage,
    deletePage = _require.deletePage;

var chalk = require('chalk'); // 命令行打印美化


var yaml = require('js-yaml'); // yaml转js


var log = console.log; // md容器名

var CARD_LIST = 'cardList';
var CARD_IMG_LIST = 'cardImgList'; // siteConfig base 配置

var base = ''; // Theme API.

module.exports = function (options, ctx) {
  var sourceDir = ctx.sourceDir,
      themeConfig = ctx.themeConfig,
      siteConfig = ctx.siteConfig; // base路径

  base = siteConfig.base || ''; // 自动设置front matter

  setFrontmatter(sourceDir, themeConfig); // 自动生成结构化侧边栏

  var sidebar = themeConfig.sidebar;

  if (sidebar === 'structuring' || sidebar && sidebar.mode === 'structuring') {
    var collapsable = themeConfig.sidebar.collapsable === false ? false : true;
    var sidebarData = getSidebarData(sourceDir, collapsable);

    if (sidebarData) {
      themeConfig.sidebar = sidebarData;
      log(chalk.blue('tip ') + chalk.green('add sidebar data. 成功生成侧边栏数据。'));
    } else {
      themeConfig.sidebar = 'auto';
      log(chalk.yellow('warning: fail to add sidebar data, switch to "auto". 未能添加侧边栏数据，将切换为“auto”。'));
    }
  }
  
  // 分类页
  if (themeConfig.category !== false) {
    createPage(sourceDir, 'categoriesPage');
  } else {
    deletePage(sourceDir, 'categoriesPage');
  }

  // 标签页
  if (themeConfig.tag !== false) {
    createPage(sourceDir, 'tagsPage');
  } else {
    deletePage(sourceDir, 'tagsPage');
  }

  // 归档页
  if (themeConfig.archive !== false) {
    createPage(sourceDir, 'archivesPage');
  } else {
    deletePage(sourceDir, 'archivesPage');
  } 
  
  //插件页
  if (themeConfig.bagua !== false) {
    createPage(sourceDir, 'yijingPage');
  } else {
    deletePage(sourceDir, 'yijingPage');
  }
  
  // resolve algolia
  var isAlgoliaSearch = themeConfig.algolia || Object.keys(siteConfig.locales && themeConfig.locales || {}).some(function (base) {
    return themeConfig.locales[base].algolia;
  });
  var enableSmoothScroll = themeConfig.smoothScroll === true;
  return {
    alias: function alias() {
      return {
        '@AlgoliaSearchBox': isAlgoliaSearch ? path.resolve(__dirname, 'components/AlgoliaSearchBox.vue') : path.resolve(__dirname, 'noopModule.js')
      };
    },
    plugins: [['@vuepress/active-header-links', options.activeHeaderLinks], '@vuepress/search', '@vuepress/plugin-nprogress', ['smooth-scroll', enableSmoothScroll], ['container', {
      type: 'note',
      defaultTitle: {
        '/': '笔记',
        '/en/': 'NOTE'
      }
    }], ['container', {
      type: 'tip',
      defaultTitle: {
        '/': '提示',
        '/en/': 'TIP'
      }
    }], ['container', {
      type: 'warning',
      defaultTitle: {
        '/': '注意',
        '/en/': 'WARNING'
      }
    }], ['container', {
      type: 'danger',
      defaultTitle: {
        '/': '警告',
        '/en/': 'WARNING'
      }
    }], ['container', {
      type: 'right',
      defaultTitle: ''
    }], ['container', {
      type: 'theorem',
      before: function before(info) {
        return "<div class=\"custom-block theorem\"><p class=\"title\">".concat(info, "</p>");
      },
      after: '</div>'
    }], ['container', {
      type: 'details',
      before: function before(info) {
        return "<details class=\"custom-block details\">".concat(info ? "<summary>".concat(info, "</summary>") : '', "\n");
      },
      after: function after() {
        return '</details>\n';
      },
      defaultTitle: {
        '/': '点击查看',
        '/en/': 'DETAILS'
      }
    }], // 内容居中容器
    ['container', {
      type: 'center',
      before: function before(info) {
        return "<div class=\"center-container\">";
      },
      after: function after() {
        return '</div>';
      }
    }], // 卡片列表
    ['container', {
      type: CARD_LIST,
      render: function render(tokens, idx) {
        // tokens 是整个md文件的虚拟dom结构数组
        // idx 是tokens中':::' 所在的索引，而且是当前指定type的':::'，分别有开始和结束两次的idx
        // if (tokens[idx].nesting === 1) { // 开头的 ':::' 标记
        // } else { // 结束的 ':::' 标记
        // }
        // 注意：修改这里面的代码后需要在md文件保存一下才会重新执行渲染
        return renderCardList(tokens, idx, CARD_LIST);
      }
    }], // 图文卡片列表
    ['container', {
      type: CARD_IMG_LIST,
      render: function render(tokens, idx) {
        return renderCardList(tokens, idx, CARD_IMG_LIST);
      }
    }]]
  };
}; // 渲染md容器的卡片列表


function renderCardList(tokens, idx, type) {
  var END_TYPE = "container_".concat(type, "_close"),
      _tokens$idx = tokens[idx],
      nesting = _tokens$idx.nesting,
      info = _tokens$idx.info;

  if (nesting === 1) {
    // 渲染开头的 ':::' 标记
    var yamlStr = '';

    for (var i = idx; i < tokens.length; i++) {
      var _tokens$i = tokens[i],
          _type = _tokens$i.type,
          content = _tokens$i.content,
          _info = _tokens$i.info;
      if (_type === END_TYPE) break; // 遇到结束的 ':::' 时

      if (!content) continue;

      if (_type === 'fence' && _info === 'yaml') {
        // 是代码块类型，并且是yaml代码
        yamlStr = content;
      }
    }

    if (yamlStr) {
      // 正确解析出yaml字符串后
      var dataObj = yaml.safeLoad(yamlStr); // 将yaml字符串解析成js对象

      var dataList = [];
      var config = {};

      if (dataObj) {
        // 正确解析出数据对象
        if (Array.isArray(dataObj)) {
          dataList = dataObj;
        } else {
          config = dataObj.config;
          dataList = dataObj.data;
        }
      }

      if (dataList && dataList.length) {
        // 有列表数据
        // 每行显示几个
        var row = Number(info.split(' ').pop());

        if (!row || row > 4 || row < 1) {
          row = 3; // 默认 3
        }

        var listDOM = '';

        if (type === CARD_LIST) {
          // 普通卡片列表
          listDOM = getCardListDOM(dataList, row, config);
        } else if (type === CARD_IMG_LIST) {
          // 卡片图片列表
          listDOM = getCardImgListDOM(dataList, row, config);
        }

        return "<div class=\"".concat(type, "Container\"><div class=\"card-list\">").concat(listDOM, "</div>");
      }
    }
  } else {
    // 渲染':::' 结尾
    return '</div>';
  }
} // 将数据解析成DOM结构 - 普通卡片列表


function getCardListDOM(dataList, row, config) {
  var _config$target = config.target,
      target = _config$target === void 0 ? '_blank' : _config$target;
  var listDOM = '';
  dataList.forEach(function (item) {
    listDOM += "\n      <".concat(item.link ? 'a href="' + withBase(item.link) + '" target="' + target + '"' : 'span', " class=\"card-item ").concat(row ? 'row-' + row : '', "\"\n         style=\"").concat(item.bgColor ? 'background-color:' + item.bgColor + ';--randomColor:' + item.bgColor + ';' : '--randomColor: var(--bodyBg);').concat(item.textColor ? 'color:' + item.textColor + ';' : '', "\"\n      >\n        ").concat(item.avatar ? '<img src="' + withBase(item.avatar) + '" class="no-zoom">' : '', "\n        <div>\n          <p class=\"name\">").concat(item.name, "</p>\n          <p class=\"desc\">").concat(item.desc, "</p>\n        </div>\n      </").concat(item.link ? 'a' : 'span', ">\n    ");
  });
  return listDOM;
} // 将数据解析成DOM结构 - 图文卡片列表


function getCardImgListDOM(dataList, row, config) {
  var _config$imgHeight = config.imgHeight,
      imgHeight = _config$imgHeight === void 0 ? 'auto' : _config$imgHeight,
      _config$objectFit = config.objectFit,
      objectFit = _config$objectFit === void 0 ? 'cover' : _config$objectFit,
      _config$lineClamp = config.lineClamp,
      lineClamp = _config$lineClamp === void 0 ? 1 : _config$lineClamp,
      _config$target2 = config.target,
      target = _config$target2 === void 0 ? '_blank' : _config$target2;
  var listDOM = '';
  dataList.forEach(function (item) {
    listDOM += "\n      <div class=\"card-item ".concat(row ? 'row-' + row : '', "\" >\n        <a href=\"").concat(withBase(item.link), "\" target=\"").concat(target, "\">\n          <div class=\"box-img\" style=\"height: ").concat(imgHeight, "\">\n              <img src=\"").concat(withBase(item.img), "\" class=\"no-zoom\" style=\"object-fit: ").concat(objectFit, "\">\n          </div>\n          <div class=\"box-info\">\n              <p class=\"name\">").concat(item.name, "</p>\n              ").concat(item.desc ? "<p class=\"desc\" style=\"-webkit-line-clamp: ".concat(lineClamp, "\">").concat(item.desc, "</p>") : '', "\n          </div>\n\n          ").concat(item.avatar || item.author ? "<div class=\"box-footer\">\n              ".concat(item.avatar ? "<img src=\"".concat(withBase(item.avatar), "\" class=\"no-zoom\">") : '', "\n              ").concat(item.author ? "<span>".concat(item.author, "</span>") : '', "\n          </div>") : '', "\n        </a>\n      </div>\n    ");
  });
  return listDOM;
} // 添加base路径


function withBase(path) {
  if (!path) return '';

  if (base && path.charAt(0) === '/') {
    return base + path.slice(1);
  } else {
    return path;
  }
}