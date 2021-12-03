import { render, RenderPosition } from './render.js';
import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';
import ProfileView from './view/profile-view.js';
import FilterView from './view/filter-view.js';
import SortView from './view/sort-view.js';
import FilmListView from './view/film-list-view.js';
import FilmView from './view/film-view.js';
import FilmPopupView from './view/film-popup-view.js';
import ShowMoreButtonView from './view/show-more-button-view.js';
import FooterView from './view/footer-view.js';

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

render(siteHeaderElement, new ProfileView().element, RenderPosition.BEFOREEND);
render(siteMainElement, new FilterView(filters).element, RenderPosition.BEFOREEND);
render(siteMainElement, new SortView().element, RenderPosition.BEFOREEND);
render(siteMainElement, new FilmListView().element, RenderPosition.BEFOREEND);

const filmsListContainer = siteMainElement.querySelector('.films-list__container');

const siteFooterElement = document.querySelector('.footer');

render(siteFooterElement, new FilmPopupView(films[0]).element, RenderPosition.AFTEREND);

for (let i = 1; i < Math.min(films.length, FILMS_COUNT_PER_STEP); i++) {
  render(filmsListContainer, new FilmView(films[i]).element, RenderPosition.BEFOREEND);
}

if (films.length > FILMS_COUNT_PER_STEP) {
  let renderedFilmsCount = FILMS_COUNT_PER_STEP;

  render(siteMainElement, new ShowMoreButtonView().element, RenderPosition.BEFOREEND);

  const showMoreButton = siteMainElement.querySelector('.films-list__show-more');

  showMoreButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    films
      .slice(renderedFilmsCount, renderedFilmsCount + FILMS_COUNT_PER_STEP)
      .forEach((film) => render(filmsListContainer, new FilmView(film).element, RenderPosition.BEFOREEND));
    renderedFilmsCount += FILMS_COUNT_PER_STEP;

    if (renderedFilmsCount >= films.length) {
      showMoreButton.remove();
    }
  });
}

const footerStatistics = document.querySelector('.footer__statistics');
render(footerStatistics, new FooterView(films).element, RenderPosition.BEFOREEND);
