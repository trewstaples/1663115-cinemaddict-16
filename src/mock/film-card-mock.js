const POSTERS = [
  'made-for-each-other',
  'popeye-meets-sinbad',
  'sagebrush-trail',
  'santa-claus-conquers-the-martians',
  'the-dance-of-life',
  'the-great-flamarion',
  'the-man-with-the-golden-arm',
];

const TITLES = [
  'Made for Each Other',
  'Popeye the Sailor meets Sinbad the Sailor',
  'Sagebrush Trail',
  'Santa Claus Conquers the Martians',
  'The Dance of Life',
  'The Great Flamarion',
  'The Man with the Golden Arm',
];

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
};

const Release = {
  MIN: 1895,
  MAX: 2021,
};

const Runtime = {
  MIN: 50,
  MAX: 180,
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
  date: '2019-05-11T16:12:32.554Z', //с помощью dayjs()
  emotion: getRandomElement(EMOTIONS),
});

const generateComments = () => {
  const array = [];
  for (let i = 0; i < getRandomInteger(0, COMMENTS_MAX - 1); i++) {
    array.push(generateOneComment(i));
  }
  return array;
};

export const generateFilmCard = (id) => ({
  id,
  filmInfo: {
    poster: `images/posters/${getRandomElement(POSTERS)}.png`,
    title: TITLES[getRandomInteger(0, TITLES.length - 1)],
    totalRating: getRandomPositiveFloat(Rating.MIN, Rating.MAX),
    release: getRandomInteger(Release.MIN, Release.MAX), // с помощью dayjs()
    runtime: getRandomInteger(Runtime.MIN, Runtime.MAX), // с помощью dayjs
    genre: getRandomElement(GENRES),
    description: getRandomElement(DESCRIPTIONS),
  },
  comments: generateComments(),
});
