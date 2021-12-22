import dayjs from 'dayjs';

export const getClassName = (element, attribute) => (element ? attribute : '');

export const createTemplateFromArray = (array, cb) => array.map((item) => cb(item)).join('');

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

export const sortFilmsByDate = (taskA, taskB) => {
  const weight = getWeightForNullDate(taskA.dueDate, taskB.dueDate);

  return weight ?? dayjs(taskB.dueDate).diff(dayjs(taskA.dueDate));
};

const compareFilmsByRating = (filmA, filmB) => {
  const ratingA = filmA.info.totalRating;
  const ratingB = filmB.info.totalRating;

  return ratingB - ratingA;
};

export const sortFilmsByRating = (array) => array.sort(compareFilmsByRating);
