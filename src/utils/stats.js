import { StatsType } from './const.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

export const STATS_COUNT = 1;

export const getUserRank = (count, rank = {}) => {
  const profileRank = Object.keys(rank).find((key) => count >= rank[key].MIN && count <= rank[key].MAX);

  return profileRank;
};

const ComparingDate = {
  TODAY: dayjs(Date.now()).toDate(),
  WEEK: dayjs().subtract(STATS_COUNT, 'week').toDate(),
  MONTH: dayjs().subtract(STATS_COUNT, 'month').toDate(),
  YEAR: dayjs().subtract(STATS_COUNT, 'year').toDate(),
};

export const statisticFilter = {
  [StatsType.ALL]: (films) => films.filter((film) => film),
  [StatsType.TODAY]: (films) => films.filter((film) => dayjs(film.userDetails.watchingDate).isSame(ComparingDate.TODAY, 'day')),
  [StatsType.WEEK]: (films) => films.filter((film) => dayjs(film.userDetails.watchingDate).isBetween(ComparingDate.WEEK, ComparingDate.TODAY, 'week', '[]')),
  [StatsType.MONTH]: (films) => films.filter((film) => dayjs(film.userDetails.watchingDate).isBetween(ComparingDate.MONTH, ComparingDate.TODAY, 'month', '[]')),
  [StatsType.YEAR]: (films) => films.filter((film) => dayjs(film.userDetails.watchingDate).isBetween(ComparingDate.YEAR, ComparingDate.TODAY, 'year', '[]')),
};
