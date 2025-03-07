import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { USERS, MultiUserCodeTimeData } from '../services/wakatime';

interface CodeTimeTrendProps {
  codeTimeData: MultiUserCodeTimeData;
}

const CodeTimeTrend = ({ codeTimeData }: CodeTimeTrendProps) => {
  const getChartOption = () => {
    // 获取日期列表（X轴）
    const dates = codeTimeData[USERS[0].id]?.map(item => 
      dayjs(item.date).format('MM-DD')
    ) || [];

    // 为每个用户准备数据系列
    const series = USERS.map(user => {
      const userData = codeTimeData[user.id] || [];
      
      return {
        name: user.name,
        type: 'line',
        smooth: true,
        data: userData.map(item => (item.seconds / 3600).toFixed(2)), // 转换为小时
        itemStyle: {
          color: user.color
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      };
    });

    return {
      title: {
        text: '每日编码时间趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          let tooltip = `<div>${params[0].axisValue}</div>`;
          
          params.forEach((param: any) => {
            tooltip += `<div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color}"></span>
              <span>${param.seriesName}: </span>
              <span style="font-weight:bold;">${param.value} 小时</span>
            </div>`;
          });
          
          return tooltip;
        }
      },
      legend: {
        data: USERS.map(user => user.name),
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '编码时间（小时）',
        axisLine: {
          show: true
        }
      },
      series
    };
  };

  return (
    <div className="chart-container">
      <ReactECharts 
        option={getChartOption()} 
        style={{ height: '400px', width: '100%' }} 
      />
    </div>
  );
};

export default CodeTimeTrend; 