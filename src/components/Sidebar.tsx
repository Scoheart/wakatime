import { USERS } from '../services/wakatime';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface TabItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const tabs: TabItem[] = [
    { id: 'team', name: '团队统计', icon: '👥' },
    ...USERS.map(user => ({
      id: user.id,
      name: user.name,
      icon: '👤',
      color: user.color
    }))
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>WakaTime 统计</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {tabs.map(tab => (
            <li 
              key={tab.id} 
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              style={tab.id !== 'team' && activeTab === tab.id && tab.color ? { borderColor: tab.color } : {}}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-text">{tab.name}</span>
              {tab.id !== 'team' && tab.color && (
                <span 
                  className="user-color-indicator" 
                  style={{ backgroundColor: tab.color }}
                ></span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>基于 WakaTime API</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Sidebar; 