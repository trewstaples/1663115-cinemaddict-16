import { render, remove, RenderPosition } from '../utils/render.js';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/films.js';
import { UserAction, UpdateType } from '../utils/const.js';
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
  #filters = [];
  #filmPresenter = new Map();
  #currentSortType = SortType.DEFAULT;

  constructor(mainContainer, headerContainer, filmsModel) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#filmsModel = filmsModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
  }

  init = (filters) => {
    this.#filters = [...filters];

    render(this.#mainContainer, new FilterView(filters), RenderPosition.BEFOREEND);
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();
  };

  get films() {
    switch (this.#currentSortType) {
      case SortType.BY_DATE:
        return [...this.#filmsModel.films].sort(sortFilmsByDate);
      case SortType.BY_RATING:
        return [...this.#filmsModel.films].sort(sortFilmsByRating);
    }
    return this.#filmsModel.films;
  }

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmsModel.addFilm(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmsModel.deleteFilm(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)

        break;
      case UpdateType.MINOR:
        this.#filmPresenter.get(data.id).init(data);
        // - обновить список (например, когда задача ушла в архив)
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        break;
    }
  };

  #renderNoFilm = () => {
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
  };

  #renderProfile = () => {
    render(this.#headerContainer, this.#profileComponent, RenderPosition.BEFOREEND);
  };

  #handleFilmChange = (updatedFilm) => {
    this.#filmPresenter.get(updatedFilm.id).init(updatedFilm);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
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
    const filmsCount = this.films.length;
    const films = this.films.slice(0, Math.min(filmsCount, FILMS_COUNT_PER_STEP));
    this.#renderFilms(films);

    if (filmsCount > FILMS_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }
  };

  #renderFilm = (film) => {
    const filmPresenter = new FilmPresenter(this.#filmsListComponent, this.#handleViewAction);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  };

  #renderFilms = (films) => {
    films.forEach((film) => this.#renderFilm(film));
  };

  #handleShowMoreButtonClick = () => {
    const filmsCount = this.films.length;
    const newRenderedFilmsCount = Math.min(filmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP);
    const films = this.films.slice(this.#renderedFilmsCount, newRenderedFilmsCount);

    this.#renderFilms(films);
    this.#renderedFilmsCount = newRenderedFilmsCount;

    if (this.#renderedFilmsCount >= filmsCount) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #renderShowMoreButton = () => {
    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);

    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);
  };

  #renderFilmsBoard = () => {
    if (this.films.length === 0) {
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
    render(footerStatistics, new FooterView(this.films), RenderPosition.BEFOREEND);
  };
}
