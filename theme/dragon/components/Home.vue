<template>
  <div class="home-wrapper">
    <!-- banner块 s -->
    <div
      class="banner"
      :class="{ 'hide-banner': !showBanner }"
      :style="bannerBgStyle"
    >
      <div
        class="banner-conent"
        :style="
          !homeData.features && !homeData.heroImage && `padding-top: 7rem`
        "
      >
        <header class="hero">
          <img
            v-if="homeData.heroImage"
            :src="$withBase(homeData.heroImage)"
            :alt="homeData.heroAlt"
          />
          <h1 v-if="homeData.heroText" id="main-title">
            {{ homeData.heroText }}
          </h1>
          <p v-if="homeData.tagline" class="description">
            {{ homeData.tagline }}
          </p>
          <p class="action" v-if="homeData.actionText && homeData.actionLink">
            <NavLink class="action-button" :item="actionLink" />
          </p>
        </header>

        <!-- PC端features块 s -->
        <div class="features" v-if="hasFeatures && !isMQMobile">
          <div
            class="feature"
            v-for="(feature, index) in homeData.features"
            :key="index"
          >
            <router-link v-if="feature.link" :to="feature.link">
              <img
                class="feature-img"
                v-if="feature.imgUrl"
                :src="$withBase(feature.imgUrl)"
                :alt="feature.title"
              />
              <p>{{ feature.title }}</p>
            </router-link>
            <a v-else href="javascript:;">
              <img
                class="feature-img"
                v-if="feature.imgUrl"
                :src="$withBase(feature.imgUrl)"
                :alt="feature.title"
              />
              <p>{{ feature.title }}</p>
            </a>
          </div>
        </div>
        <!-- PC端features块 e -->
      </div>

      <!-- 移动端features块 s -->
      <!-- isMQMobile放到v-if上线后会报错 -->
      <div class="slide-banner" v-if="hasFeatures" v-show="isMQMobile">
        <div class="banner-wrapper">
          <div class="slide-banner-scroll" ref="slide">
            <div class="slide-banner-wrapper">
              <div
                class="slide-item"
                v-for="(feature, index) in homeData.features"
                :key="index"
              >
                <router-link v-if="feature.link" :to="feature.link">
                  <img
                    class="feature-img"
                    v-if="feature.imgUrl"
                    :src="$withBase(feature.imgUrl)"
                    :alt="feature.title"
                  />
                  <p>{{ feature.title }}</p>
                </router-link>
                <a v-else href="javascript:;">
                  <img
                    class="feature-img"
                    v-if="feature.imgUrl"
                    :src="$withBase(feature.imgUrl)"
                    :alt="feature.title"
                  />
                  <p>{{ feature.title }}</p>
                </a>
              </div>
            </div>
          </div>
          <div class="docs-wrapper">
            <span
              class="doc"
              v-for="(item, index) in homeData.features.length"
              :key="index"
              :class="{ active: currentPageIndex === index }"
            ></span>
          </div>
        </div>
      </div>
      <!-- 移动端features块 e -->
    </div>
    <!-- banner块 e -->

    <MainLayout>
      <template #mainLeft>
        <!-- 简约版文章列表 -->
        <UpdateArticle
          class="card-box"
          v-if="homeData.postList === 'simple'"
          :length="homeData.simplePostListLength || 10"
          :moreArticle="
            $themeConfig.updateBar && $themeConfig.updateBar.moreArticle
          "
        />

        <!-- 详情版文章列表 -->
        <template
          v-else-if="!homeData.postList || homeData.postList === 'detailed'"
        >
          <PostList :currentPage="currentPage" :perPage="perPage" />
          <Pagination
            :total="total"
            :perPage="perPage"
            :currentPage="currentPage"
            @getCurrentPage="handlePagination"
            v-show="Math.ceil(total / perPage) > 1"
          />
        </template>

        <Content class="theme-vdoing-content custom card-box" />
      </template>

      <template v-if="!homeData.hideRightBar" #mainRight>
        <BloggerBar v-if="$themeConfig.blogger" />
        <CategoriesBar
          v-if="
            $themeConfig.category !== false &&
            $categoriesAndTags.categories.length
          "
          :categoriesData="$categoriesAndTags.categories"
          :length="10"
        />
        <TagsBar
          v-if="$themeConfig.tag !== false && $categoriesAndTags.tags.length"
          :tagsData="$categoriesAndTags.tags"
          :length="30"
        />
        <div
          class="custom-html-box card-box"
          v-if="homeSidebarB"
          v-html="homeSidebarB"
        ></div>
      </template>
    </MainLayout>
  </div>
</template>

<script>

import '../styles/home.styl'

import NavLink from "@theme/components/NavLink";
import BScroll from "@better-scroll/core"
import Slide from "@better-scroll/slide"
import MainLayout from '@theme/components/MainLayout'
import PostList from '@theme/components/PostList'
import UpdateArticle from '@theme/components/UpdateArticle'
import Pagination from '@theme/components/Pagination'
import BloggerBar from '@theme/components/BloggerBar'
import CategoriesBar from '@theme/components/CategoriesBar'
import TagsBar from '@theme/components/TagsBar'

