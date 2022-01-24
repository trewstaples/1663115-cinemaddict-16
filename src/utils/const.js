export const KeyboardKeys = {
  ESCAPE: 'Escape',
  ESC: 'Esc',
  ENTER: 'Enter',
  CONTROL: 'Control',
  COMMAND: 'Meta',
};

export const EMOTIONS = ['smile', 'sleeping', 'puke', 'angry'];

export const StringFormats = {
  RELEASE_DATE: 'DD MMMM YYYY',
  RELEASE_YEAR: 'YYYY',
  COMMENT_DATE: 'YYYY/MM/D HH:mm',
  RUNTIME_MINUTES: 'mm[M]',
  RUNTIME_HOURS: 'H[h] mm[m]',
};

export const Runtime = {
  MIN: 50,
  MAX: 180,
  MINUTES_IN_HOUR: 60,
};

export const UserAction = {
  UPDATE_FILM: 'UPDATE_FILM',
  ADD_COMMENT: 'ADD_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
};

export const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
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

export const MenuItem = {
  FILMS: 'FILMS',
  STATS: 'STATS',
};

export const Mode = {
  CARD: 'CARD',
  POPUP: 'POPUP',
};

export const userRanks = {
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
