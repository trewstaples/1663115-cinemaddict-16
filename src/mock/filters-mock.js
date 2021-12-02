const filmToFilterMap = {
  watchlist: (films) => films.filter((film) => film.userDetails.watchlist).length,
  history: (films) => films.filter((film) => film.userDetails.alreadyWatched).length,
  favorites: (films) => films.filter((film) => film.userDetails.favorite).length,
};

export const generateFilter = (films) =>
  Object.entries(filmToFilterMap).map(([filterName, countFilms]) => ({
    name: filterName,
    count: countFilms(films),
  }));
