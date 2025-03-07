import { useEffect, useState } from 'react';
import { USERS, MultiUserCodeTimeData } from '../services/wakatime';

interface CodeTimeSummaryProps {
  codeTimeData: MultiUserCodeTimeData;
}

const CodeTimeSummary = ({ codeTimeData }: CodeTimeSummaryProps) => {
  const [summaryData, setSummaryData] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    // 计算每个用户的总编码时间
    const summary: {[key: string]: number} = {};
    
    USERS.forEach(user => {
      const userData = codeTimeData[user.id] || [];
      const totalSeconds = userData.reduce((total, day) => total + day.seconds, 0);
      summary[user.id] = totalSeconds;
    });
    
    setSummaryData(summary);
  }, [codeTimeData]);
  
  // 计算所有用户的总时间
  const totalTime = Object.values(summaryData).reduce((total, seconds) => total + seconds, 0);
  
  // 转换秒为小时:分钟格式
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };
  
  return (
    <div className="summary-container">
      <h2 className="summary-title">本周编码时间汇总</h2>
      
      <div className="summary-cards">
        {USERS.map(user => (
          <div 
            key={user.id} 
            className="summary-card"
            style={{ borderTop: `4px solid ${user.color}` }}
          >
            <h3>{user.name}</h3>
            <p className="time-value">{formatTime(summaryData[user.id] || 0)}</p>
            <p className="percentage">
              {totalTime ? `${((summaryData[user.id] || 0) / totalTime * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
        ))}
        
        <div className="summary-card total-card">
          <h3>团队总计</h3>
          <p className="time-value">{formatTime(totalTime)}</p>
        </div>
      </div>
    </div>
  );
};

export default CodeTimeSummary; 