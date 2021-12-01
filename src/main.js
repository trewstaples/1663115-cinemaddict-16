import { RenderPosition, renderTemplate } from './render.js';
import { renderProfileTemplate } from './view/profile-view.js';
import { renderFilterTemplate } from './view/filter-view.js';
import { renderSortTemplate } from './view/sort-view.js';
import { renderFilmsListTemplate } from './view/list-view.js';
import { renderFilCardTemplate } from './view/film-view.js';
import { renderPopupTemplate } from './view/popup-view.js';
import { generateFilm } from './mock/film-mock.js';
import { generateFilter } from './mock/filters-mock.js';

const FILMS_COUNT = 15;

const renderCards = () => {
  const array = [];
  for (let i = 0; i < FILMS_COUNT; i++) {
    array.push(generateFilm(i));
  }
  return array;
};
const films = renderCards();
const filters = generateFilter(films);

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');

renderTemplate(siteHeaderElement, renderProfileTemplate(), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderFilterTemplate(filters), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderSortTemplate(), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderFilmsListTemplate(), RenderPosition.BEFOREEND);

const filmsListContainer = siteMainElement.querySelector('.films-list__container');

const siteFooterElement = document.querySelector('.footer');

renderTemplate(siteFooterElement, renderPopupTemplate(films[0]), RenderPosition.BEFOREEND);

for (let i = 1; i < FILMS_COUNT; i++) {
  renderTemplate(filmsListContainer, renderFilCardTemplate(films[i]), RenderPosition.BEFOREEND);
}
