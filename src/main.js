import { RenderPosition, renderTemplate } from './render.js';
import { renderProfileTemplate } from './view/profile-view.js';
import { renderFilterTemplate } from './view/filter-view.js';
import { renderSortTemplate } from './view/sort-view.js';
import { renderFilmsListTemplate } from './view/film-list-view.js';
import { renderFilCardTemplate } from './view/film-view.js';
import { renderPopupTemplate } from './view/film-popup-view.js';
import { renderShowMoreButtonTemplate } from './view/show-more-button-view.js';
import { renderFooterTemplate } from './view/footer-view.js';
import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';

const FILMS_COUNT = 15;
const FILMS_COUNT_PER_STEP = 5;

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

for (let i = 1; i < Math.min(films.length, FILMS_COUNT_PER_STEP); i++) {
  renderTemplate(filmsListContainer, renderFilCardTemplate(films[i]), RenderPosition.BEFOREEND);
}

if (films.length > FILMS_COUNT_PER_STEP) {
  let renderedFilmsCount = FILMS_COUNT_PER_STEP;

  renderTemplate(siteMainElement, renderShowMoreButtonTemplate(), RenderPosition.BEFOREEND);

  const showMoreButton = siteMainElement.querySelector('.films-list__show-more');

  showMoreButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    films
      .slice(renderedFilmsCount, renderedFilmsCount + FILMS_COUNT_PER_STEP)
      .forEach((film) => renderTemplate(filmsListContainer, renderFilCardTemplate(film), RenderPosition.BEFOREEND));
    renderedFilmsCount += FILMS_COUNT_PER_STEP;

    if (renderedFilmsCount >= films.length) {
      showMoreButton.remove();
    }
  });
}

const footerStatistics = document.querySelector('.footer__statistics');
renderTemplate(footerStatistics, renderFooterTemplate(films), RenderPosition.BEFOREEND);
