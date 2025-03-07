import axios from 'axios';
import dayjs from 'dayjs';

// WakaTime API基础URL - 使用代理URL
const API_BASE_URL = '/api/wakatime';

const API_KEYS = {
  user1: 'YOUR_WAKATIME_API_KEY_HERE',
  user2: 'YOUR_WAKATIME_API_KEY_HERE',
  user3: 'YOUR_WAKATIME_API_KEY_HERE'
};

// 用户信息
export const USERS = [
  { id: 'user1', name: '于亮', color: '#FF6384' },
  { id: 'user2', name: '舒镐', color: '#36A2EB' },
  { id: 'user3', name: '周鑫', color: '#FFCE56' }
];

// 定义编码时间数据类型
export interface CodeTimeData {
  date: string;
  seconds: number;
  languages?: LanguageData[];
  editors?: EditorData[];
  projects?: ProjectData[];
  categories?: CategoryData[];
  operatingSystems?: OSData[];
  machines?: MachineData[];
  hourlyActivity?: HourlyActivityData[];
}

// 定义多个用户编码时间结果类型
export interface MultiUserCodeTimeData {
  [userId: string]: CodeTimeData[];
}

// 语言统计数据
export interface LanguageData {
  name: string;
  seconds: number;
  percent: number;
}

// 编辑器统计数据
export interface EditorData {
  name: string;
  seconds: number;
  percent: number;
}

// 项目统计数据
export interface ProjectData {
  name: string;
  seconds: number;
  percent: number;
}

// 类别统计数据
export interface CategoryData {
  name: string;
  seconds: number;
  percent: number;
}

// 操作系统统计数据
export interface OSData {
  name: string;
  seconds: number;
  percent: number;
}

// 机器统计数据
export interface MachineData {
  name: string;
  seconds: number;
  percent: number;
}

// 新增：小时活动数据类型
export interface HourlyActivityData {
  hour: number;
  activities: {
    coding: number;
    browsing: number;
    design: number;
    debugging: number;
  };
}

// 活动类型和对应的颜色
export const ACTIVITY_TYPES = [
  { id: 'coding', name: '编码', color: '#41B883' },
  { id: 'browsing', name: '浏览', color: '#E46651' },
  { id: 'design', name: '设计', color: '#00D8FF' },
  { id: 'debugging', name: '调试', color: '#8A2BE2' }
];

// 模拟数据 - 用于开发和演示
const MOCK_DATA = {
  generateMockData: (userId: string): CodeTimeData[] => {
    const today = dayjs();
    const result: CodeTimeData[] = [];
    
    // 编程语言列表
    const languages = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'Java', 'C++', 'Go', 'Rust'];
    // 编辑器列表
    const editors = ['VS Code', 'WebStorm', 'PyCharm', 'IntelliJ IDEA', 'Vim', 'Sublime Text'];
    // 项目列表
    const projects = ['Frontend', 'Backend', 'Mobile App', 'API', 'Documentation', 'Testing'];
    // 类别列表
    const categories = ['Coding', 'Debugging', 'Building', 'Designing', 'Researching'];
    // 操作系统列表
    const os = ['macOS', 'Windows', 'Linux'];
    // 机器列表
    const machines = ['MacBook Pro', 'Desktop PC', 'Work Laptop'];
    
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      // 随机生成1-8小时的编码时间（以秒为单位）
      const totalSeconds = Math.floor(Math.random() * 7 * 3600) + 3600;
      
      // 为每种统计类型生成随机数据
      const generateRandomStats = <T extends { name: string; seconds: number; percent: number }>(
        items: string[],
        total: number
      ): T[] => {
        let remaining = 100;
        let remainingSeconds = total;
        
        return items.slice(0, Math.floor(Math.random() * 5) + 3).map((name, index, arr) => {
          const isLast = index === arr.length - 1;
          const percent = isLast ? remaining : Math.floor(Math.random() * (remaining - 5)) + 5;
          const seconds = isLast ? remainingSeconds : Math.floor(total * percent / 100);
          
          remaining -= percent;
          remainingSeconds -= seconds;
          
          return { name, seconds, percent } as T;
        }).sort((a, b) => b.seconds - a.seconds); // 按时间降序排序
      };
      
      // 生成24小时的活动数据
      const generateHourlyActivity = (): HourlyActivityData[] => {
        const hourlyData: HourlyActivityData[] = [];
        
        // 设置工作时间段的权重（9点到18点的活动较多）
        const getHourWeight = (hour: number): number => {
          if (hour >= 9 && hour <= 18) return 1.0;
          if (hour >= 7 && hour <= 20) return 0.6;
          if (hour >= 22 || hour <= 5) return 0.1;
          return 0.3;
        };
        
        // 设置用户的活动偏好（不同用户有不同的活动分配）
        const userPreference = {
          coding: userId === 'user1' ? 0.5 : (userId === 'user2' ? 0.4 : 0.3),
          browsing: userId === 'user1' ? 0.2 : (userId === 'user2' ? 0.3 : 0.2),
          design: userId === 'user1' ? 0.1 : (userId === 'user2' ? 0.1 : 0.3),
          debugging: userId === 'user1' ? 0.2 : (userId === 'user2' ? 0.2 : 0.2)
        };
        
        for (let hour = 0; hour < 24; hour++) {
          const hourWeight = getHourWeight(hour);
          const maxSecondsPerHour = 60 * 60; // 一小时最多3600秒
          
          // 根据时间段的权重确定该小时的活动总量
          const totalHourActivity = Math.floor(maxSecondsPerHour * hourWeight * Math.random());
          
          // 基于用户偏好分配不同活动的时间
          const activities = {
            coding: Math.floor(totalHourActivity * userPreference.coding * (0.8 + Math.random() * 0.4)),
            browsing: Math.floor(totalHourActivity * userPreference.browsing * (0.8 + Math.random() * 0.4)),
            design: Math.floor(totalHourActivity * userPreference.design * (0.8 + Math.random() * 0.4)),
            debugging: Math.floor(totalHourActivity * userPreference.debugging * (0.8 + Math.random() * 0.4))
          };
          
          hourlyData.push({ 
            hour, 
            activities 
          });
        }
        
        return hourlyData;
      };
      
      result.push({
        date: date.format('YYYY-MM-DD'),
        seconds: totalSeconds,
        languages: generateRandomStats<LanguageData>(languages, totalSeconds),
        editors: generateRandomStats<EditorData>(editors, totalSeconds),
        projects: generateRandomStats<ProjectData>(projects, totalSeconds),
        categories: generateRandomStats<CategoryData>(categories, totalSeconds),
        operatingSystems: generateRandomStats<OSData>(os, totalSeconds),
        machines: generateRandomStats<MachineData>(machines, totalSeconds),
        hourlyActivity: generateHourlyActivity()
      });
    }
    
    return result;
  }
};

