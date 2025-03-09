import ReactECharts from 'echarts-for-react';
import { useState, useEffect } from 'react';
import { EChartsOption } from 'echarts';

// 使用从duration.ts中的接口定义
interface HourlyActivityData {
  hour: number;
  categories: {
    [category: string]: number; // 每个类别在该小时的秒数
  };
  total?: number; // 该小时的总时间（分钟）
}

interface HourlyActivityLineChartProps {
  data: HourlyActivityData[] | undefined;
  title?: string;
  height?: string;
  customColors?: { [key: string]: string };
  selectedDate?: string;
}

const HourlyActivityLineChart = ({ 
  data, 
  title = '24小时活动分布', 
  height = '400px',
  customColors,
  selectedDate
}: HourlyActivityLineChartProps) => {
  // 从数据中提取所有可用的类别
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showTotal, setShowTotal] = useState<boolean>(true);
  
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

  // 切换是否显示总计线
  const toggleTotal = () => {
    setShowTotal(prev => !prev);
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
  
  // 色彩数组，用于没有自定义颜色时
  const defaultColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', 
    '#8C9EFF', '#FF8A80', '#A5D6A7', '#90CAF9'
  ];
  
  // 定义总计线的颜色
  const totalLineColor = customColors?.['total'] || '#000000';
  
  // 绘制图表选项
  const getChartOption = (): EChartsOption => {
    // 为每种类别准备数据系列
    const categorySeries = selectedCategories.map((categoryId, index) => {
      // 提取每小时该类别的分钟数
      const categoryData = data.map(hourData => {
        // 将秒转换为分钟，便于查看
        const minutes = hourData.categories[categoryId] || 0;
        return parseFloat(minutes.toFixed(1));
      });
      
      return {
        name: categoryId, // 使用类别名称
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        sampling: 'average' as const,
        itemStyle: {
          color: customColors?.[categoryId] || defaultColors[index % defaultColors.length]
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
              color: customColors?.[categoryId] || defaultColors[index % defaultColors.length]
            }, {
              offset: 1, 
              color: 'rgba(255, 255, 255, 0)'
            }]
          }
        },
        data: categoryData
      };
    });
    
    // 准备总计数据系列
    const totalSeries = showTotal ? [{
      name: '总计',
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        type: 'solid' as const
      },
      itemStyle: {
        color: totalLineColor
      },
      emphasis: {
        lineStyle: {
          width: 5
        }
      },
      z: 10, // 确保总计线在最上层
      data: data.map(hourData => {
        return parseFloat((hourData.total || 0).toFixed(1));
      })
    }] : [];
    
    // 合并类别系列和总计系列
    const series = [...categorySeries, ...totalSeries];
    
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
        data: [...selectedCategories, ...(showTotal ? ['总计'] : [])],
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
        max: 60, // 固定Y轴最大值为60分钟
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
        {availableCategories.map((categoryId, index) => {
          const categoryColor = customColors?.[categoryId] || defaultColors[index % defaultColors.length];
          return (
            <button 
              key={categoryId}
              className={`activity-filter-btn ${selectedCategories.includes(categoryId) ? 'active' : ''}`}
              onClick={() => toggleCategory(categoryId)}
              style={{ 
                '--activity-color': categoryColor,
                backgroundColor: selectedCategories.includes(categoryId) ? `${categoryColor}40` : '#f0f0f0',
                color: selectedCategories.includes(categoryId) ? categoryColor : '#333',
                border: `1px solid ${categoryColor}`,
                padding: '4px 10px',
                margin: '0 5px 5px 0',
                borderRadius: '4px',
                cursor: 'pointer'
              } as React.CSSProperties}
            >
              {categoryId}
            </button>
          );
        })}
        <button 
          className={`activity-filter-btn ${showTotal ? 'active' : ''}`}
          onClick={toggleTotal}
          style={{ 
            '--activity-color': totalLineColor,
            backgroundColor: showTotal ? `${totalLineColor}40` : '#f0f0f0',
            color: showTotal ? totalLineColor : '#333',
            border: `1px solid ${totalLineColor}`,
            padding: '4px 10px',
            margin: '0 5px 5px 0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          } as React.CSSProperties}
        >
          总计
        </button>
      </div>
      <ReactECharts 
        option={getChartOption()} 
        style={{ height }} 
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default HourlyActivityLineChart; 