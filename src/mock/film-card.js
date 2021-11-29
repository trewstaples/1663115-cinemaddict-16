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

const Rating = {
  MIN: 0,
  MAX: 10,
  DECIMALS: 1,
};

const Release = {
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

const getRandomElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

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

const generateOneComment = (id) => ({
  id,
  author: getRandomElement(AUTHORS),
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

const generateReleaseYear = () => {
  const currentYear = dayjs().year();

  const maxYearsGap = currentYear - Release.MIN;

  const yearsGap = getRandomInteger(0, maxYearsGap);

  return dayjs().add(-yearsGap, 'year').year();
};

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
  const releaseYear = generateReleaseYear();
  const title = TITLES[getRandomInteger(0, TITLES.length - 1)];

  return {
    id,
    comments: generateComments(),
    filmInfo: {
      title,
      alternativeTitle: title,
      totalRating: getRandomPositiveFloat(Rating.MIN, Rating.MAX, Rating.DECIMALS),
      poster: `./images/posters/${getRandomElement(POSTERS)}`,
      ageRating: getRandomElement(AGE_RATINGS),
      director: getRandomElement(DIRECTORS),
      writers: DIRECTORS.slice(getRandomInteger(0, DIRECTORS.length - 1)),
      actors: ACTORS.slice(getRandomInteger(0, ACTORS.length - 1)),
      release: {
        date: releaseYear,
        releaseCountry: getRandomElement(RELEASE_COUNTRIES),
      },
      runtime: generateRuntime(),
      genre: GENRES.slice(getRandomInteger(0, GENRES.length - 1)),
      description: getRandomElement(DESCRIPTIONS),
    },
    userDetails: {
      watchlist: false,
      alreadyWatched: true,
      watchingDate: '2019-04-12T16:12:32.554Z',
      favorite: false,
    },
  };
};
