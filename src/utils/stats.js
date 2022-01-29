import { StatsType } from './const.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

export const STATS_COUNT = 1;

const ComparingDate = {
  TODAY: dayjs().toDate(),
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

export const getUserRank = (count, rank = {}) => {
  const profileRank = Object.keys(rank).find((key) => count >= rank[key].MIN && count <= rank[key].MAX);

  return profileRank;
};

export const getGenres = (films) => {
  const genresStats = {};

  films.map((film) => {
    film.info.genre.forEach((genre) => {
      if (genre in genresStats) {
        genresStats[genre]++;
      } else {
        genresStats[genre] = 1;
      }
    });
  });

  return genresStats;
};

export const getTopGenre = (films) => {
  if (films.length === 0) {
    return '';
  }

  const genresStats = getGenres(films);
  const topGenre = Object.entries(genresStats).sort((a, b) => b[1] - a[1])[0][0];

  return topGenre;
};
