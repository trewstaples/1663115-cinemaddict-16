import dayjs from 'dayjs';

const TITLES = [
  'Made for Each Other',
  'Popeye the Sailor meets Sinbad the Sailor',
  'Sagebrush Trail',
  'Santa Claus Conquers the Martians',
  'The Dance of Life',
  'The Great Flamarion',
  'The Man with the Golden Arm',
];

const POSTERS = [
  'made-for-each-other.png',
  'popeye-meets-sinbad.png',
  'sagebrush-trail.jpg',
  'santa-claus-conquers-the-martians.jpg',
  'the-dance-of-life.jpg',
  'the-great-flamarion.jpg',
  'the-man-with-the-golden-arm.jpg',
];

const AGE_RATINGS = ['0+', '12+', '16+', '18+'];

const DIRECTORS = ['Christopher Nolan', 'Steven Spielberg', 'Charles Chaplin', 'Vince Gilligan,', 'James Cameron'];

const WRITERS = ['Billy Wilder', 'Sam Esmail', 'David Mamet', 'Frank Darabont', 'Chuck Palahniuk'];

const ACTORS = ['Julia Roberts', 'Aaron Paul', 'Bryan Cranston', 'Rami Malek', 'Kate Winslet'];

const RELEASE_COUNTRIES = ['USA', 'India', 'Australia', 'France', 'Italy'];

const GENRES = ['Musical', 'Western', 'Drama', 'Comedy', 'Cartoon'];

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquet varius magna, non porta ligula feugiat eget. Fusce tristique felis at fermentum pharetra. Aliquam id orci ut lectus varius viverra. Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante. Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum. Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. Sed sed nisi sed augue convallis suscipit in sed felis. Aliquam erat volutpat. Nunc fermentum tortor ac porta dapibus. In rutrum ac purus sit amet tempus.';

const DESCRIPTIONS = TEXT.split('.');

const AUTHORS = ['Alexander Sushko', 'Igor Antonov', 'Evgeniy Lepeshkin', 'Igor Alekseenko', 'Lera Zelenaya'];

const MESSAGES = [
  'Interesting setting and a good cast',
  'Booooooooooring',
  'Very very old. Meh',
  'Almost two hours? Seriously?',
  'A film that changed my life, a true masterpiece, post-credit scene was just amazing omg.',
];

const EMOTIONS = ['smile', 'sleeping', 'puke', 'angry'];

const COMMENTS_MAX = 5;

const totalRating = {
  MIN: 0,
  MAX: 10,
  DECIMALS: 1,
};

const ReleaseYear = {
  MIN: 1895,
  MAX: 2021,
};

const Runtime = {
  MIN: 50,
  MAX: 180,
  MINUTES_IN_HOUR: 60,
};

const getRandomInteger = (min, max) => {
  if (min < 0 || max < 0) {
    return -1;
  }

  if (min > max) {
    [min, max] = [max, min];
  }

  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandomPositiveFloat = (min, max, decimalCount) => {
  if (min < 0 || max < 0) {
    return -1;
  }

  if (min > max) {
    [min, max] = [max, min];
  }
  const number = Math.random() * (max - min + 1) + min;
  return number.toFixed(decimalCount);
};

const getRandomElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

const getRandomElementsList = (elements) => elements.slice(getRandomInteger(0, elements.length - 1));

const getRandomBoolean = () => Boolean(getRandomInteger(0, 1));

const getRandomDate = () => {
  const maxDaysGap = 360;

  const daysGap = getRandomInteger(0, maxDaysGap);

  const formatString = 'YYYY/M/D HH:mm';

  return dayjs().add(-daysGap, 'day').format(formatString);
};

const generateOneComment = (id) => ({
  id,
  author: getRandomElement(AUTHORS),
  date: getRandomDate(),
  comment: getRandomElement(MESSAGES),
  emotion: getRandomElement(EMOTIONS),
});

const generateComments = () => {
  const array = [];
  for (let i = 0; i < getRandomInteger(0, COMMENTS_MAX); i++) {
    array.push(generateOneComment(i));
  }
  return array;
};

const generateReleaseDate = () => {
  const currentYear = dayjs().year();

  const maxYearsGap = currentYear - ReleaseYear.MIN;
  const yearsGap = getRandomInteger(0, maxYearsGap);
  const maxDaysGap = 30;
  const daysGap = getRandomInteger(0, maxDaysGap);

  return dayjs().add(-yearsGap, 'year').add(daysGap, 'day').format('DD MMMM YYYY');
};

console.log(generateReleaseDate());

const generateRuntime = () => {
  const duration = require('dayjs/plugin/duration');
  dayjs.extend(duration);

  let formatString = 'mm[M]';

  const minutesDuration = getRandomInteger(Runtime.MIN, Runtime.MAX);

  if (minutesDuration >= Runtime.MINUTES_IN_HOUR) {
    formatString = 'H[h] mm[m]';
  }

  const runtime = dayjs.duration(minutesDuration, 'm').format(formatString);
  return runtime;
};

export const generateFilmCard = (id) => {
  const title = TITLES[getRandomInteger(0, TITLES.length - 1)];

  return {
    id,
    comments: generateComments(),
    filmInfo: {
      title,
      alternativeTitle: title,
      totalRating: getRandomPositiveFloat(totalRating.MIN, totalRating.MAX, totalRating.DECIMALS),
      poster: `./images/posters/${getRandomElement(POSTERS)}`,
      ageRating: getRandomElement(AGE_RATINGS),
      director: getRandomElement(DIRECTORS),
      writers: getRandomElementsList(WRITERS),
      actors: getRandomElementsList(ACTORS),
      release: {
        date: generateReleaseDate(),
        releaseCountry: getRandomElement(RELEASE_COUNTRIES),
      },
      runtime: generateRuntime(),
      genre: getRandomElementsList(GENRES),
      description: getRandomElement(DESCRIPTIONS),
    },
    userDetails: {
      watchlist: getRandomBoolean(),
      alreadyWatched: getRandomBoolean(),
      watchingDate: getRandomDate(),
      favorite: getRandomBoolean(),
    },
  };
};

//Наполнить данными шаблон карточки
//Наполнить данными шаблон попапа
//Просмотреть подробнее тз, прокомментировать
//Просмотреть тз и найти упущенные компоненты. Настроить их поведение (данные, обработчики событий, счётчики)
//Объеденить константы в enum-объекты
//Проверить проект на наличие магических значений
//Проверить полностью домашнее задание и сдать
