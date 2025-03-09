import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { getTeamTotalStats, MultiUserCodeTimeData, USERS } from '../services/wakatime';
import { useEffect, useState } from 'react';
import HourlyActivityChart from './HourlyActivityChart';
import HourlyActivityLineChart from './HourlyActivityLineChart';

interface TeamDashboardProps {
  codeTimeData: MultiUserCodeTimeData;
}

const TeamDashboard = ({ codeTimeData }: TeamDashboardProps) => {
  // 计算团队总计数据
  const teamStats = getTeamTotalStats(codeTimeData);
  // 跟踪视窗宽度，用于响应式调整
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // 选中的日期索引
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  useEffect(() => {
    // 添加窗口大小变化监听
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 格式化时间函数
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };
  
  // 获取每日编码时间图表配置
  const getDailyTeamChartOption = () => {
    // 准备各用户数据系列
    const series = USERS.map(user => {
      const userData = codeTimeData[user.id] || [];
      
      return {
        name: user.name,
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: userData.map(day => (day.seconds / 3600).toFixed(2)),
        itemStyle: {
          color: user.color
        }
      };
    });
    
    // 移动设备上使用更紧凑的布局
    const isMobile = windowWidth <= 768;
    
    return {
      title: {
        text: '团队每日编码时间',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: USERS.map(user => user.name),
        bottom: 0,
        type: isMobile ? 'scroll' : 'plain',
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: isMobile ? '20%' : '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: teamStats.dailyStats.map(day => dayjs(day.date).format(isMobile ? 'DD' : 'MM-DD')),
        axisLabel: {
          fontSize: isMobile ? 10 : 12,
          interval: isMobile ? 1 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '小时',
        nameTextStyle: {
          fontSize: isMobile ? 10 : 12
        },
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series
    };
  };
  
  // 获取团队成员贡献比例图表配置
  const getTeamContributionOption = () => {
    // 计算每个用户的总编码时间
    const userData = USERS.map(user => {
      const seconds = codeTimeData[user.id]?.reduce((total, day) => total + day.seconds, 0) || 0;
      return {
        name: user.name,
        value: (seconds / 3600).toFixed(2),
        itemStyle: {
          color: user.color
        }
      };
    });
    
    // 移动设备上使用更紧凑的布局
    const isMobile = windowWidth <= 768;
    
    return {
      title: {
        text: '团队贡献比例',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} 小时 ({d}%)'
      },
      legend: {
        bottom: 0,
        data: USERS.map(user => user.name),
        type: isMobile ? 'scroll' : 'plain',
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series: [
        {
          name: '贡献时间',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: !isMobile,
            formatter: '{b}: {d}%',
            fontSize: isMobile ? 10 : 12
          },
          labelLine: {
            show: !isMobile
          },
          emphasis: {
            label: {
              show: true,
              fontSize: isMobile ? 12 : 18,
              fontWeight: 'bold'
            }
          },
          data: userData
        }
      ]
    };
  };
  
  // 获取团队语言分布图表配置
  const getTeamLanguageOption = () => {
    // 移动设备上显示更少的语言
    const isMobile = windowWidth <= 768;
    const languages = teamStats.languages.slice(0, isMobile ? 5 : 10);
    
    return {
      title: {
        text: '团队编程语言分布',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} 小时 ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: isMobile ? 'horizontal' : 'vertical',
        right: isMobile ? 'auto' : 10,
        bottom: isMobile ? 0 : 'auto',
        top: isMobile ? 'auto' : 20,
        textStyle: {
          fontSize: isMobile ? 10 : 12
        },
        data: languages.map(lang => lang.name)
      },
      series: [
        {
          name: '语言',
          type: 'pie',
          radius: '60%',
          center: [isMobile ? '50%' : '40%', '50%'],
          data: languages.map(lang => ({
            name: lang.name,
            value: (lang.seconds / 3600).toFixed(2)
          })),
          label: {
            show: !isMobile,
            formatter: '{b}: {d}%',
            fontSize: isMobile ? 10 : 12
          },
          labelLine: {
            show: !isMobile
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };
  
  // 获取编辑器使用分布图表配置
  const getEditorsBarOption = () => {
    const editors = teamStats.editors;
    // 移动设备上显示更少的编辑器
    const isMobile = windowWidth <= 768;
    const visibleEditors = editors.slice(0, isMobile ? 5 : editors.length);
    
    return {
      title: {
        text: '编辑器使用情况',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '小时',
        nameTextStyle: {
          fontSize: isMobile ? 10 : 12
        },
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      yAxis: {
        type: 'category',
        data: visibleEditors.map(item => item.name),
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series: [
        {
          name: '使用时间',
          type: 'bar',
          data: visibleEditors.map(item => ({
            value: (item.seconds / 3600).toFixed(2),
            itemStyle: {
              color: `rgba(69, 117, 245, ${0.4 + (item.percent / 100) * 0.6})`
            }
          }))
        }
      ]
    };
  };
  
  // 获取周趋势图表配置
  const getWeeklyTrendOption = () => {
    // 获取每个用户每天的数据
    const series = USERS.map(user => {
      const userData = codeTimeData[user.id] || [];
      
      return {
        name: user.name,
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        data: userData.map(day => (day.seconds / 3600).toFixed(2)),
        itemStyle: {
          color: user.color
        },
        lineStyle: {
          width: 3
        }
      };
    });
    
    // 移动设备上使用更紧凑的布局
    const isMobile = windowWidth <= 768;
    
    return {
      title: {
        text: '一周编码趋势',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: USERS.map(user => user.name),
        bottom: 0,
        type: isMobile ? 'scroll' : 'plain',
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: isMobile ? '20%' : '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: teamStats.dailyStats.map(day => dayjs(day.date).format(isMobile ? 'DD' : 'MM-DD')),
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      yAxis: {
        type: 'value',
        name: '小时',
        nameTextStyle: {
          fontSize: isMobile ? 10 : 12
        },
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series
    };
  };
  
  // 移动设备上判断是否使用小号字体
  const isMobile = windowWidth <= 768;
  
  // 处理日期选择变化
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateIndex(Number(e.target.value));
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY年MM月DD日');
  };
  
  // 获取团队日期数据
  const teamDates = teamStats.dailyStats.map(day => day.date);
  // 获取选中日期的数据
  const selectedDay = teamStats.dailyStats[selectedDateIndex];
  // 获取选中日期的小时活动数据
  const hourlyActivityData = teamStats.hourlyActivity;
  
  return (
    <div className="team-dashboard">
      <div className="team-dashboard-header">
        <h2>团队编码统计仪表板</h2>
        <div className="team-total-stats">
          <div className="team-stat-card">
            <h3>总编码时间</h3>
            <p className="team-stat-value">{formatTime(teamStats.totalSeconds)}</p>
            <p className="team-stat-subvalue">{(teamStats.totalSeconds / 3600).toFixed(1)} 小时</p>
          </div>
          
          <div className="team-stat-card">
            <h3>平均每人</h3>
            <p className="team-stat-value">
              {formatTime(teamStats.totalSeconds / USERS.length)}
            </p>
            <p className="team-stat-subvalue">
              {(teamStats.totalSeconds / USERS.length / 3600).toFixed(1)} 小时
            </p>
          </div>
          
          <div className="team-stat-card">
            <h3>活跃项目</h3>
            <p className="team-stat-value">{teamStats.projects.length}</p>
          </div>
          
          <div className="team-stat-card">
            <h3>使用语言</h3>
            <p className="team-stat-value">{teamStats.languages.length}</p>
          </div>
        </div>
      </div>
      
      {/* 团队小时活动分布 */}
      <div className="chart-card">
        <div className="date-selector">
          <select value={selectedDateIndex} onChange={handleDateChange}>
            {teamDates.map((date, index) => (
              <option key={date} value={index}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
        <HourlyActivityChart 
          data={hourlyActivityData} 
          title="团队24小时活动分布"
          height={isMobile ? "300px" : "400px"}
          selectedDate={formatDate(selectedDay?.date || '')}
        />

        {/* 新增加的24小时活动折线图 */}
        <div className="hourly-activity-line-chart" style={{ marginTop: '30px' }}>
          <h3 className="section-title">团队24小时活动折线图（含总计）</h3>
          <HourlyActivityLineChart 
            data={hourlyActivityData} 
            title="团队24小时活动分布（分钟）"
            height={isMobile ? "300px" : "400px"}
            customColors={{
              Browsing: '#FF6384',
              Coding: '#36A2EB',
              total: '#000000'
            }}
            selectedDate={formatDate(selectedDay?.date || '')}
          />
        </div>
      </div>
      
      <div className="charts-section team-charts-grid">
        <div className="chart-card">
          <ReactECharts 
            option={getDailyTeamChartOption()} 
            style={{ height: isMobile ? '300px' : '400px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="chart-card">
          <ReactECharts 
            option={getTeamContributionOption()} 
            style={{ height: isMobile ? '300px' : '400px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="chart-card">
          <ReactECharts 
            option={getTeamLanguageOption()} 
            style={{ height: isMobile ? '300px' : '400px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="chart-card">
          <ReactECharts 
            option={getEditorsBarOption()} 
            style={{ height: isMobile ? '300px' : '400px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="chart-card wide-chart">
          <ReactECharts 
            option={getWeeklyTrendOption()} 
            style={{ height: isMobile ? '300px' : '400px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
      
      <div className="team-detailed-stats">
        <h3>详细统计</h3>
        
        <div className="team-stats-tables">
          <div className="team-stats-table">
            <h4>编程语言统计</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>语言</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.languages.slice(0, isMobile ? 8 : 12).map(lang => (
                  <tr key={lang.name}>
                    <td>{lang.name}</td>
                    <td>{formatTime(lang.seconds)}</td>
                    <td>{lang.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="team-stats-table">
            <h4>项目统计</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.projects.slice(0, isMobile ? 8 : 12).map(project => (
                  <tr key={project.name}>
                    <td>{project.name}</td>
                    <td>{formatTime(project.seconds)}</td>
                    <td>{project.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="team-stats-table">
            <h4>操作系统使用</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>系统</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.operatingSystems.map(os => (
                  <tr key={os.name}>
                    <td>{os.name}</td>
                    <td>{formatTime(os.seconds)}</td>
                    <td>{os.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard; 