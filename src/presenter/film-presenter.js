import { render, remove, RenderPosition, renderPopup, renderCard } from './utils/render.js';
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

export default class FilmPresenter {
  #mainContainer = null;
  #headerContainer = null;

  #noFilmComponent = new NoFilmView();
  #filterComponent = new FilterView();
  #profileComponent = new ProfileView();
  #sortComponent = new SortView();
  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #showMoreButtonComponent = new ShowMoreButtonView();

  #boardFilms = [];

  constructor(mainContainer, headerContainer) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
  }

  init = (boardFilms) => {
    this.#boardFilms = [...boardFilms];

    render(this.#mainContainer, this.#filterComponent, RenderPosition.BEFOREEND);
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();
  };

  #renderNoFilm = () => {
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
  };

  #renderProfile = () => {
    render(this.#headerContainer, this.#profileComponent, RenderPosition.BEFOREEND);
  };

  #renderSort = () => {
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
  };

  #renderFilmsList = () => {
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);
  };

  #renderFilm = (from, to) => {};

  #renderFilmsBoard = () => {
    if (this.#boardFilms.length === 0) {
      this.#renderNoFilm();
    } else {
      this.#renderProfile();
      this.#renderSort();
      this.#renderFilmsList();

      this.#renderFilm(0, Math.min(this.#boardFilms.length, FILMS_COUNT_PER_STEP));

      if (this.#boardFilms.length > FILMS_COUNT_PER_STEP) {
        let renderedFilmsCount = FILMS_COUNT_PER_STEP;

        this.#renderShowMoreButton();
      }
    }
  };

  #renderFilmCard = () => {};

  #renderFilmPopup = () => {};

  #renderShowMoreButton = () => {
    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);
  };

  #renderFooter = () => {};
}
