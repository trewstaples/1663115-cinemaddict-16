import { UserAction, UpdateType, FilterType } from '../utils/const.js';
import { render, replace, remove, RenderPosition } from '../utils/render.js';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/films.js';
import { SortType } from '../view/sort-view.js';
import { filter } from '../utils/filter.js';
import SortView from '../view/sort-view.js';
import FilmsView from '../view/films-view.js';
import FilmsListView from '../view/films-list-view.js';
import NoFilmView from '../view/no-film.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FilmPresenter from './film-presenter.js';
import ProfileView from '../view/profile-view.js';
import StatsView from '../view/stats-view.js';
import LoadingView from '../view/loading-view.js';

const FILMS_COUNT_PER_STEP = 5;

export default class FilmsBoardPresenter {
  #profileContainer = null;
  #mainContainer = null;
  #filmsModel = null;
  #filterModel = null;
  #mode = 1;

  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #loadingComponent = new LoadingView();
  #noFilmComponent = null;
  #profileComponent = null;
  #sortComponent = null;
  #statsComponent = null;
  #showMoreButtonComponent = null;

  #renderedFilmsCount = FILMS_COUNT_PER_STEP;
  #filmPresenter = new Map();

  #currentSortType = SortType.DEFAULT;
  #currentFilterType = FilterType.ALL;
  #isLoading = true;

  constructor(profileContainer, mainContainer, filmsModel, filterModel) {
    this.#profileContainer = profileContainer;
    this.#mainContainer = mainContainer;
    this.#filmsModel = filmsModel;
    this.#filterModel = filterModel;
  }

  get films() {
    this.#currentFilterType = this.#filterModel.filter;
    const films = this.#filmsModel.films;
    const filteredFilms = filter[this.#currentFilterType](films);

    switch (this.#currentSortType) {
      case SortType.BY_DATE:
        return filteredFilms.sort(sortFilmsByDate);
      case SortType.BY_RATING:
        return filteredFilms.sort(sortFilmsByRating);
    }
    return filteredFilms;
  }

  get watchedFilms() {
    return this.#filmsModel.films.filter((film) => film.userDetails.alreadyWatched);
  }

  init = () => {
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.#renderFilmsBoard();
  };

  destroy = () => {
    this.#clearFilmsBoard({ resetRenderedFilmsCount: true, resetSortType: true });

    remove(this.#filmsComponent);

    this.#filmsModel.removeObserver(this.#handleModelEvent);
    this.#filterModel.removeObserver(this.#handleModelEvent);
  };

  #renderProfile = () => {
    const prevProfileComponent = this.#profileComponent;

    this.#profileComponent = new ProfileView(this.watchedFilms.length);

    if (prevProfileComponent === null) {
      render(this.#profileContainer, this.#profileComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#profileContainer.contains(prevProfileComponent.element)) {
      replace(this.#profileComponent, prevProfileComponent);
    }
    remove(prevProfileComponent);
  };

  #renderStats = () => {
    this.#statsComponent = new StatsView();
    render(this.#mainContainer, this.#statsComponent, RenderPosition.BEFOREEND);
  };

  #renderSort = () => {
    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearFilmsBoard({ resetRenderedFilmsCount: true });
    this.#renderFilmsBoard();
  };

  #renderFilms = (films) => {
    films.forEach((film) => this.#renderFilm(film));
  };

  #renderFilm = (film) => {
    const filmId = film.id;
    const filmPresenter = new FilmPresenter(this.#filmsListComponent, this.#handleViewAction, this.#currentFilterType, this.#renderProfile, filmId);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmsModel.updateFilm(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#filmPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearFilmsBoard();
        this.#renderFilmsBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearFilmsBoard({ resetRenderedFilmsCount: true, resetSortType: true });
        this.#renderFilmsBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderFilmsBoard();
        break;
    }
  };

  #renderFilmsList = () => {
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);
  };

  #renderLoading = () => {
    render(this.#filmsComponent, this.#loadingComponent, RenderPosition.BEFOREEND);
  };

  #renderNoFilm = () => {
    this.#noFilmComponent = new NoFilmView(this.#currentFilterType);
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
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
    this.#showMoreButtonComponent = new ShowMoreButtonView();
    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);

    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);
  };

  #clearFilmsBoard = ({ resetRenderedFilmsCount = false, resetSortType = false } = {}) => {
    const filmsCount = this.films.length;

    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    remove(this.#noFilmComponent);
    remove(this.#showMoreButtonComponent);

    if (resetRenderedFilmsCount) {
      this.#renderedFilmsCount = FILMS_COUNT_PER_STEP;
    } else {
      this.#renderedFilmsCount = Math.min(filmsCount, this.#renderedFilmsCount);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  };

  #renderFilmsBoard = () => {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    const films = this.films;
    const filmsCount = this.films.length;

    this.#renderProfile();

    if (filmsCount === 0) {
      this.#renderNoFilm();
      return;
    }

    if (this.#mode === 0) {
      remove(this.#filmsComponent);
      this.#renderStats();
      return;
    }

    this.#renderSort();
    this.#renderFilmsList();

    this.#renderFilms(films.slice(0, Math.min(filmsCount, this.#renderedFilmsCount)));

    if (filmsCount > FILMS_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }
  };
}
