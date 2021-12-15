import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';
import FilmPresenter from './presenter/film-presenter.js';

const FILMS_COUNT = 15;

const renderCards = () => {
  const array = [];
  for (let i = 0; i < FILMS_COUNT; i++) {
    array.push(generateFilm());
  }
  return array;
};
const films = renderCards();
const filters = generateFilter(films);

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');

const filmPresenter = new FilmPresenter(siteMainElement, siteHeaderElement);
filmPresenter.init(films, filters);
