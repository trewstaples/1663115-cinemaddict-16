import { render, remove, RenderPosition, updateItem } from '../utils/render.js';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/films.js';
import { SortType } from '../view/sort-view.js';
import NoFilmView from '../view/no-film.js';
import ProfileView from '../view/profile-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import FilmsView from '../view/films-view.js';
import FilmsListView from '../view/films-list-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FooterView from '../view/footer-stats-view.js';
import FilmPresenter from './film-presenter.js';

const FILMS_COUNT_PER_STEP = 5;

export default class FilmListPresenter {
  #mainContainer = null;
  #headerContainer = null;
  #filmsModel = null;

  #noFilmComponent = new NoFilmView();
  #profileComponent = new ProfileView();
  #sortComponent = new SortView();
  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #showMoreButtonComponent = new ShowMoreButtonView();
  #footerComponent = new FooterView();

  #renderedFilmsCount = FILMS_COUNT_PER_STEP;
  #listFilms = [];
  #filters = [];
  #filmPresenter = new Map();
  #currentSortType = SortType.DEFAULT;
  #sourcedListFilms = [];

  constructor(mainContainer, headerContainer, filmsModel) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#filmsModel = filmsModel;
  }

  init = (listFilms, filters) => {
    this.#listFilms = [...listFilms];
    this.#filters = [...filters];
    this.#sourcedListFilms = [...listFilms];

    render(this.#mainContainer, new FilterView(filters), RenderPosition.BEFOREEND);
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();
  };

  get films() {
    return this.#filmsModel.films;
  }

  #renderNoFilm = () => {
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
  };

  #renderProfile = () => {
    render(this.#headerContainer, this.#profileComponent, RenderPosition.BEFOREEND);
  };

  #handleFilmChange = (updatedFilm) => {
    this.#listFilms = updateItem(this.#listFilms, updatedFilm);
    this.#sourcedListFilms = updateItem(this.#sourcedListFilms, updatedFilm);
    this.#filmPresenter.get(updatedFilm.id).init(updatedFilm);
  };

  #sortFilms = (sortType) => {
    switch (sortType) {
      case SortType.BY_DATE:
        this.#listFilms.sort(sortFilmsByDate);
        break;
      case SortType.BY_RATING:
        this.#listFilms.sort(sortFilmsByRating);
        break;
      default:
        this.#listFilms = [...this.#sourcedListFilms];
    }

    this.#currentSortType = sortType;
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortFilms(sortType);
    this.#clearFilmsList();
    this.#renderFilmsList();
  };

  #renderSort = () => {
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
  };

  #clearFilmsList = () => {
    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();
    this.#renderedFilmsCount = FILMS_COUNT_PER_STEP;
    remove(this.#showMoreButtonComponent);
  };

  #renderFilmsList = () => {
    this.#renderFilms(0, Math.min(this.#listFilms.length, FILMS_COUNT_PER_STEP));

    if (this.#listFilms.length > FILMS_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }
  };

  #renderFilm = (film) => {
    const filmPresenter = new FilmPresenter(this.#filmsListComponent, this.#handleFilmChange);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  };

  #renderFilms = (from, to) => {
    this.#listFilms.slice(from, to).forEach((boardFilm) => this.#renderFilm(boardFilm));
  };

  #handleShowMoreButtonClick = () => {
    this.#listFilms.slice(this.#renderedFilmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP).forEach((film) => this.#renderFilm(film));
    this.#renderedFilmsCount += FILMS_COUNT_PER_STEP;

    if (this.#renderedFilmsCount >= this.#listFilms.length) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #renderShowMoreButton = () => {
    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);

    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);
  };

  #renderFilmsBoard = () => {
    if (this.#listFilms.length === 0) {
      this.#renderNoFilm();
    } else {
      this.#renderProfile();
      this.#renderSort();
      render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);

      this.#renderFilmsList();

      this.#renderFooter();
    }
  };

  #renderFooter = () => {
    const footerStatistics = document.querySelector('.footer__statistics');
    render(footerStatistics, new FooterView(this.#listFilms), RenderPosition.BEFOREEND);
  };
}
