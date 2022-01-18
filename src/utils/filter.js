import { FilterType } from './const';

export const filter = {
  [FilterType.WATCHLIST]: (films) => films.filter((film) => film.isFavorite),
  [FilterType.HISTORY]: (films) => films.filter((film) => film.isHstory),
  [FilterType.FAVORITES]: (films) => films.filter((film) => film.isWatchlist),
};
