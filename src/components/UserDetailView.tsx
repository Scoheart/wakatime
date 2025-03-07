import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { CodeTimeData, USERS } from '../services/wakatime';
import { useEffect, useState } from 'react';
import HourlyActivityChart from './HourlyActivityChart';

interface UserDetailViewProps {
  userId: string;
  userData: CodeTimeData[];
}

const UserDetailView = ({ userId, userData }: UserDetailViewProps) => {
  // 获取用户信息
  const user = USERS.find(u => u.id === userId);
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
  
  // 移动设备判断
  const isMobile = windowWidth <= 768;
  
  if (!user) {
    return <div className="error-message">用户不存在</div>;
  }
  
  // 计算总编码时间
  const totalSeconds = userData.reduce((total, day) => total + day.seconds, 0);
  
  // 格式化时间函数
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };
  
  // 获取所有日期的语言数据并合并
  const getAllLanguages = () => {
    const merged: { [key: string]: { name: string; seconds: number; percent: number } } = {};
    
    userData.forEach(day => {
      if (day.languages) {
        day.languages.forEach(lang => {
          if (merged[lang.name]) {
            merged[lang.name].seconds += lang.seconds;
          } else {
            merged[lang.name] = { ...lang };
          }
        });
      }
    });
    
    // 重新计算百分比
    const totalLangSeconds = Object.values(merged).reduce((total, lang) => total + lang.seconds, 0);
    
    return Object.values(merged)
      .map(lang => ({
        ...lang,
        percent: totalLangSeconds ? Math.round((lang.seconds / totalLangSeconds) * 100) : 0
      }))
      .sort((a, b) => b.seconds - a.seconds);
  };
  
  // 获取每日编码时间图表配置
  const getDailyChartOption = () => {
    return {
      title: {
        text: '每日编码时间',
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>${data.value} 小时`;
        }
      },
      xAxis: {
        type: 'category',
        data: userData.map(day => dayjs(day.date).format(isMobile ? 'DD' : 'MM-DD')),
        axisLabel: {
          rotate: isMobile ? 45 : 45,
          fontSize: isMobile ? 10 : 12,
          interval: isMobile ? 'auto' : 0
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
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      series: [
        {
          name: '编码时间',
          type: 'bar',
          data: userData.map(day => (day.seconds / 3600).toFixed(2)),
          itemStyle: {
            color: user.color
          }
        }
      ]
    };
  };
  
  // 获取语言饼图配置
  const getLanguagePieOption = () => {
    const languages = getAllLanguages().slice(0, isMobile ? 5 : 6); // 移动端显示更少语言
    
    return {
      title: {
        text: '编程语言分布',
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
        orient: isMobile ? 'horizontal' : 'vertical',
        left: isMobile ? 'center' : 'left',
        bottom: isMobile ? 0 : 'auto',
        type: isMobile ? 'scroll' : 'plain',
        data: languages.map(lang => lang.name),
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series: [
        {
          name: '语言',
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
            position: 'center',
            fontSize: isMobile ? 10 : 12
          },
          emphasis: {
            label: {
              show: true,
              fontSize: isMobile ? 14 : 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: !isMobile
          },
          data: languages.map(lang => ({
            name: lang.name,
            value: (lang.seconds / 3600).toFixed(2)
          }))
        }
      ]
    };
  };
  
  // 获取编辑器饼图配置
  const getEditorPieOption = () => {
    // 合并所有编辑器数据
    const editors: { [key: string]: number } = {};
    
    userData.forEach(day => {
      if (day.editors) {
        day.editors.forEach(editor => {
          if (editors[editor.name]) {
            editors[editor.name] += editor.seconds;
          } else {
            editors[editor.name] = editor.seconds;
          }
        });
      }
    });
    
    // 移动端只显示前4个编辑器
    const editorData = Object.entries(editors)
      .map(([name, seconds]) => ({ name, value: (seconds / 3600).toFixed(2) }))
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
      .slice(0, isMobile ? 4 : undefined);
    
    return {
      title: {
        text: '编辑器使用情况',
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
        orient: isMobile ? 'horizontal' : 'vertical',
        left: isMobile ? 'center' : 'left',
        bottom: isMobile ? 0 : 'auto',
        type: isMobile ? 'scroll' : 'plain',
        data: editorData.map(item => item.name),
        textStyle: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series: [
        {
          name: '编辑器',
          type: 'pie',
          radius: '65%',
          center: ['50%', '50%'],
          data: editorData,
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

  // 获取项目统计数据
  const getProjectStats = () => {
    const projects: { [key: string]: number } = {};
    
    userData.forEach(day => {
      if (day.projects) {
        day.projects.forEach(project => {
          if (projects[project.name]) {
            projects[project.name] += project.seconds;
          } else {
            projects[project.name] = project.seconds;
          }
        });
      }
    });
    
    return Object.entries(projects)
      .map(([name, seconds]) => ({ name, seconds, hours: (seconds / 3600).toFixed(2) }))
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, isMobile ? 5 : 8); // 移动端只显示前5个项目
  };
  
  // 处理日期选择变化
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateIndex(Number(e.target.value));
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY年MM月DD日');
  };
  
  // 获取选中日期的数据
  const selectedDay = userData[selectedDateIndex];
  
  return (
    <div className="user-detail-view">
      <div className="user-detail-header" style={{ borderColor: user.color }}>
        <h2>{user.name} 的编码统计</h2>
        <div className="user-total-time">
          <h3>本周总编码时间</h3>
          <p className="time-value">{formatTime(totalSeconds)}</p>
          <p className="time-value-hours">约 {(totalSeconds / 3600).toFixed(1)} 小时</p>
        </div>
      </div>
      
      {/* 添加24小时活动分布 */}
      <div className="stats-card">
        <div className="date-selector">
          <select value={selectedDateIndex} onChange={handleDateChange}>
            {userData.map((day, index) => (
              <option key={day.date} value={index}>
                {formatDate(day.date)}
              </option>
            ))}
          </select>
        </div>
        <HourlyActivityChart 
          data={selectedDay?.hourlyActivity} 
          height={isMobile ? "280px" : "350px"}
          customColors={{
            coding: user.color
          }}
          selectedDate={formatDate(selectedDay?.date || '')}
        />
      </div>
      
      <div className="stats-grid">
        <div className="stats-card">
          <ReactECharts 
            option={getDailyChartOption()} 
            style={{ height: isMobile ? '250px' : '300px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="stats-card">
          <ReactECharts 
            option={getLanguagePieOption()} 
            style={{ height: isMobile ? '250px' : '300px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="stats-card">
          <ReactECharts 
            option={getEditorPieOption()} 
            style={{ height: isMobile ? '250px' : '300px' }} 
            opts={{ renderer: 'svg' }}
          />
        </div>
        
        <div className="stats-card">
          <h3 className="stats-card-title">项目工作时间</h3>
          <div className="project-list">
            {getProjectStats().map(project => (
              <div key={project.name} className="project-item">
                <div className="project-name">{project.name}</div>
                <div className="project-time">{project.hours} 小时</div>
                <div className="project-bar">
                  <div 
                    className="project-bar-fill" 
                    style={{ 
                      width: `${(project.seconds / totalSeconds) * 100}%`,
                      backgroundColor: user.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="detailed-stats">
        <h3>详细统计数据</h3>
        
        <div className="detailed-stats-grid">
          <div className="detailed-stats-card">
            <h4>编程语言</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>语言</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {getAllLanguages().slice(0, isMobile ? 8 : undefined).map(lang => (
                  <tr key={lang.name}>
                    <td>{lang.name}</td>
                    <td>{formatTime(lang.seconds)}</td>
                    <td>{lang.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="detailed-stats-card">
            <h4>操作系统</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>系统</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {userData.flatMap(day => day.operatingSystems || [])
                  .reduce((acc, os) => {
                    const existing = acc.find(item => item.name === os.name);
                    if (existing) {
                      existing.seconds += os.seconds;
                      existing.percent += os.percent;
                    } else {
                      acc.push({ ...os });
                    }
                    return acc;
                  }, [] as { name: string; seconds: number; percent: number }[])
                  .sort((a, b) => b.seconds - a.seconds)
                  .slice(0, isMobile ? 3 : undefined)
                  .map(os => (
                    <tr key={os.name}>
                      <td>{os.name}</td>
                      <td>{formatTime(os.seconds)}</td>
                      <td>{Math.round(os.percent)}%</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          
          <div className="detailed-stats-card">
            <h4>活动类别</h4>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>类别</th>
                  <th>时间</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                {userData.flatMap(day => day.categories || [])
                  .reduce((acc, category) => {
                    const existing = acc.find(item => item.name === category.name);
                    if (existing) {
                      existing.seconds += category.seconds;
                      existing.percent += category.percent;
                    } else {
                      acc.push({ ...category });
                    }
                    return acc;
                  }, [] as { name: string; seconds: number; percent: number }[])
                  .sort((a, b) => b.seconds - a.seconds)
                  .slice(0, isMobile ? 5 : undefined)
                  .map(category => (
                    <tr key={category.name}>
                      <td>{category.name}</td>
                      <td>{formatTime(category.seconds)}</td>
                      <td>{Math.round(category.percent)}%</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailView; 