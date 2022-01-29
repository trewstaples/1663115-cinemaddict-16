export const Film = {
  RANK_NONE: 'None',
  GENRE_MIN: 1,
  DESCRIPTION_END: 139,
  DESCRIPTION_MAX: 140,
  FILTERED_FILMS_AMOUNT: 1,
  EMOTIONS: ['smile', 'sleeping', 'puke', 'angry'],
};

export const Server = {
  END_POINT: 'https://16.ecmascript.pages.academy/cinemaddict',
  AUTHORIZATION: 'Basic jfoiye98yfdc6',
};

export const UserAction = {
  UPDATE_FILM: 'UPDATE_FILM',
  ADD_COMMENT: 'ADD_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
  INIT: 'INIT',
};

export const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

export const MenuItem = {
  FILMS: 'FILMS',
  STATS: 'STATS',
};

export const Mode = {
  CARD: 'CARD',
  POPUP: 'POPUP',
};

export const FilterType = {
  ALL: 'all',
  WATCHLIST: 'watchlist',
  HISTORY: 'history',
  FAVORITES: 'favorites',
};

export const StatsType = {
  ALL: 'all-time',
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const StringFormat = {
  RELEASE_DATE: 'DD MMMM YYYY',
  RELEASE_YEAR: 'YYYY',
  COMMENT_DATE: 'YYYY/MM/D HH:mm',
  RUNTIME_HOURS: 'H[h] mm[m]',
};

export const KeyboardKey = {
  ESCAPE: 'Escape',
  ESC: 'Esc',
  ENTER: 'Enter',
  CONTROL: 'Control',
  COMMAND: 'Meta',
};

export const Runtime = {
  MIN: 50,
  MAX: 180,
};

export const userRank = {
  None: {
    MIN: 0,
    MAX: 0,
  },
  Novice: {
    MIN: 1,
    MAX: 10,
  },
  Fan: {
    MIN: 11,
    MAX: 20,
  },
  'Movie Buff': {
    MIN: 21,
    MAX: Infinity,
  },
};
