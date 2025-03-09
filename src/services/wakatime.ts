import axios from 'axios';
import dayjs from 'dayjs';

// WakaTime API基础URL - 使用代理URL
const API_BASE_URL = '/api/v1';



// 用户信息
export const USERS = [
  { id: 'user1', name: '于亮', color: '#FF6384' },
  { id: 'user2', name: '舒镐', color: '#36A2EB' },
  { id: 'user3', name: '周鑫', color: '#FFCE56' },
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
  categories: {
    [categoryName: string]: number; // 每个类别在该小时的秒数
  };
}

// 活动类型和对应的颜色
export const ACTIVITY_TYPES = [
  { id: 'coding', name: '编码', color: '#41B883' },
  { id: 'browsing', name: '浏览', color: '#E46651' },
  { id: 'design', name: '设计', color: '#00D8FF' },
  { id: 'debugging', name: '调试', color: '#8A2BE2' },
  { id: 'meeting', name: '会议', color: '#FF7F50' },
  { id: 'research', name: '研究', color: '#4169E1' },
  { id: 'writing', name: '文档', color: '#32CD32' },
  { id: 'learning', name: '学习', color: '#FFD700' },
];

// 根据类别ID获取活动类型信息
export const getActivityTypeById = (id: string) => {
  const activityType = ACTIVITY_TYPES.find((type) => type.id === id);
  if (activityType) return activityType;

  // 如果不存在，返回一个默认值
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1), // 首字母大写
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 随机颜色
  };
};

// 模拟数据 - 用于开发和演示
const MOCK_DATA = {
  generateMockData: (userId: string): CodeTimeData[] => {
    const today = dayjs();
    const result: CodeTimeData[] = [];

    // 编程语言列表
    const languages = [
      'JavaScript',
      'TypeScript',
      'Python',
      'HTML',
      'CSS',
      'Java',
      'C++',
      'Go',
      'Rust',
    ];
    // 编辑器列表
    const editors = [
      'VS Code',
      'WebStorm',
      'PyCharm',
      'IntelliJ IDEA',
      'Vim',
      'Sublime Text',
    ];
    // 项目列表
    const projects = [
      'Frontend',
      'Backend',
      'Mobile App',
      'API',
      'Documentation',
      'Testing',
    ];
    // 类别列表
    const categories = [
      'Coding',
      'Debugging',
      'Building',
      'Designing',
      'Researching',
    ];
    // 操作系统列表
    const os = ['macOS', 'Windows', 'Linux'];
    // 机器列表
    const machines = ['MacBook Pro', 'Desktop PC', 'Work Laptop'];

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      // 随机生成1-8小时的编码时间（以秒为单位）
      const totalSeconds = Math.floor(Math.random() * 7 * 3600) + 3600;

      // 为每种统计类型生成随机数据
      const generateRandomStats = <
        T extends { name: string; seconds: number; percent: number }
      >(
        items: string[],
        total: number
      ): T[] => {
        let remaining = 100;
        let remainingSeconds = total;

        return items
          .slice(0, Math.floor(Math.random() * 5) + 3)
          .map((name, index, arr) => {
            const isLast = index === arr.length - 1;
            const percent = isLast
              ? remaining
              : Math.floor(Math.random() * (remaining - 5)) + 5;
            const seconds = isLast
              ? remainingSeconds
              : Math.floor((total * percent) / 100);

            remaining -= percent;
            remainingSeconds -= seconds;

            return { name, seconds, percent } as T;
          })
          .sort((a, b) => b.seconds - a.seconds); // 按时间降序排序
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

        // 定义可能的类别
        const categoryTypes = [
          'coding',
          'browsing',
          'design',
          'debugging',
          'meeting',
          'research',
        ];

        // 为用户随机选择3-5个主要类别
        const userCategories = categoryTypes
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 3) + 3);

        // 设置用户的类别偏好（不同用户有不同的类别分配）
        const userPreference: Record<string, number> = {};
        let remainingShare = 1.0;

        userCategories.forEach((category, index, array) => {
          const isLast = index === array.length - 1;
          const share = isLast
            ? remainingShare
            : Math.random() * (remainingShare - 0.1) + 0.1;
          userPreference[category] = share;
          remainingShare -= share;
        });

        for (let hour = 0; hour < 24; hour++) {
          const hourWeight = getHourWeight(hour);
          const maxSecondsPerHour = 60 * 60; // 一小时最多3600秒

          // 根据时间段的权重确定该小时的活动总量
          const totalHourActivity = Math.floor(
            maxSecondsPerHour * hourWeight * Math.random()
          );

          // 基于用户偏好分配不同类别的时间
          const categories: Record<string, number> = {};

          userCategories.forEach((category) => {
            categories[category] = Math.floor(
              totalHourActivity *
                userPreference[category] *
                (0.8 + Math.random() * 0.4)
            );
          });

          hourlyData.push({
            hour,
            categories,
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
        hourlyActivity: generateHourlyActivity(),
      });
    }

    return result;
  },
};

