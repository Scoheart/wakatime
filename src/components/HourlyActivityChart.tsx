import ReactECharts from 'echarts-for-react';
import { useState, useEffect } from 'react';
import { HourlyActivityData, ACTIVITY_TYPES, getActivityTypeById } from '../services/wakatime';
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
  // 从数据中提取所有可用的类别
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // 当数据变化时，提取可用的类别
  useEffect(() => {
    if (data && data.length > 0) {
      const categories = new Set<string>();
      
      data.forEach(hourData => {
        Object.keys(hourData.categories).forEach(category => {
          categories.add(category);
        });
      });
      
      const categoryList = Array.from(categories);
      setAvailableCategories(categoryList);
      
      // 默认选择所有类别
      setSelectedCategories(categoryList);
    }
  }, [data]);

  // 切换类别的选中状态
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // 至少保留一个类别
      if (selectedCategories.length > 1) {
        setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      }
    } else {
      setSelectedCategories(prev => [...prev, categoryId]);
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
    // 为每种类别准备数据系列
    const series = selectedCategories.map(categoryId => {
      const activityType = getActivityTypeById(categoryId);
      
      // 提取每小时该类别的秒数
      const categoryData = data.map(hourData => {
        // 将秒转换为分钟，便于查看
        const seconds = hourData.categories[categoryId] || 0;
        return (seconds / 60).toFixed(1);
      });
      
      return {
        name: activityType.name,
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        sampling: 'average' as const,
        itemStyle: {
          color: customColors?.[categoryId] || activityType.color
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
              color: customColors?.[categoryId] || activityType.color 
            }, {
              offset: 1, 
              color: 'rgba(255, 255, 255, 0)'
            }]
          }
        },
        data: categoryData
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
        data: selectedCategories.map(id => getActivityTypeById(id).name),
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
        {availableCategories.map(categoryId => {
          const activityType = getActivityTypeById(categoryId);
          return (
            <button 
              key={categoryId}
              className={`activity-filter-btn ${selectedCategories.includes(categoryId) ? 'active' : ''}`}
              onClick={() => toggleCategory(categoryId)}
              style={{ 
                '--activity-color': customColors?.[categoryId] || activityType.color 
              } as React.CSSProperties}
            >
              {activityType.name}
            </button>
          );
        })}
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