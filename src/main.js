import { render, RenderPosition } from './render.js';
import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';
import ProfileView from './view/profile-view.js';
import FilterView from './view/filter-view.js';
import SortView from './view/sort-view.js';
import FilmsView from './view/films-view.js';
import FilmsListView from './view/films-list-view.js';
import FilmCardView from './view/film-card-view.js';
import FilmPopupView from './view/film-popup-view.js';
import ShowMoreButtonView from './view/show-more-button-view.js';
import FooterView from './view/footer-stats-view.js';

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
const siteFooterElement = document.querySelector('.footer');

const renderFilm = (filmListElement, film) => {
  const filmCardComponent = new FilmCardView(film);
  const filmPopupComponent = new FilmPopupView(film);

  const replacePopupToCard = () => {
    document.body.removeChild(filmPopupComponent.element);
    document.body.classList.remove('hide-overflow');
  };

  const onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      replacePopupToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    }
  };

  const replaceCardToPopup = () => {
    render(siteFooterElement, filmPopupComponent.element, RenderPosition.AFTEREND);
    document.body.classList.add('hide-overflow');
    document.addEventListener('keydown', onEscKeyDown);
  };

  filmCardComponent.filmCardLink.addEventListener('click', () => {
    replaceCardToPopup();
  });

  filmPopupComponent.element.querySelector('.film-details__close-btn').addEventListener('click', (evt) => {
    evt.preventDefault();
    replacePopupToCard();
    document.removeEventListener('keydown', onEscKeyDown);
  });

  render(filmListElement, filmCardComponent.element, RenderPosition.BEFOREEND);
};

render(siteHeaderElement, new ProfileView().element, RenderPosition.BEFOREEND);
render(siteMainElement, new FilterView(filters).element, RenderPosition.BEFOREEND);
render(siteMainElement, new SortView().element, RenderPosition.BEFOREEND);

const filmsComponent = new FilmsView();
render(siteMainElement, filmsComponent.element, RenderPosition.BEFOREEND);

const filmsListComponent = new FilmsListView();
render(filmsComponent.element, filmsListComponent.element, RenderPosition.BEFOREEND);

for (let i = 0; i < Math.min(films.length, FILMS_COUNT_PER_STEP); i++) {
  renderFilm(filmsListComponent.container, films[i]);
}

if (films.length > FILMS_COUNT_PER_STEP) {
  let renderedFilmsCount = FILMS_COUNT_PER_STEP;

  render(filmsListComponent.element, new ShowMoreButtonView().element, RenderPosition.BEFOREEND);

  const showMoreButton = siteMainElement.querySelector('.films-list__show-more');

  showMoreButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    films.slice(renderedFilmsCount, renderedFilmsCount + FILMS_COUNT_PER_STEP).forEach((film) => renderFilm(filmsListComponent.container, film));
    renderedFilmsCount += FILMS_COUNT_PER_STEP;

    if (renderedFilmsCount >= films.length) {
      showMoreButton.remove();
    }
  });
}

const footerStatistics = document.querySelector('.footer__statistics');
render(footerStatistics, new FooterView(films).element, RenderPosition.BEFOREEND);