// 获取用户一周的编码时间
export const getUserWeeklyStats = async (userId: string, useMockData = true): Promise<CodeTimeData[]> => {
  try {
    if (useMockData) {
      return MOCK_DATA.generateMockData(userId);
    }
    
    // 计算7天前的日期
    const start = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    const end = dayjs().format('YYYY-MM-DD');
    
    // 发送API请求获取真实数据
    const response = await axios.get(
      `${API_BASE_URL}/users/current/summaries`,
      {
        params: {
          start,
          end
        },
        headers: {
          'Authorization': `Basic ${btoa(API_KEYS[userId as keyof typeof API_KEYS])}`
        }
      }
    );
    
    // 处理响应数据
    return response.data.data.map((item: any) => ({
      date: item.range.date,
      seconds: item.grand_total.total_seconds,
      languages: item.languages || [],
      editors: item.editors || [],
      projects: item.projects || [],
      categories: item.categories || [],
      operatingSystems: item.operating_systems || [],
      machines: item.machines || [],
      hourlyActivity: MOCK_DATA.generateMockData(userId)[0].hourlyActivity
    }));
  } catch (error) {
    console.error('获取WakaTime数据失败:', error);
    // 如果API请求失败，回退到模拟数据
    return MOCK_DATA.generateMockData(userId);
  }
};

// 获取多个用户一周的编码时间
export const getMultipleUsersWeeklyStats = async (useMockData = true): Promise<MultiUserCodeTimeData> => {
  const results: MultiUserCodeTimeData = {};
  
  for (const user of USERS) {
    const userData = await getUserWeeklyStats(user.id, useMockData);
    results[user.id] = userData;
  }
  
  return results;
};

