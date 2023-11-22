<template>
  <div id="bagua-wrapper" class="custom-page">
    <div class="bagua-title" :style="displayTitle">
      <div v-for="item in names" :key="item.key" class="tu-title tu-self"
      @click="show(item.key)">本：{{item.display }}</div>
    </div>
    <div class="bagua-title" :style="displayTitle">
      <div v-for="item in names" :key="item.key" class="tu-title tu-zong"
      @click="show(item.zong)">综：{{ titles[item.zong].display }}</div>
    </div>
    <div class="bagua-title" :style="displayTitle">
      <div v-for="item in names" :key="item.key" class="tu-title tu-mix"
      @click="show(item.mix)">错：{{ titles[item.mix].display }}</div>
    </div>
    <div class="bagua-title" :style="displayTitle">
      <div v-for="item in names" :key="item.key" class="tu-title tu-hg"
      @click="show(item.hg)">互：{{ titles[item.hg].display }}</div>
    </div>
    <div id="bagua-outer">
      <div v-for="index in gua.cs" :key="index" class="tu-outer">{{index}}</div>
    </div>
    <div id="bagua-inner" :style="animationState" @click="play($event)">
      <div v-for="index in gua.cs" :key="index" class="tu-inner">{{index}}</div>
      <tai-chi/>
    </div>
    <div id="bagua-detail" :style="displayDetail">{{ detail }}</div>
  </div>
</template>

<script>
import TaiChi from './TaiChi.vue';
import data from '@theme/assets/yi-jing.json'

export default {
  components: {
      TaiChi
  },
  data () {
    return {
      pauseState: true,
      animationState: '',
      displayTitle: '',
      displayDetail: '',
      content: '',
      names: [],
      gua:{
        nn: '乾兑离震巽坎艮坤',
        cn: '乾兑离震坤艮坎巽',
        cs: '☰☱☲☳☷☶☵☴',//9776
      },
      titles:{},
      detail:'',
      previousKey:'',
      showState: false
    }
  },
  methods: {
    play(e) {
      if(this.pauseState) {
        this.pauseState = false;
        this.animationState = "animation-play-state:paused";
        this.displayTitle = "display: block;";
      }else {
        this.pauseState = true;
        this.animationState = "animation-play-state:running";
        this.displayTitle = "display: none";
        this.displayDetail = "display: none";
      }
      this.setData(e);
    },
    setData(e) {
      const transform = getComputedStyle(e.currentTarget).transform // 获取 transform 样式
      const matrix = transform.match(/^matrix\((.+)\)$/)[1].split(",") // 解析获取 matrix 值
      const angle = Math.round(Math.atan2(matrix[1], matrix[0]) * (180 / Math.PI)) // 计算旋转角度
      let id = Math.round(angle/45)
      
      for(let i=0; i<8; i++) {
        let key = this.gua.cn[i]+"上"+ this.gua.cn[(8 + i + id)%8] +"下";
        this.names[i] = this.titles[key];
      }
    },
    show(key) {
      if(this.previousKey === key && this.showState) {
        this.displayDetail = "display: none";
      }else {
        this.displayDetail = "display: block";
        let obj = this.titles[key];
        this.detail = obj.text;
      }
      this.showState = !this.showState;
      this.previousKey = key;
    },
    fetchData() {
      for(let obj of data.content) {
        let names = obj.title.match("【(.+) (.+)】(.*)（((.).(.).)）");
        obj.name = names[1]
        obj.seq = names[2]
        obj.memo = names[3]
        obj.key = names[4];
        obj.up = names[5];
        obj.down = names[6];
        obj.self = String.fromCharCode(19903 + obj.num);
        obj.display = obj.memo + " " + obj.seq;
        //String.fromCharCode(parseInt(this.gua.n.valueOf(obj.down)) ^ 7 + 9776);
        let mx = this.gua.nn[this.gua.nn.indexOf(obj.up)^7]
        let md = this.gua.nn[this.gua.nn.indexOf(obj.down)^7]
        obj.mix = mx + "上"+ md +"下";
        obj.cross = obj.down + "上"+ obj.up +"下";
        let zu = this.gua.nn[parseInt(this.gua.nn.indexOf(obj.up).toString(2).padStart(3,'0').split('').reverse().join(''),2)];
        let zd = this.gua.nn[parseInt(this.gua.nn.indexOf(obj.down).toString(2).padStart(3,'0').split('').reverse().join(''),2)];
        obj.zong = zd + "上"+ zu +"下";
        obj.hu = this.gua.nn[(this.gua.nn.indexOf(obj.up) >> 1) + (this.gua.nn.indexOf(obj.down)%2<<2)];
        obj.hd = this.gua.nn[(this.gua.nn.indexOf(obj.up) >> 2) + (this.gua.nn.indexOf(obj.down)%4<<1)];
        obj.hg = obj.hu + "上"+ obj.hd +"下";
        this.titles[obj.key] = obj;
      }
    }
  },
  mounted() {
    this.fetchData();
  },
}
</script>

<style lang="stylus" src="@theme/styles/yi-jing.styl"/>