// 获取用户一周的编码时间
export const getUserWeeklyStats = async (
  userId: string,
  useMockData = true
): Promise<CodeTimeData[]> => {
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
          end,
        },
        headers: {
          Authorization: `Basic ${btoa(
            API_KEYS[userId as keyof typeof API_KEYS]
          )}`,
        },
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
      hourlyActivity: MOCK_DATA.generateMockData(userId)[0].hourlyActivity,
    }));
  } catch (error) {
    console.error('获取WakaTime数据失败:', error);
    // 如果API请求失败，回退到模拟数据
    return MOCK_DATA.generateMockData(userId);
  }
};

// 获取多个用户一周的编码时间
export const getMultipleUsersWeeklyStats = async (
  useMockData = true
): Promise<MultiUserCodeTimeData> => {
  const results: MultiUserCodeTimeData = {};

  for (const user of USERS) {
    const userData = await getUserWeeklyStats(user.id, useMockData);
    results[user.id] = userData;
  }

  return results;
};

// 计算团队总的编码统计
export const getTeamTotalStats = (
  data: MultiUserCodeTimeData
): {
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
  const mergeStats = <
    T extends { name: string; seconds: number; percent: number }
  >(
    allStats: T[][]
  ): T[] => {
    const merged: { [key: string]: T } = {};

    allStats.flat().forEach((stat) => {
      if (merged[stat.name]) {
        merged[stat.name].seconds += stat.seconds;
      } else {
        merged[stat.name] = { ...stat };
      }
    });

    // 计算总秒数
    const total = Object.values(merged).reduce(
      (sum, stat) => sum + stat.seconds,
      0
    );

    // 重新计算百分比
    return Object.values(merged)
      .map((stat) => ({
        ...stat,
        percent: total ? Math.round((stat.seconds / total) * 100) : 0,
      }))
      .sort((a, b) => b.seconds - a.seconds);
  };

  // 获取所有用户的所有日期
  const allDates = new Set<string>();

  Object.values(data).forEach((userData) => {
    userData.forEach((day) => {
      allDates.add(day.date);
      totalSeconds += day.seconds;
    });
  });

  // 按日期组织数据
  const dateMap = new Map<string, CodeTimeData>();

  allDates.forEach((date) => {
    const dayData: CodeTimeData = {
      date,
      seconds: 0,
      languages: [],
      editors: [],
      projects: [],
      categories: [],
      operatingSystems: [],
      machines: [],
      hourlyActivity: [],
    };

    // 汇总所有用户在该日期的数据
    Object.values(data).forEach((userData) => {
      const userDay = userData.find((day) => day.date === date);
      if (userDay) {
        dayData.seconds += userDay.seconds;

        if (userDay.languages)
          dayData.languages = [
            ...(dayData.languages || []),
            ...userDay.languages,
          ];
        if (userDay.editors)
          dayData.editors = [...(dayData.editors || []), ...userDay.editors];
        if (userDay.projects)
          dayData.projects = [...(dayData.projects || []), ...userDay.projects];
        if (userDay.categories)
          dayData.categories = [
            ...(dayData.categories || []),
            ...userDay.categories,
          ];
        if (userDay.operatingSystems)
          dayData.operatingSystems = [
            ...(dayData.operatingSystems || []),
            ...userDay.operatingSystems,
          ];
        if (userDay.machines)
          dayData.machines = [...(dayData.machines || []), ...userDay.machines];
      }
    });

    dateMap.set(date, dayData);
  });

  // 转换回数组并按日期排序
  const sortedDates = Array.from(allDates).sort();
  sortedDates.forEach((date) => {
    const dayData = dateMap.get(date);
    if (dayData) {
      dailyStats.push(dayData);
    }
  });

  // 提取所有天的统计数据
  const allLanguages = dailyStats.map((day) => day.languages || []);
  const allEditors = dailyStats.map((day) => day.editors || []);
  const allProjects = dailyStats.map((day) => day.projects || []);
  const allCategories = dailyStats.map((day) => day.categories || []);
  const allOS = dailyStats.map((day) => day.operatingSystems || []);
  const allMachines = dailyStats.map((day) => day.machines || []);

  // 合并团队的小时活动数据（取最近的一天作为示例）
  const latestDayData = Object.values(data)[0]?.[0];
  const hourlyActivity = latestDayData?.hourlyActivity
    ? [...latestDayData.hourlyActivity]
    : undefined;

  // 如果有小时活动数据，合并所有用户的数据
  if (hourlyActivity) {
    // 收集所有可能的类别
    const allCategoryNames = new Set<string>();

    // 查找所有用户使用的类别
    Object.values(data).forEach((userData) => {
      const latestDay = userData[0];
      if (latestDay?.hourlyActivity) {
        latestDay.hourlyActivity.forEach((hourData) => {
          Object.keys(hourData.categories).forEach((category) => {
            allCategoryNames.add(category);
          });
        });
      }
    });

    // 初始化团队小时活动数据
    const teamHourlyActivity = hourlyActivity.map((hourData) => {
      const categoriesObj: Record<string, number> = {};
      // 初始化所有类别为0
      Array.from(allCategoryNames).forEach((category) => {
        categoriesObj[category] = 0;
      });

      return {
        hour: hourData.hour,
        categories: categoriesObj,
      };
    });

    // 合并所有用户的小时活动数据
    Object.values(data).forEach((userData) => {
      const latestDay = userData[0];
      if (latestDay?.hourlyActivity) {
        latestDay.hourlyActivity.forEach((hourData, index) => {
          // 动态地合并各个类别的数据
          Object.entries(hourData.categories).forEach(([category, seconds]) => {
            teamHourlyActivity[index].categories[category] += seconds;
          });
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
      hourlyActivity: teamHourlyActivity,
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
    machines: mergeStats<MachineData>(allMachines),
  };
};

/**
 * 获取用户在指定日期的按小时活动持续时间
 * 使用WakaTime Durations API: GET /api/v1/users/current/durations
 *
 * 示例用法:
 * // 获取特定用户在特定日期的按小时活动数据
 * const userHourlyActivity = await getUserDurationsByHour('user1', '2023-05-15');
 *
 * // 按项目过滤
 * const projectHourlyActivity = await getUserDurationsByHour('user1', '2023-05-15', 'my-project');
 *
 * // 按不同维度切片(语言/编辑器等)
 * const languageHourlyActivity = await getUserDurationsByHour('user1', '2023-05-15', undefined, 'language');
 */
export const getUserDurationsByHour = async (
  userId: string,
  date: string,
  projectFilter?: string,
  sliceBy: string = 'category', // 按类别分类
  useMockData = true
): Promise<HourlyActivityData[]> => {
  // 如果使用模拟数据
  // if (useMockData) {
  //   // 调用现有的模拟数据生成函数
  //   const mockData = await getUserWeeklyStats(userId, true);
  //   const dayData = mockData.find(day => day.date === date);
  //   return dayData?.hourlyActivity || [];
  // }

  try {
    // 从指定日期的开始到结束
    const requestDate = dayjs(date);

    // 准备请求参数
    const params: Record<string, string> = {
      date: requestDate.format('YYYY-MM-DD'),
      slice_by: sliceBy,
    };

    // 添加可选的项目过滤器
    if (projectFilter) {
      params.project = projectFilter;
    }

    // 获取API密钥
    const apiKey = API_KEYS[userId as keyof typeof API_KEYS];
    if (!apiKey) {
      throw new Error(`未找到用户 ${userId} 的API密钥`);
    }

    // 发送API请求
    const response = await axios.get(
      `${API_BASE_URL}/users/current/durations`,
      {
        params,
        headers: {
          Authorization: `Basic ${btoa(apiKey)}`,
        },
      }
    );

    // 处理响应数据
    if (response.data && response.data.data) {
      console.log('response.data.data', response.data.data);
      // 将原始的持续时间数据处理为按小时的数据，精确处理跨小时的持续时间
      return formatHourlyActivityDurations(
        handleDurations(response.data.data)
      );
    }

    return [];
  } catch (error) {
    console.error('获取用户活动持续时间失败:', error);
    return [];
  }
};

/**
 * 获取团队在指定日期的按小时活动持续时间
 *
 * 示例用法:
 * // 获取团队在特定日期的按小时活动数据
 * const teamHourlyActivity = await getTeamDurationsByHour('2023-05-15');
 *
 * // 格式化为分钟显示，用于图表
 * const formattedData = formatHourlyActivityDurations(teamHourlyActivity);
 *
 * // 查找最活跃的类别和时间段
 * const { mostActiveCategory, mostActiveHour } = getMostActiveInfo(teamHourlyActivity);
 */
export const getTeamDurationsByHour = async (
  date: string,
  projectFilter?: string,
  sliceBy: string = 'category',
  useMockData = true
): Promise<HourlyActivityData[]> => {
  // 获取所有用户的ID
  const userIds = USERS.map((user) => user.id);

  // 创建24小时的数据结构
  const teamHourlyActivity: HourlyActivityData[] = Array.from(
    { length: 24 },
    (_, i) => ({
      hour: i,
      categories: {},
    })
  );

  // 收集所有用户的数据
  const allUserPromises = userIds.map((userId) =>
    getUserDurationsByHour(userId, date, projectFilter, sliceBy, useMockData)
  );

  try {
    // 等待所有用户的数据
    const results = await Promise.all(allUserPromises);

    // 合并所有用户的数据
    results.forEach((userHourlyActivity) => {
      if (userHourlyActivity && userHourlyActivity.length > 0) {
        userHourlyActivity.forEach((hourData, hourIndex) => {
          // 对每个类别，累加到团队总计中
          Object.entries(hourData.categories).forEach(([category, seconds]) => {
            if (!teamHourlyActivity[hourIndex].categories[category]) {
              teamHourlyActivity[hourIndex].categories[category] = 0;
            }
            teamHourlyActivity[hourIndex].categories[category] += seconds;
          });
        });
      }
    });

    return teamHourlyActivity;
  } catch (error) {
    console.error('获取团队活动持续时间失败:', error);
    return teamHourlyActivity;
  }
};

/**
 * 格式化HourlyActivityData中的秒数为分钟或小时
 * @param data 原始小时活动数据
 * @param format 转换格式，'minutes'或'hours'
 * @returns 格式化后的数据
 */
export const formatHourlyActivityDurations = (
  data: HourlyActivityData[],
  format: 'minutes' | 'hours' = 'minutes'
): HourlyActivityData[] => {
  if (!data || data.length === 0) return [];

  return data.map((hourData) => {
    const formattedCategories: Record<string, number> = {};

    Object.entries(hourData.categories).forEach(([category, seconds]) => {
      if (format === 'minutes') {
        // 转换为分钟，保留1位小数
        formattedCategories[category] = parseFloat((seconds / 60).toFixed(1));
      } else if (format === 'hours') {
        // 转换为小时，保留2位小数
        formattedCategories[category] = parseFloat((seconds / 3600).toFixed(2));
      }
    });

    return {
      hour: hourData.hour,
      categories: formattedCategories,
    };
  });
};

/**
 * 计算每个类别在所有小时的总时长
 * @param data 小时活动数据
 * @returns 每个类别的总时长（秒）
 */
export const calculateTotalDurationsByCategory = (
  data: HourlyActivityData[]
): Record<string, number> => {
  if (!data || data.length === 0) return {};

  const totalByCategory: Record<string, number> = {};

  data.forEach((hourData) => {
    Object.entries(hourData.categories).forEach(([category, seconds]) => {
      if (!totalByCategory[category]) {
        totalByCategory[category] = 0;
      }
      totalByCategory[category] += seconds;
    });
  });

  return totalByCategory;
};

/**
 * 获取指定日期最活跃的类别和时间段
 * @param data 小时活动数据
 * @returns 最活跃信息
 */
export const getMostActiveInfo = (
  data: HourlyActivityData[]
): {
  mostActiveCategory: { name: string; seconds: number } | null;
  mostActiveHour: { hour: number; seconds: number } | null;
} => {
  if (!data || data.length === 0) {
    return { mostActiveCategory: null, mostActiveHour: null };
  }

  // 计算每个类别的总秒数
  const totalByCategory = calculateTotalDurationsByCategory(data);

  // 找出最活跃的类别
  let mostActiveCategory: { name: string; seconds: number } | null = null;
  Object.entries(totalByCategory).forEach(([category, seconds]) => {
    if (!mostActiveCategory || seconds > mostActiveCategory.seconds) {
      mostActiveCategory = { name: category, seconds };
    }
  });

  // 计算每个小时的总秒数
  const hourlyTotal = data.map((hourData) => {
    const total = Object.values(hourData.categories).reduce(
      (sum, seconds) => sum + seconds,
      0
    );
    return { hour: hourData.hour, seconds: total };
  });

  // 找出最活跃的小时
  const maxHour = hourlyTotal.reduce(
    (max, current) => (current.seconds > max.seconds ? current : max),
    { hour: -1, seconds: 0 }
  );

  // 如果没有活动，返回null
  let mostActiveHour: { hour: number; seconds: number } | null = maxHour;
  if (mostActiveHour.seconds === 0) {
    mostActiveHour = null;
  }

  return {
    mostActiveCategory,
    mostActiveHour,
  };
};

/**
 * 将WakaTime Durations API的原始响应数据处理为按小时的活动数据
 *
 * @param durationsData WakaTime API返回的原始持续时间数据
 * @param date 日期字符串，用于确定时区
 * @param sliceBy 切片维度，默认为'category'
 * @returns 按小时整理的活动数据
 */
export const processDurationsToHourly = (
  durationsData: Array<{
    time: number;
    project: string;
    category: string;
    duration: number;
    [key: string]: any; // 支持其他可能的字段
  }>,
  date: string,
  sliceBy: string = 'category'
): HourlyActivityData[] => {
  // 创建24小时的数据结构
  const hourlyActivity: HourlyActivityData[] = Array.from(
    { length: 24 },
    (_, i) => ({
      hour: i,
      categories: {},
    })
  );

  // 确定日期的起始时间
  const startOfDay = dayjs(date).startOf('day');

  // 处理每个持续时间记录
  durationsData.forEach((duration) => {
    // 从时间戳创建dayjs对象
    const startTime = dayjs(duration.time * 1000); // 转换为毫秒

    // 提取分类值 (category, language, editor等)
    const categoryValue = duration[sliceBy] || 'uncategorized';

    // 确定此活动发生在哪个小时
    const hour = startTime.hour();

    // 确保当前小时的这个类别已初始化
    if (!hourlyActivity[hour].categories[categoryValue]) {
      hourlyActivity[hour].categories[categoryValue] = 0;
    }

    // 累加持续时间
    hourlyActivity[hour].categories[categoryValue] += duration.duration;
  });

  // 跨小时的持续时间处理说明:
  // 此简单实现将持续时间完全归到开始的小时
  // 对于跨小时的长时间活动，可以考虑实现更复杂的分配逻辑

  return hourlyActivity;
};

/**
 * 处理跨小时的持续时间数据
 * 此函数实现更精确的时间分配，将持续时间按实际跨越的小时分配
 *
 * @param durationsData WakaTime API返回的原始持续时间数据
 * @param date 日期字符串，用于确定时区
 * @param sliceBy 切片维度，默认为'category'
 * @returns 按小时整理的活动数据
 */

interface durationData {
  time: number;
  project: string;
  category: string;
  duration: number;
  [key: string]: any;
}
export interface HourlyActivityData {
  hour: number;
  categories: {
    [categoryName: string]: number; // 每个类别在该小时的秒数
  };
}
export const handleDurations = (
  durationsData: durationData[]
): HourlyActivityData[] => {
  // 创建24小时的数据结构
  const hourlyActivity: HourlyActivityData[] = Array.from(
    { length: 24 },
    (_, i) => ({
      hour: i,
      categories: {},
    })
  );

  // 处理每个持续时间记录
  durationsData.forEach((d) => {
    const startTime = dayjs(d.time * 1000); // 转换为毫秒
    const endTime = startTime.add(d.duration, 'second');
    const categoryValue = d.category || 'uncategorized';
    const startHour = startTime.hour();
    const endHour = endTime.hour();

    if (startHour === endHour) {
      // 如果开始和结束在同一个小时内 直接将整个持续时间添加到该小时
      if (!hourlyActivity[startHour].categories[categoryValue]) {
        hourlyActivity[startHour].categories[categoryValue] = 0;
      }
      hourlyActivity[startHour].categories[categoryValue] += d.duration;
    }
    // 如果跨越多个小时
    else {
      // 计算第一个小时内的秒数
      const firstHourEndTime = startTime.startOf('hour').add(1, 'hour');
      const remainSecondsInFirstHour = firstHourEndTime.diff(
        startTime,
        'second'
      );

      // 将第一个小时的时间添加到相应的小时
      if (!hourlyActivity[startHour].categories[categoryValue]) {
        hourlyActivity[startHour].categories[categoryValue] = 0;
      }
      hourlyActivity[startHour].categories[categoryValue] +=
        remainSecondsInFirstHour;

      // 处理中间的整小时(如果有的话)
      let currentHour = startHour + 1;
      console.log('currentHour', currentHour, 'endHour', endHour);
      while (currentHour < endHour) {
        if (!hourlyActivity[currentHour].categories[categoryValue]) {
          hourlyActivity[currentHour].categories[categoryValue] = 0;
        }
        // 每小时3600秒
        hourlyActivity[currentHour].categories[categoryValue] += 3600;
        currentHour++;
      }

      // 处理最后一个小时(如果结束时间不是整点)
      if (endTime.minute() > 0 || endTime.second() > 0) {
        const secondsInLastHour = endTime.diff(
          endTime.startOf('hour'),
          'second'
        );
        if (secondsInLastHour > 0) {
          if (!hourlyActivity[endHour].categories[categoryValue]) {
            hourlyActivity[endHour].categories[categoryValue] = 0;
          }
          hourlyActivity[endHour].categories[categoryValue] +=
            secondsInLastHour;
        }
      }
    }
  });

  return hourlyActivity;
};

/**
 * 将活动数据转换为按类别汇总的格式，包含总计
 *
 * @param data 原始持续时间数据或已处理的小时活动数据
 * @param date 日期字符串（若传入原始数据）
 * @param sliceBy 切片维度（若传入原始数据）
 * @returns 包含各类别总计和总时长的对象
 */
export const calculateCategoryTotalsWithOverall = (
  data:
    | HourlyActivityData[]
    | Array<{
        time: number;
        project: string;
        category: string;
        duration: number;
        [key: string]: any;
      }>,
  date?: string,
  sliceBy: string = 'category'
): Record<string, number> => {
  let hourlyData: HourlyActivityData[];

  // 判断传入的是原始持续时间数据还是已处理的小时活动数据
  if (!Array.isArray(data) || data.length === 0) {
    return { total: 0 };
  }

  // 检查是否是原始数据（查看第一个元素是否有time属性）
  if ('time' in data[0]) {
    // 是原始持续时间数据，需要先处理
    if (!date) {
      throw new Error('处理原始数据时需要提供日期参数');
    }

    // 使用精确的时间分配处理
    hourlyData = handleDurations(
      data as Array<{
        time: number;
        project: string;
        category: string;
        duration: number;
        [key: string]: any;
      }>,
      date,
      sliceBy
    );
  } else {
    // 已经是处理过的小时数据
    hourlyData = data as HourlyActivityData[];
  }

  // 计算每个类别的总时长
  const categoryTotals = calculateTotalDurationsByCategory(hourlyData);

  // 计算所有类别的总和
  const overallTotal = Object.values(categoryTotals).reduce(
    (sum, seconds) => sum + seconds,
    0
  );

  // 将总计添加到结果中
  return {
    ...categoryTotals,
    total: overallTotal,
  };
};

/**
 * 将类别总计数据格式化为不同的时间单位（秒、分钟、小时）
 *
 * @param totals 类别总计数据
 * @param format 时间格式
 * @returns 格式化后的总计数据
 */
export const formatCategoryTotals = (
  totals: Record<string, number>,
  format: 'seconds' | 'minutes' | 'hours' = 'seconds'
): Record<string, number> => {
  const formatted: Record<string, number> = {};

  Object.entries(totals).forEach(([category, seconds]) => {
    if (format === 'minutes') {
      // 转换为分钟，保留1位小数
      formatted[category] = parseFloat((seconds / 60).toFixed(1));
    } else if (format === 'hours') {
      // 转换为小时，保留2位小数
      formatted[category] = parseFloat((seconds / 3600).toFixed(2));
    } else {
      // 保持秒，四舍五入到整数
      formatted[category] = Math.round(seconds);
    }
  });

  return formatted;
};

// 更复杂的示例用法:
// const apiResponse = {
//   "data": [
//     {
//       "time": 1741483910.89353,
//       "project": "frontcode",
//       "category": "Coding",
//       "duration": 896.124806
//     },
//     {
//       "time": 1741485107.345835,
//       "project": "frontcode",
//       "category": "Coding",
//       "duration": 0.0
//     },
//     {
//       "time": 1741485683.728169,
//       "project": "frontcode",
//       "category": "Coding",
//       "duration": 3031.140822
//     },
//     {
//       "time": 1741492801.58,
//       "project": "web-ai-project01",
//       "category": "Coding",
//       "duration": 0.288
//     },
//     {
//       "time": 1741493102.305,
//       "project": "web-ai-project01",
//       "category": "Browsing",
//       "duration": 1536
//     }
//   ]
// };
//
// // 从API响应中提取持续时间数据
// const durationsData = apiResponse.data;
//
// // 直接计算分类汇总（按category分类）
// const categoryTotals = calculateCategoryTotalsWithOverall(durationsData, '2023-07-07');
//
// // 转换为分钟格式
// const minuteTotals = formatCategoryTotals(categoryTotals, 'minutes');
// console.log(minuteTotals);
// /* 输出:
//   {
//     "Coding": 65.5,
//     "Browsing": 25.6,
//     "total": 91.1
//   }
// */
//
// // 按project切片来计算各项目的总时长
// const projectTotals = calculateCategoryTotalsWithOverall(durationsData, '2023-07-07', 'project');
// const projectMinutes = formatCategoryTotals(projectTotals, 'minutes');
// console.log(projectMinutes);
// /* 输出:
//   {
//     "frontcode": 65.5,
//     "web-ai-project01": 25.6,
//     "total": 91.1
//   }
// */