const MOBILE_DESKTOP_BREAKPOINT = 720 // refer to config.styl

BScroll.use(Slide)

export default {
  data() {
    return {
      isMQMobile: false,

      slide: null,
      currentPageIndex: 0,
      playTimer: 0,
      mark: 0,

      total: 0, // 总长
      perPage: 10, // 每页长
      currentPage: 1// 当前页
    }
  },
  computed: {
    homeData() {
      return {
        ...this.$page.frontmatter
      }
    },
    hasFeatures() {
      return !!(this.homeData.features && this.homeData.features.length)
    },
    homeSidebarB() {
      const { htmlModules } = this.$themeConfig
      return htmlModules ? htmlModules.homeSidebarB : ''
    },
    showBanner() { // 当分页不在第一页时隐藏banner栏
      return this.$route.query.p
        && this.$route.query.p != 1
        && (!this.homeData.postList || this.homeData.postList === 'detailed')
        ? false : true
    },
    bannerBgStyle() {
      let bannerBg = this.homeData.bannerBg
      if (!bannerBg || bannerBg === 'auto') { // 默认
        if (this.$themeConfig.bodyBgImg) { // 当有bodyBgImg时，不显示背景
          return ''
        } else { // 网格纹背景
          return 'background: rgb(40,40,45) url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABOSURBVFhH7c6xCQAgDAVRR9A6E4hLu4uLiWJ7tSnuQcIvr2TRYsw3/zOGGEOMIcYQY4gxxBhiDDGGGEOMIcYQY4gxxBhiDLkx52W4Gn1tuslCtHJvL54AAAAASUVORK5CYII=)'
        }
      } else if (bannerBg === 'none') { // 无背景
        if (this.$themeConfig.bodyBgImg) {
          return ''
        } else {
          return 'background: var(--mainBg);color: var(--textColor)'
        }
      } else if (bannerBg.indexOf('background:') > -1) { // 自定义背景样式
        return bannerBg
      } else if (bannerBg.indexOf('.') > -1) { // 大图
        return `background: url(${this.$withBase(bannerBg)}) center center / cover no-repeat`
      }

    },
    actionLink() {
      return {
        link: this.homeData.actionLink,
        text: this.homeData.actionText
      };
    }
  },
  components: { NavLink, MainLayout, PostList, UpdateArticle, BloggerBar, CategoriesBar, TagsBar, Pagination },
  created() {
    this.total = this.$sortPosts.length
  },
  beforeMount() {
    this.isMQMobile = window.innerWidth < MOBILE_DESKTOP_BREAKPOINT ? true : false; // vupress在打包时不能在beforeCreate(),created()访问浏览器api（如window）
  },
  mounted() {
    if (this.$route.query.p) {
      this.currentPage = Number(this.$route.query.p)
    }

    if (this.hasFeatures && this.isMQMobile && (!this.$route.query.p || this.$route.query.p == 1)) {
      this.init()
    }

    if (this.hasFeatures) {
      window.addEventListener('resize', () => {
        this.isMQMobile = window.innerWidth < MOBILE_DESKTOP_BREAKPOINT ? true : false;
        if (this.isMQMobile && !this.slide && !this.mark) {
          this.mark++
          setTimeout(() => {
            this.init()
          }, 60)
        }
      })
    }
  },
  beforeDestroy() {
    clearTimeout(this.playTimer)
    this.slide && this.slide.destroy()
  },
  watch: {
    '$route.query.p'() {
      if (!this.$route.query.p) {
        this.currentPage = 1
      } else {
        this.currentPage = Number(this.$route.query.p)
      }

      if (this.hasFeatures && this.currentPage === 1 && this.isMQMobile) {
        setTimeout(() => {
          this.slide && this.slide.destroy()
          this.init()
        }, 0)
      }
    }
  },
  methods: {
    init() {
      clearTimeout(this.playTimer)
      this.slide = new BScroll(this.$refs.slide, {
        scrollX: true, // x轴滚动
        scrollY: false, // y轴滚动
        slide: {
          loop: true,
          threshold: 100
        },
        useTransition: true, // 使用css3 transition动画
        momentum: false,
        bounce: false, // 回弹
        stopPropagation: false, // 是否阻止事件冒泡
        probeType: 2,
        preventDefault: false
      })

      // user touches the slide area
      this.slide.on('beforeScrollStart', () => {
        clearTimeout(this.playTimer)
      })
      // user touched the slide done
      this.slide.on('scrollEnd', () => {
        this.autoGoNext()
      })
      this.slide.on('slideWillChange', (page) => {
        this.currentPageIndex = page.pageX
      })
      this.autoGoNext()
    },
    autoGoNext() {
      clearTimeout(this.playTimer)
      this.playTimer = setTimeout(() => {
        this.slide.next()
      }, 4000)
    },
    handlePagination(i) { // 分页
      this.currentPage = i
    },
    getScrollTop() {
      return window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop
    },
  },

};
</script>