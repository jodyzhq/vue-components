/*
 * @Author: zhanghongqia 
 * @email: 991034150@qq.com 
 * @Date: 2018-06-08 21:31:55 
 * @Description: 首页入口组件
 * @Last Modified by: zhanghongqiao
 * @Last Modified time: 2019-03-14 06:57:51
 */

<style lang="scss" >
.home-container {
  padding: 20px;
  float: left;
  width: 100%;
  .item {
    width: 100%;
    float: left;
    margin-bottom: 20px;
    p.h2-title {
      width: 100%;
      font-size: 15px;
      color: #666;
      padding-bottom: 20px;
    }
    .list {
      width: 100%;
      height: 100%;
      li {
        width: 18%;
        height: 200px;
        background: #fff;
        box-shadow: 0 2px 5px #ccc;
        margin-right: 20px;
        float: left;
        padding: 10px;
        cursor: pointer;
        .name {
          float: left;
          width: 100%;
          text-align: center;
        }
        img {
          width: 100%;
          height: 160px;
          margin-bottom: 5px;
        }
      }
      
    }
  }
}

.wave-chart {
  width: 300px;
  height: 300px;
}
.count-chart {
   width: 600px;
  height: 300px;
}
.air-quality-layout {
  width: 490px;
}
.el-dialog__body {
  height: 460px;
}
.render-chart {
  margin: 0 auto;
  width: 90%;
  height: 75%;
}
 
</style>

<template>
  <div class="home-container">
    <svg>
      <defs>
         <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: #F93148; stop-opacity: 1"/>
          <stop offset="0.5" style="stop-color: #FFDF02; stop-opacity: 1"/>
          <stop offset="1" style="stop-color: #77E750; stop-opacity: 1"/>
        </linearGradient>
      </defs>
    </svg>
    <TimeChart :sourceData="areaData" />
    <div class="item" v-for="item in chartJson" :key="item.key">
      <p class="h2-title">{{item.typeName}}</p>
      <ul class="list">
        <li v-for="sub in item.child"
          @click="handleChart(sub)" 
          :key="sub.key">
          <img :src="sub.imgUrl" />
          <p class="name">{{sub.name}}</p>
        </li>
      </ul>
    </div>
    <div class="air-quality">
      <!-- 使用d3绘制图表 -->
      <!-- <AirQualityD3 :selector="'.air-quality'" /> -->
    </div>

    <el-dialog
      v-if="dialogVisible"
      :title="title"
      :visible.sync="dialogVisible"
      width="45%"
      :before-close="handleClose">
      <div class="render-chart">
        <component :is="which_to_show" 
          :sourceData="sourceData"  
          :pollution="ptype"
          :selector="'.render-chart'" ></component> 
      </div>
 
    </el-dialog>
    
  </div>  
</template>

<script>
  import { fetch } from '@/util/request'
  import chartJson from '@/../static/json/charts.json'
  import * as charts from '@/charts/index.js'
  import * as components from '@/components/index.js'
  import { TimeChart } from '@/charts'
  export default {
    data() {
      return {
        chartJson: chartJson,
        dialogVisible: false,
        ptype: "iaqi",
        title: '',
        which_to_show: '',
        sourceData: '',
        areaData: []
      };
    },
    components: {
      ...charts,
      ...components,
      TimeChart
    },
    mounted() {
      this.requetData()
    },
    methods: {
      requetData() {
        fetch('fetchLine', data => {
         
          this.areaData = data
        })
      },
       handleChart(item) {
         let self = this
         this.title = item.name
         let dataUrl = item.dataUrl || 'fetchDefault'
         fetch(dataUrl, data=> {
           self.sourceData = data
           self.dialogVisible = true
           self.which_to_show = item.key
         })
       },
       handleClose() {
         this.dialogVisible = false
       }
    }
  };
</script>