// 计算团队总的编码统计
export const getTeamTotalStats = (data: MultiUserCodeTimeData): {
  totalSeconds: number;
  dailyStats: CodeTimeData[];
  languages: LanguageData[];
  editors: EditorData[];
  projects: ProjectData[];
  categories: CategoryData[];
  operatingSystems: OSData[];
  machines: MachineData[];
  hourlyActivity?: HourlyActivityData[];
} => {
  let totalSeconds = 0;
  const dailyStats: CodeTimeData[] = [];
  
  // 合并类别统计的辅助函数
  const mergeStats = <T extends { name: string; seconds: number; percent: number }>(
    allStats: T[][]
  ): T[] => {
    const merged: { [key: string]: T } = {};
    
    allStats.flat().forEach(stat => {
      if (merged[stat.name]) {
        merged[stat.name].seconds += stat.seconds;
      } else {
        merged[stat.name] = { ...stat };
      }
    });
    
    // 计算总秒数
    const total = Object.values(merged).reduce((sum, stat) => sum + stat.seconds, 0);
    
    // 重新计算百分比
    return Object.values(merged).map(stat => ({
      ...stat,
      percent: total ? Math.round((stat.seconds / total) * 100) : 0
    })).sort((a, b) => b.seconds - a.seconds);
  };
  
  // 获取所有用户的所有日期
  const allDates = new Set<string>();
  
  Object.values(data).forEach(userData => {
    userData.forEach(day => {
      allDates.add(day.date);
      totalSeconds += day.seconds;
    });
  });
  
  // 按日期组织数据
  const dateMap = new Map<string, CodeTimeData>();
  
  allDates.forEach(date => {
    const dayData: CodeTimeData = {
      date,
      seconds: 0,
      languages: [],
      editors: [],
      projects: [],
      categories: [],
      operatingSystems: [],
      machines: [],
      hourlyActivity: []
    };
    
    // 汇总所有用户在该日期的数据
    Object.values(data).forEach(userData => {
      const userDay = userData.find(day => day.date === date);
      if (userDay) {
        dayData.seconds += userDay.seconds;
        
        if (userDay.languages) dayData.languages = [...(dayData.languages || []), ...userDay.languages];
        if (userDay.editors) dayData.editors = [...(dayData.editors || []), ...userDay.editors];
        if (userDay.projects) dayData.projects = [...(dayData.projects || []), ...userDay.projects];
        if (userDay.categories) dayData.categories = [...(dayData.categories || []), ...userDay.categories];
        if (userDay.operatingSystems) dayData.operatingSystems = [...(dayData.operatingSystems || []), ...userDay.operatingSystems];
        if (userDay.machines) dayData.machines = [...(dayData.machines || []), ...userDay.machines];
      }
    });
    
    dateMap.set(date, dayData);
  });
  
  // 转换回数组并按日期排序
  const sortedDates = Array.from(allDates).sort();
  sortedDates.forEach(date => {
    const dayData = dateMap.get(date);
    if (dayData) {
      dailyStats.push(dayData);
    }
  });
  
  // 提取所有天的统计数据
  const allLanguages = dailyStats.map(day => day.languages || []);
  const allEditors = dailyStats.map(day => day.editors || []);
  const allProjects = dailyStats.map(day => day.projects || []);
  const allCategories = dailyStats.map(day => day.categories || []);
  const allOS = dailyStats.map(day => day.operatingSystems || []);
  const allMachines = dailyStats.map(day => day.machines || []);
  
  // 合并团队的小时活动数据（取最近的一天作为示例）
  const latestDayData = Object.values(data)[0]?.[0];
  const hourlyActivity = latestDayData?.hourlyActivity ? [...latestDayData.hourlyActivity] : undefined;
  
  // 如果有小时活动数据，合并所有用户的数据
  if (hourlyActivity) {
    // 初始化团队小时活动数据
    const teamHourlyActivity = hourlyActivity.map(hourData => ({
      hour: hourData.hour,
      activities: {
        coding: 0,
        browsing: 0,
        design: 0,
        debugging: 0
      }
    }));
    
    // 合并所有用户的小时活动数据
    Object.values(data).forEach(userData => {
      const latestDay = userData[0];
      if (latestDay?.hourlyActivity) {
        latestDay.hourlyActivity.forEach((hourData, index) => {
          teamHourlyActivity[index].activities.coding += hourData.activities.coding;
          teamHourlyActivity[index].activities.browsing += hourData.activities.browsing;
          teamHourlyActivity[index].activities.design += hourData.activities.design;
          teamHourlyActivity[index].activities.debugging += hourData.activities.debugging;
        });
      }
    });
    
    return {
      totalSeconds,
      dailyStats,
      languages: mergeStats<LanguageData>(allLanguages),
      editors: mergeStats<EditorData>(allEditors),
      projects: mergeStats<ProjectData>(allProjects),
      categories: mergeStats<CategoryData>(allCategories),
      operatingSystems: mergeStats<OSData>(allOS),
      machines: mergeStats<MachineData>(allMachines),
      hourlyActivity: teamHourlyActivity
    };
  }
  
  return {
    totalSeconds,
    dailyStats,
    languages: mergeStats<LanguageData>(allLanguages),
    editors: mergeStats<EditorData>(allEditors),
    projects: mergeStats<ProjectData>(allProjects),
    categories: mergeStats<CategoryData>(allCategories),
    operatingSystems: mergeStats<OSData>(allOS),
    machines: mergeStats<MachineData>(allMachines)
  };
}; 