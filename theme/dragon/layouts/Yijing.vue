<template>
  <div id="bagua-wrapper">
    <!-- 插件页 -->
    <YijingPage v-if="$page.frontmatter.yijingPage" />
  </div>
</template>

<script>
import YijingPage from '@theme/components/YijingPage.vue'

export default {
  components: { YijingPage },

  data() {
    return {
    }
  }
}
</script>