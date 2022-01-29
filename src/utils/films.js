import dayjs from 'dayjs';

export const createTemplateFromArray = (array, cb) => array.map((item) => cb(item)).join('');

export const getClassName = (element, attribute) => (element ? attribute : '');

const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
};

export const sortFilmsByDate = (filmA, filmB) => {
  const weight = getWeightForNullDate(filmA.dueDate, filmB.dueDate);

  return weight ?? dayjs(filmB.info.release.date).diff(dayjs(filmA.info.release.date));
};

export const sortFilmsByRating = (filmA, filmB) => {
  const ratingA = filmA.info.totalRating;
  const ratingB = filmB.info.totalRating;

  return ratingB - ratingA;
};
