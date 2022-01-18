import { render, RenderPosition } from './utils/render.js';
import { generateFilm } from './mock/film.js';
import ProfileView from './view/profile-view.js';
import FilmsBoardPresenter from './presenter/films-list-presenter.js';
import FilmsModel from './model/films-model.js';
import FilterView from './view/filter-view.js';
import FilterModel from './model/filter-model.js';

const FILMS_COUNT = 15;

const renderCards = () => {
  const array = [];
  for (let i = 0; i < FILMS_COUNT; i++) {
    array.push(generateFilm());
  }
  return array;
};
const films = renderCards();
const filters = [
  {
    type: 'all',
    name: 'All movies',
    count: '',
  },
];

const filmsModel = new FilmsModel();
filmsModel.films = films;

const filterModel = new FilterModel();

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');

const filmListPresenter = new FilmsBoardPresenter(siteMainElement, filmsModel);

render(siteHeaderElement, new ProfileView(), RenderPosition.BEFOREEND);
render(siteMainElement, new FilterView(filters), RenderPosition.BEFOREEND);

filmListPresenter.init();
