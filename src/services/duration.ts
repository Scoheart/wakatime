import axios from 'axios';
import dayjs from 'dayjs';
import http, { http_get } from './http';

interface durationData {
  time: number;
  project: string;
  category: string;
  duration: number;
  [key: string]: any;
}
interface HourlyActivityData {
  hour: number;
  categories: {
    [category: string]: number; // 每个类别在该小时的秒数
  };
  total?: number; // 添加可选的total属性，表示该小时的总时间
}
function formatHourlyActivityDurations(
  hourlyActivity: HourlyActivityData[]
): HourlyActivityData[] {
  return hourlyActivity.map((item) => {
    // Convert seconds to minutes for each category
    const formattedCategories: { [category: string]: number } = {};
    let totalMinutes = 0; // 初始化总分钟数

    for (const [category, seconds] of Object.entries(item.categories)) {
      const minutes = seconds / 60; // Convert seconds to minutes
      formattedCategories[category] = minutes;
      totalMinutes += minutes; // 累加每个类别的分钟数
    }

    return {
      hour: item.hour,
      categories: formattedCategories,
      total: totalMinutes, // 添加总时间（分钟）
    };
  });
}

const handleDurations = (
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

export const getDuration = async () => {
  const apiKey = import.meta.env.VITE_SHUHAO_API_KEY;
  const res = await http_get('/users/current/durations', {
    params: {
      date: '2025-03-09',
      slice_by: 'category',
    },
    headers: {
      Authorization: `Basic ${btoa(apiKey)}`,
    },
  });
  const durationsData = res.data;
  const hourlyActivity = handleDurations(durationsData.data);
  const formattedHourlyActivity = formatHourlyActivityDurations(hourlyActivity);
  console.log('formattedHourlyActivity', formattedHourlyActivity);
  return formattedHourlyActivity;
};
