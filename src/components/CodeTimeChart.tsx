import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { getMultipleUsersWeeklyStats, USERS, MultiUserCodeTimeData } from '../services/wakatime';
import { EChartsOption } from 'echarts';

const CodeTimeChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeTimeData, setCodeTimeData] = useState<MultiUserCodeTimeData>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 使用真实数据 (false) - 不再使用模拟数据
        const data = await getMultipleUsersWeeklyStats(false);
        setCodeTimeData(data);
      } catch (err) {
        setError('获取数据失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartOption = (): EChartsOption => {
    // 获取日期列表（X轴）
    const dates = codeTimeData[USERS[0].id]?.map(item => 
      dayjs(item.date).format('MM-DD')
    ) || [];

    // 为每个用户准备数据系列
    const series = USERS.map(user => {
      const userData = codeTimeData[user.id] || [];
      
      return {
        name: user.name,
        type: 'bar',
        data: userData.map(item => (item.seconds / 3600).toFixed(2)), // 转换为小时
        itemStyle: {
          color: user.color
        }
      };
    });

    return {
      title: {
        text: '一周编码时间统计（小时）',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
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
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '编码时间（小时）'
      },
      series
    };
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="chart-container">
      <ReactECharts 
        option={getChartOption()} 
        style={{ height: '500px', width: '100%' }} 
      />
    </div>
  );
};

export default CodeTimeChart; 