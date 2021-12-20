import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';
import FilmListPresenter from './presenter/films-list-presenter.js';

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

const filmListPresenter = new FilmListPresenter(siteMainElement, siteHeaderElement);
filmListPresenter.init(films, filters);
