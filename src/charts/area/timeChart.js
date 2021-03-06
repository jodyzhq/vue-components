
import d3 from 'd3';
import _ from 'lodash'
import { genSVGDocID } from '@/util/util' 
export default {
  name: 'time-chart',
  template: '<div class="time-chart"></div>',
  data() {
    return {
       // g元素id
     gId: genSVGDocID(),
      defaultSetting: {
        width: 700,
        height: 300,
        dur: 750, // 动画过度时间
        itemStyle: {
          margin: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 0
          },
          // 滤镜样式
          gradient: {
            x1: '0%',
            y1: '0%',
            x2: '0%',
            y2: '100%',
            offset1: '20%',
            offset2: '100%',
            opacity1: 1,
            opacity2: 0.1
          },
          // 如果加了mark 不可用曲线basis样式
          fillStyle: 'pattern', // patterns:图案线条填充、gradient:渐变填充
          lineStyle: 'cardinal', // 折线样式 linear/linear-closed/step/... 曲线:basis/cardinal/
          // 区域及线条path样式
          pathStyle: [
            {
              areaPath: {
                fill: ['#3ee57a', '#3ee57a'],
                stroke: 'none'
              },
              linePath: {
                stroke: '#3ee57a',
                strokeWidth: 2
              }
            }, { // 环比
              areaPath: {
                fill: ['#8b3cc4', '#8b3cc4'],
                stroke: 'none'
              },
              linePath: {
                stroke: '#8b3cc4',
                strokeWidth: 2
              }
            }
          ]
        },
        topMark: {
          show: true,
          radius: 7,
          fill: '#A5AAB2',
          stroke: ['#fff', '#8b3cc4'],
          strokeWidth: 2
        },
        topText: {
          show: false,
          fill: ['#fff', '#fff'],
          fontSize: 16,
          textAnchor: 'middle'
        },
        yAxis: {
          left: 70,
          axisLine: {
            show: true // 轴线
          },
          gridLine: {
            show: false // 网格线
          },
          ticks: 5 // 刻度  
        },
        xAxis: {
          axisLine: {
            show: true
          },
          gridLine: {
            show: false // 网格线
          }
        },
        xText: {
          fontSize: 16,
          fill: '#fff',
          textAnchor: 'middle'
        }
      }

    }
  },
  props: {
    opt: Object,
    sourceData: Array
  },
  mounted() {
    this.initCharts()
     this.addAxisEle()
    // const x = d3.scaleLinear().range([0, 430]);
    // const y = d3.scaleLinear().range([210, 0]);
    // d3.axisLeft().scale(x);
    // d3.axisTop().scale(y);
    // x.domain(d3.extent(data, (d, i) => i));
    // y.domain([0, d3.max(data, d => d)]);
    // const createPath = d3.line()
    //   .x((d, i) => x(i))
    //   .y(d => y(d));
    // svg.append('path').attr('d', createPath(data));
  },
  methods: {
    initCharts() {
      this.config = _.merge({}, this.defaultSetting, this.opt)
      const { width, height, itemStyle, topText, topMark, yAxis } = this.config
      const { left, right, top, bottom } = itemStyle.margin
      // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
      this.config.xWidth = width - yAxis.left - left - right
      this.config.yHeight = height - top - bottom

      this.svg = d3.select(this.$el).append('svg')
        .attr('width', width)
        .attr('height', height)
      const svg = this.svg

      // 创建defs元素  
    const defs = svg.append('defs')    

     
      // 创建line-path g元素
      this.lineGroup = svg.append('g')
        .attr('class', `line-group-${this.gId}`)
      // 创建area-path g元素  
      this.areaGroup = svg.append('g')
        .attr('class', `area-group-${this.gId}`)
      // 是否显示标记点
      this.isShowMark = topMark.show
      if(this.isShowMark) {
        // 创建mark g元素
        this.markGroup = svg.append('g')
          .attr('class', `mark-group-${this.gId}`) 
      }
      // 是否显示标记点 
      this.isShowTopText = topText.show 
      if(this.isShowTopText) {
        // 创建text g元素
        this.textGroup = svg.append('g')
          .attr('class', `text-group-${this.gId}`)
      }   
      
      // x轴比例尺
      this.xScale = null  
      // y轴比例尺
      this.yScale = null  
      // 线条生成器
      this.linePath = null
      // 区域生成器
      this.linePath = null
      // 获取滤镜配置项 
      const { pathStyle } = itemStyle
      let cfg = []
      let patterns = []
    },
    renderDefs() {
      
    },
    // 添加轴线
    addAxisEle() {
      const svg = this.svg
      // 创建X轴g元素
      const { height, itemStyle, xAxis, yAxis } = this.config // 宽、高
      const { bottom, top, left } = itemStyle.margin
      // X轴g元素
      this.axisXGroup = svg.insert('g', 'defs')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(${yAxis.left + left}, ${height - bottom})`)
      // X轴线    
      this.axisXLine = this.axisXGroup.append('path')

      // 是否显示X轴网格线
      this.isXGridLine = xAxis.gridLine.show
      if (this.isXGridLine) {
        this.gridXLine = svg.insert('g', 'defs')
          .attr('class', 'grid-line-x')
      }

      // Y轴g元素
      this.axisYGroup = svg.insert('g', 'defs')
        .attr('class', 'axis axis-y')
        .attr('transform', `translate(${yAxis.left}, ${top})`)

      // 是否显示X轴网格线
      this.isYGridLine = yAxis.gridLine.show
      if (this.isYGridLine) {
        this.gridYLine = svg.insert('g', 'defs')
          .attr('class', 'grid-line-y')
      }

      // x轴比例尺
      this.xScale = null

      this.renderAxis(this.sourceData)
    },
    /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'tongbi|1-100': 1, // 同比数据
   *     'huanbi|1-100': 1 // 环比数据
   *   }
   *  ]
   *  @param    {array}  data 图表数据
   *  @return   {[type]}  null
   */
    renderAxis(data) {
      const self = this
      const { width, height, yHeight, itemStyle } = self.config
      
      // 判断数据是否为空
      if (!data || !data.length) {
        
        return false
      }
      self.config.dataLen = data.length
      let tongbiData = [] // 同比数据
      let huanbiData = [] // 环比数据
      // 保存一组空数组,用于折线动画过度
      self.nullData = []
      data.map((d) => {
        tongbiData.push(d.tongbi)
        huanbiData.push(d.huanbi)
        self.nullData.push(0)
      })
      // 获取所有value
      let dataset = [...tongbiData, ...huanbiData]
      // 同比环比取出来
      let newData = [tongbiData]
      // 渲染x轴
      self.xScale = self.renderXAxis(data)
      // 渲染y轴  
      self.yScale = self.renderYAxis(dataset)

      // 线条生成器
      self.linePath = d3.svg.line()
        .x((d, i) => self.xScale(i))
        .y((d) => self.yScale(d))
        .interpolate(itemStyle.lineStyle)

      // 区域生成器
      self.areaPath = d3.svg.area()
        .x((d, i) => self.xScale(i))
        .y0(yHeight)
        .y1((d) => self.yScale(d))
        .interpolate(itemStyle.lineStyle)

      // 渲染同环比数据
      for (let i = 0, len = newData.length; i < len; i++) {
        self.renderLinePath(newData[i], i)
        self.renderAreaPath(newData[i], i)
        // 是否显示顶部mark  
        if (self.isShowMark) {
          self.renderTopMark(newData[i], i)
        }
        // 是否显示顶部文字
        if (self.isShowTopText) {
          self.renderTextData(newData[i], i)
        }
      }
    },
    /**
   *  渲染线条path
   *  @param    {array}   data 数据
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  renderLinePath(data, i) {
    const self = this
    // 创建line-path g元素
    const lineGroup = this.lineGroup
      .call(::self.setGroupAttribute)  

    // 创建path元素
    let linePath = lineGroup.selectAll(`.line-path-${i}`)
    if(linePath.node()) {
      lineGroup.select(`.line-path-${i}`)
        .call(::self.setLinePathAttribute, data, i)    
    } else{
      lineGroup.append('path')
        .call(::self.setLinePathAttribute, data, i)  
    }
  },

  /**
   *  设置线条path属性
   *  @param    {array}  path   path元素
   *  @param    {array}  data   数据
   *  @param    {number}  i     下标
   *  @return   {void}
   */
  setLinePathAttribute(path, data, i) {
    const self = this
    const { dur, itemStyle } = self.config
    const { pathStyle } = itemStyle
    path.attr('class', `line-path-${i}`)
      .attr('fill', 'none')
      .attr('stroke', pathStyle[i].linePath.stroke)
      .attr('stroke-width', pathStyle[i].linePath.strokeWidth)
      .attr('filter', `url(#${self.filterId})`)
      .attr('d', self.linePath(self.nullData))
      .transition()
      .duration(dur)
      .attr('d', self.linePath(data))
  },

  /**
   *  渲染区域path
   *  @param    {array}   data 数据
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  renderAreaPath(data, i) {
    const self = this
    // line-path g元素
    const areaGroup = this.areaGroup
      .call(::self.setGroupAttribute)  
    // 创建path元素
    let areaPath = areaGroup.selectAll(`.area-path-${i}`)
    if(areaPath.node()) {
      areaGroup.select(`.area-path-${i}`)
        .call(::self.setAreaPathAttribute, data, i)    
    } else{
      areaGroup.append('path')
        .call(::self.setAreaPathAttribute, data, i)  
    }
  },

  /**
   *  设置区域path属性
   *  @param    {array}  path   path元素
   *  @param    {array}  data   数据
   *  @param    {number}  i     下标
   *  @return   {void}
   */
  setAreaPathAttribute(path, data, i) {
    const self = this
    const { dur, itemStyle } = self.config
    path.attr('class', `area-path-${i}`)
      // .attr('fill', '#3ee57a')
      .attr('fill', 'url(#gradient1)')
      .attr('stroke', 'none')
      .attr('d', self.areaPath(self.nullData))
      .transition()
      .duration(dur)
      .attr('d', self.areaPath(data)) 
  },

  /**
   *  渲染文字数据
   *  @param    {array}   data 数据
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  renderTextData(data, i) {
    const self = this
    // text g元素
    const textGroup = this.textGroup
      .call(::self.setGroupAttribute)  

    // 获取并处理update部分
    let update = textGroup.selectAll(`.text-${i}`)
      .data(data)
      .call(::self.setTextDataAttribute, i)  
    // 获取并处理enter部分
    update.enter()
      .append('text')
      .call(::self.setTextDataAttribute, i)  
    // 获取并处理exit部分  
    update.exit().remove()  
  },

  /**
   *  设置文字属性
   *  @param    {array}   text text元素
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  setTextDataAttribute(text, i) {
    const self = this
    const { topText, dur, yHeight } = self.config
    text.attr('class', `text-${i}`)
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill[i])
      .attr('text-anchor', topText.textAnchor)
      .attr('x', (d, j) => self.xScale(j))
      .attr('y', yHeight)
      .transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d) - 10)
      .text((d) => d)
  },

  /**
   *  渲染顶部小圆点
   *  @example: [example]
   *  @param    {[type]}  data [description]
   *  @param    {[type]}  i    [description]
   *  @return   {void}
   */
  renderTopMark(data, i) {
    const self = this
    // mark g元素
    let markGroup = this.markGroup
      .call(::self.setGroupAttribute)  
 
    // 获取并处理update部分
    let update = markGroup.selectAll(`.mark-${i}`)
      .data(data)
      .call(::self.setMarkAttribute, i)  
      
    // 获取并处理enter部分
    update.enter()
      .append('circle')
    
      .call(::self.setMarkAttribute, i)  
      .on('click', () =>  {
        console.log('xxxxx')
      })
    // 获取并处理exit部分  
    update.exit().remove()  
  },

  /**
   *  设置圆点属性
   *  @param    {array}   circle  circle元素
   *  @param    {number}  i       下标
   *  @return   {void}
   */
  setMarkAttribute(circle, i) {
    const self = this
    const { topMark, yHeight, dur } = self.config
    circle.attr('class', `mark-${i} mark`)
      .attr('r', topMark.radius)
      .attr('fill', topMark.fill)
      .attr('stroke', topMark.stroke[i])
      .attr('stroke-width', topMark.strokeWidth)
      .attr('cx', (d, j) => {
        if(j == this.sourceData.length - 1) {
          return self.xScale(j + 1)
        }
        return (self.xScale(j) + self.xScale(j+1)) / 2
      })
      .attr('cy', yHeight)
      // .transition()
      // .duration(dur)
      // .attr('cy', (d) => self.yScale(d))
  },

  /**
   *  设置g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const { yAxis, itemStyle } = this.config
    const { top, left } = itemStyle.margin
    g.attr('transform', `translate(${yAxis.left + left}, ${top})`)
  },

    /**
   *  渲染x轴
   *  @param    {array}     data 图表数据
   *  @return   {function}  x轴比例尺
   */
    renderXAxis(data) {
      const self = this
      const { xWidth, yHeight, dataLen, xAxis } = self.config // 宽、高
      const { left, right } = self.config.itemStyle.margin

      // 创建x轴比例尺
      self.xScale = d3.scale.linear()
        .domain([0, data.length - 1])
        .range([0, xWidth - right - left])

      // 如果面积图要紧挨着y轴, 将range改为[0, xWidth - right]  

      // 添加x轴g元素
      const axisG = this.axisXGroup
      const { show } = xAxis.axisLine
      if (show) {
        self.axisXLine.attr('d', `M0, 0V0H${xWidth + left / 2}V0`)
      }

      // 获取并处理update部分
      let update = axisG.selectAll('text')
        .data(data)
      // 获取enter部分  
      update.enter().append('text')

      // 处理update部分
      update.call(:: self.setXAxisTextAttribute)
      // 获取并处理exit部分    
      update.exit().remove()

      // 是否显示网格线
      if (this.isXGridLine) {
        // 定义纵轴网格线
        let grid = d3.svg.axis()
          .scale(self.xScale)
          .tickSize(-yHeight, 0)
          .tickFormat('')
          .orient('bottom')
          .ticks(dataLen - 1)
        // 添加纵轴网格线
        this.gridXLine
          .call(:: self.setXGridLineAttribute, grid)
      }
      // 返回比例尺
      return self.xScale
    },

    /**
     *  设置X轴text属性
     *  @param    {array}  text text属性
     *  @return   {void}
     */
    setXAxisTextAttribute(text) {
      const self = this
      const { xText, dur, itemStyle } = self.config
      const { bottom } = itemStyle.margin
      text.attr('font-size', xText.fontSize)
        .attr('text-anchor', xText.textAnchor)
        .attr('x', (d, i) => self.xScale(i))
        .attr('y', bottom / 2)
        .text((d) => d.name)
        .attr('opacity', 0)
        .transition()
        .duration(dur)
        .attr('opacity', 1)
    },

    /**
     *  设置Y轴网格线属性
     *  @param    {array}  g     g元素
     *  @param    {function}  grid 定义网格线的方法
     *  @return   {void}
     */
    setXGridLineAttribute(g, grid) {
      const { height, itemStyle, yAxis } = this.config
      const { bottom, left } = itemStyle.margin
      g.attr('class', 'grid-line grid-line-x')
        .attr('transform', `translate(${yAxis.left + left}, ${height - bottom})`)
        .call(grid)
    },

    /**
     *  渲染Y轴
     *  @param    {array}  data 图表数据
     *  @return   {function}  y轴比例尺
     */
    renderYAxis(data) {
      const self = this
      // 获取一系列配置项
      const { xWidth, yHeight } = this.config
      const { ticks } = this.config.yAxis

      // 定义y轴比例尺
      let yScale = d3.scale.linear()
        .domain([0, d3.max(data) * 1.1])
        .range([yHeight, 0])

      // 定义y轴样式
      let axis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticks)

      // 添加y轴g元素
      this.axisYGroup
        .call(:: self.setYAxisAttribute, axis)

      // 是否显示网格线
      if (this.isYGridLine) {
        // 定义纵轴网格线
        let grid = d3.svg.axis()
          .scale(yScale)
          .tickSize(-xWidth, 0)
          .tickFormat('')
          .orient('left')
          .ticks(ticks)
        // 添加纵轴网格线
        this.gridYLine
          .call(:: self.setYgridLineAttribute, grid)
      }
      // 返回比例尺
      return yScale
    },

    /**
     *  设置Y轴属性
     *  @param    {array}  g     g元素
     *  @param    {function}  axis 定义y轴样式的方法
     *  @return   {void}
     */
    setYAxisAttribute(g, axis) {
      const { dur } = this.config
      g.attr('opacity', 0)
        .transition()
        .duration(dur)
        .attr('opacity', 1)
        .call(axis)
    },

    /**
     *  设置Y轴网格线属性
     *  @param    {array}  g     g元素
     *  @param    {function}  grid 定义网格线的方法
     *  @return   {void}
     */
    setYgridLineAttribute(g, grid) {
      const { yAxis, itemStyle } = this.config
      const { top } = itemStyle.margin
      g.attr('class', 'grid-line grid-line-y')
        .attr('transform', `translate(${yAxis.left}, ${top})`)
        .call(grid)
    }
  },
  watch: {
    sourceData: function() {
      this.renderAxis(this.sourceData)
    }
  }
};
