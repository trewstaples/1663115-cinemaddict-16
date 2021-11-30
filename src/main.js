import { RenderPosition, renderTemplate } from './render.js';
import { renderProfileTemplate } from './view/profile-view.js';
import { renderMenuTemplate } from './view/menu-view.js';
import { renderSortTemplate } from './view/sort-view.js';
import { renderFilmsListTemplate } from './view/film-list-view.js';
import { renderFilCardTemplate } from './view/film-card-view.js';
import { renderPopupTemplate } from './view/film-popup-view.js';
import { generateFilmCard } from './mock/film-card.js';

const FILMS_COUNT = 15;

const renderCards = () => {
  const array = [];
  for (let i = 0; i < FILMS_COUNT; i++) {
    array.push(generateFilmCard(i));
  }
  return array;
};
const filmCards = renderCards();
console.log(filmCards);

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');

renderTemplate(siteHeaderElement, renderProfileTemplate(), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderMenuTemplate(), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderSortTemplate(), RenderPosition.BEFOREEND);
renderTemplate(siteMainElement, renderFilmsListTemplate(), RenderPosition.BEFOREEND);

const filmsListContainer = siteMainElement.querySelector('.films-list__container');

for (let i = 0; i < FILMS_COUNT; i++) {
  renderTemplate(filmsListContainer, renderFilCardTemplate(filmCards[i]), RenderPosition.BEFOREEND);
}

const siteFooterElement = document.querySelector('.footer');

// renderTemplate(siteFooterElement, renderPopupTemplate(), RenderPosition.BEFOREEND);
