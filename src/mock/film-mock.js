import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

const TITLES = [
  'Made for Each Other',
  'Popeye the Sailor meets Sinbad the Sailor',
  'Sagebrush Trail',
  'Santa Claus Conquers the Martians',
  'The Dance of Life',
  'The Great Flamarion',
  'The Man with the Golden Arm',
];

const Posters = {
  'made-for-each-other': 'png',
  'popeye-the-sailor-meets-sinbad-the-sailor': 'png',
  'sagebrush-trail': 'jpg',
  'santa-claus-conquers-the-martians': 'jpg',
  'the-dance-of-life': 'jpg',
  'the-great-flamarion': 'jpg',
  'the-man-with-the-golden-arm': 'jpg',
};

const Film = {
  AGE_RATINGS: ['0+', '12+', '16+', '18+'],
  DIRECTORS: ['Christopher Nolan', 'Steven Spielberg', 'Charles Chaplin', 'Vince Gilligan,', 'James Cameron'],
  WRITERS: ['Billy Wilder', 'Sam Esmail', 'David Mamet', 'Frank Darabont', 'Chuck Palahniuk'],
  ACTORS: ['Julia Roberts', 'Aaron Paul', 'Bryan Cranston', 'Rami Malek', 'Kate Winslet'],
  RELEASE_COUNTRIES: ['USA', 'India', 'Australia', 'France', 'Italy'],
  GENRES: ['Drama', 'Comedy', 'Cartoon'],
  DESCRIPTIONS:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquet varius magna, non porta ligula feugiat eget. Fusce tristique felis at fermentum pharetra. Aliquam id orci ut lectus varius viverra. Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante. Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum. Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. Sed sed nisi sed augue convallis suscipit in sed felis. Aliquam erat volutpat. Nunc fermentum tortor ac porta dapibus. In rutrum ac purus sit amet tempus.'.split(
      '.',
    ),
};

const Comments = {
  AUTHORS: ['Alexander Sushko', 'Igor Antonov', 'Evgeniy Lepeshkin', 'Igor Alekseenko', 'Lera Zelenaya'],
  MESSAGES: [
    'Interesting setting and a good cast',
    'Booooooooooring',
    'Very very old. Meh',
    'Almost two hours? Seriously?',
    'A film that changed my life, a true masterpiece, post-credit scene was just amazing omg.',
  ],
  EMOTIONS: ['smile', 'sleeping', 'puke', 'angry'],
  MAX: 5,
};

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

  const formatString = 'YYYY/MM/D HH:mm';

  return dayjs().add(-daysGap, 'day').format(formatString);
};

const generateOneComment = (id) => ({
  id,
  author: getRandomElement(Comments.AUTHORS),
  date: getRandomDate(),
  comment: getRandomElement(Comments.MESSAGES),
  emotion: getRandomElement(Comments.EMOTIONS),
});

const generateComments = () => {
  const array = [];
  for (let i = 0; i < getRandomInteger(0, Comments.MAX); i++) {
    array.push(generateOneComment(i));
  }
  return array;
};

const convertTitleIntoPoster = (string) => string.replace(/\s+/g, '-').toLowerCase();

const generateReleaseDate = () => {
  const currentYear = dayjs().year();

  const maxYearsGap = currentYear - ReleaseYear.MIN;
  const yearsGap = getRandomInteger(0, maxYearsGap);
  const maxDaysGap = 30;
  const daysGap = getRandomInteger(0, maxDaysGap);

  return dayjs().add(-yearsGap, 'year').add(daysGap, 'day').format('DD MMMM YYYY');
};

const generateRuntime = () => {
  dayjs.extend(duration);

  let formatString = 'mm[M]';

  const minutesDuration = getRandomInteger(Runtime.MIN, Runtime.MAX);

  if (minutesDuration >= Runtime.MINUTES_IN_HOUR) {
    formatString = 'H[h] mm[m]';
  }

  const runtime = dayjs.duration(minutesDuration, 'm').format(formatString);
  return runtime;
};

export const generateFilm = (id) => {
  const title = TITLES[getRandomInteger(0, TITLES.length - 1)];
  const posterUrl = convertTitleIntoPoster(title);

  return {
    id,
    comments: generateComments(),
    info: {
      title,
      alternativeTitle: title,
      totalRating: getRandomPositiveFloat(totalRating.MIN, totalRating.MAX, totalRating.DECIMALS),
      poster: `./images/posters/${posterUrl}.${Posters[posterUrl]}`,
      ageRating: getRandomElement(Film.AGE_RATINGS),
      director: getRandomElement(Film.DIRECTORS),
      writers: getRandomElementsList(Film.WRITERS),
      actors: getRandomElementsList(Film.ACTORS),
      release: {
        date: generateReleaseDate(),
        country: getRandomElement(Film.RELEASE_COUNTRIES),
      },
      runtime: generateRuntime(),
      genre: getRandomElementsList(Film.GENRES),
      description: getRandomElement(Film.DESCRIPTIONS),
    },
    userDetails: {
      watchlist: getRandomBoolean(),
      alreadyWatched: getRandomBoolean(),
      watchingDate: getRandomDate(),
      favorite: getRandomBoolean(),
    },
  };
};
