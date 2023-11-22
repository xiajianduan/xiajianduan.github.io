<template>
  <div id="taichi">
      <div v-for="index in 6" :key="index" class="tu-taichi"/>
    </div>
</template>

<script>
export default {
  name: 'TaiChi',
  props: {
    bgColor: {
      type: String,
      default: "red"
    }
  }
}
</script>

<style lang="stylus" src="@theme/styles/tai-chi.styl"/>