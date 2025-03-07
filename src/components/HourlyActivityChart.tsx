import ReactECharts from 'echarts-for-react';
import { useState } from 'react';
import { HourlyActivityData, ACTIVITY_TYPES } from '../services/wakatime';
import { EChartsOption } from 'echarts';

interface HourlyActivityChartProps {
  data: HourlyActivityData[] | undefined;
  title?: string;
  height?: string;
  customColors?: { [key: string]: string };
  selectedDate?: string;
}

const HourlyActivityChart = ({ 
  data, 
  title = '24小时活动分布', 
  height = '400px',
  customColors,
  selectedDate
}: HourlyActivityChartProps) => {
  // 默认所有活动类型都选中
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    ACTIVITY_TYPES.map(type => type.id)
  );

  // 切换活动类型的选中状态
  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      // 至少保留一个活动类型
      if (selectedActivities.length > 1) {
        setSelectedActivities(prev => prev.filter(id => id !== activityId));
      }
    } else {
      setSelectedActivities(prev => [...prev, activityId]);
    }
  };
  
  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart" style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>暂无小时活动数据</p>
      </div>
    );
  }
  
  // 准备数据
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
  // 绘制图表选项
  const getChartOption = (): EChartsOption => {
    // 为每种活动类型准备数据系列
    const series = ACTIVITY_TYPES
      .filter(type => selectedActivities.includes(type.id))
      .map(activityType => {
        // 提取每小时该活动类型的秒数
        const activityData = data.map(hourData => {
          // 将秒转换为分钟，便于查看
          return (hourData.activities[activityType.id as keyof typeof hourData.activities] / 60).toFixed(1);
        });
        
        return {
          name: activityType.name,
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          sampling: 'average' as const,
          itemStyle: {
            color: customColors?.[activityType.id] || activityType.color
          },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, 
                color: customColors?.[activityType.id] || activityType.color 
              }, {
                offset: 1, 
                color: 'rgba(255, 255, 255, 0)'
              }]
            }
          },
          data: activityData
        };
      });
    
    return {
      title: {
        text: selectedDate ? `${title} (${selectedDate})` : title,
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          let tooltip = `<div>${params[0].axisValue}</div>`;
          
          params.forEach((param: any) => {
            tooltip += `<div style="display:flex;align-items:center;margin:3px 0;">
              <span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:${param.color}"></span>
              <span>${param.seriesName}：${param.value} 分钟</span>
            </div>`;
          });
          
          return tooltip;
        }
      },
      legend: {
        data: ACTIVITY_TYPES
          .filter(type => selectedActivities.includes(type.id))
          .map(type => type.name),
        bottom: 0,
        type: 'scroll',
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        boundaryGap: false,
        data: hours,
        axisLabel: {
          formatter: (value: string) => value.split(':')[0],
          interval: 2
        }
      },
      yAxis: {
        type: 'value',
        name: '分钟',
        axisLabel: {
          formatter: '{value} 分钟'
        }
      },
      series
    };
  };
  
  return (
    <div className="hourly-activity-chart">
      <div className="activity-filters">
        {ACTIVITY_TYPES.map(type => (
          <button 
            key={type.id}
            className={`activity-filter-btn ${selectedActivities.includes(type.id) ? 'active' : ''}`}
            onClick={() => toggleActivity(type.id)}
            style={{ 
              '--activity-color': customColors?.[type.id] || type.color 
            } as React.CSSProperties}
          >
            {type.name}
          </button>
        ))}
      </div>
      <ReactECharts 
        option={getChartOption()} 
        style={{ height }} 
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default HourlyActivityChart; 