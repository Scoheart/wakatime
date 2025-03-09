import { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import UserDetailView from './components/UserDetailView';
import TeamDashboard from './components/TeamDashboard';
import {
  getMultipleUsersWeeklyStats,
  getUserDurationsByHour,
  MultiUserCodeTimeData,
} from './services/wakatime';
import { getDuration } from './services/duration';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeTimeData, setCodeTimeData] = useState<MultiUserCodeTimeData>({});
  const [activeTab, setActiveTab] = useState('team'); // 默认显示团队视图
  const [sidebarOpen, setSidebarOpen] = useState(false); // 移动端侧边栏状态

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
    getDuration();
    fetchData();
  }, []);

  // 处理tab切换
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // 在移动设备上，点击选项后自动关闭侧边栏
    setSidebarOpen(false);
  };

  // 切换侧边栏显示/隐藏
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 渲染活动视图
  const renderActiveView = () => {
    if (activeTab === 'team') {
      return <TeamDashboard codeTimeData={codeTimeData} />;
    } else {
      const userData = codeTimeData[activeTab] || [];
      return <UserDetailView userId={activeTab} userData={userData} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>正在获取编码时间数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="sidebar-overlay" onClick={toggleSidebar}></div>

        <main className="app-content">
          <header className="app-header">
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
              <span className="menu-icon">&#9776;</span>
            </button>
            <h1>WakaTime 统计</h1>
            <p>跟踪并可视化团队成员每周的编码活动</p>
          </header>

          <div className="content-container">{renderActiveView()}</div>

          <footer className="app-footer">
            <p>基于 WakaTime API 开发 | {new Date().getFullYear()}</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
