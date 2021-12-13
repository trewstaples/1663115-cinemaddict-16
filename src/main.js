import { render, remove, RenderPosition, renderPopup, renderCard } from './utils/render.js';
import { generateFilm } from './mock/film.js';
import { generateFilter } from './mock/filters.js';
import NoFilmView from './view/no-film.js';
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

const renderFilm = (filmListElement, film) => {
  const filmCardComponent = new FilmCardView(film);
  const filmPopupComponent = new FilmPopupView(film);

  const replacePopupToCard = () => {
    renderCard(filmPopupComponent);
  };

  const onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      replacePopupToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    }
  };

  const replaceCardToPopup = () => {
    renderPopup(filmPopupComponent);
    document.addEventListener('keydown', onEscKeyDown);
  };

  filmCardComponent.setEditClickHandler(() => {
    replaceCardToPopup();
  });

  filmPopupComponent.setEditClickHandler(() => {
    replacePopupToCard();
    document.removeEventListener('keydown', onEscKeyDown);
  });

  render(filmListElement, filmCardComponent, RenderPosition.BEFOREEND);
};

render(siteMainElement, new FilterView(filters), RenderPosition.BEFOREEND);

const filmsComponent = new FilmsView();
render(siteMainElement, filmsComponent, RenderPosition.BEFOREEND);

const renderBoardFilms = (boardFilms) => {
  if (boardFilms.length === 0) {
    render(filmsComponent, new NoFilmView(), RenderPosition.BEFOREEND);
  } else {
    render(siteHeaderElement, new ProfileView(), RenderPosition.BEFOREEND);
    render(filmsComponent, new SortView(), RenderPosition.BEFOREBEGIN);
    const filmsListComponent = new FilmsListView();
    render(filmsComponent, filmsListComponent, RenderPosition.BEFOREEND);

    boardFilms
      .slice(0, Math.min(boardFilms.length, FILMS_COUNT_PER_STEP))
      .forEach((boardFilm) => renderFilm(filmsListComponent.container, boardFilm));
    /*  for (let i = 0; i < Math.min(boardFilms.length, FILMS_COUNT_PER_STEP); i++) {
      renderFilm(filmsListComponent.container, boardFilms[i]);
    } */

    if (boardFilms.length > FILMS_COUNT_PER_STEP) {
      let renderedFilmsCount = FILMS_COUNT_PER_STEP;

      const showMoreButtonComponent = new ShowMoreButtonView();
      render(filmsListComponent, showMoreButtonComponent, RenderPosition.BEFOREEND);

      showMoreButtonComponent.setClickHandler(() => {
        boardFilms
          .slice(renderedFilmsCount, renderedFilmsCount + FILMS_COUNT_PER_STEP)
          .forEach((film) => renderFilm(filmsListComponent.container, film));
        renderedFilmsCount += FILMS_COUNT_PER_STEP;

        if (renderedFilmsCount >= boardFilms.length) {
          remove(showMoreButtonComponent);
        }
      });
    }
  }
};

renderBoardFilms(films);

const footerStatistics = document.querySelector('.footer__statistics');
render(footerStatistics, new FooterView(films), RenderPosition.BEFOREEND);
