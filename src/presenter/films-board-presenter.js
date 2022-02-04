import { UserAction, UpdateType, FilterType } from '../utils/const.js';
import { render, replace, remove, RenderPosition } from '../utils/render.js';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/films.js';
import { SortType } from '../view/sort-view.js';
import { filter } from '../utils/filter.js';
import LoadingView from '../view/loading-view.js';
import NoFilmView from '../view/no-film-view.js';
import ProfileView from '../view/profile-view.js';
import SortView from '../view/sort-view.js';
import FilmsView from '../view/films-view.js';
import FilmsListView from '../view/films-list-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FilmPresenter from './film-presenter.js';

const FILMS_COUNT_PER_STEP = 5;
const MODE_MESSAGE = 'Replacing Block';

export default class FilmsBoardPresenter {
  #profileContainer = null;
  #mainContainer = null;
  #filmsModel = null;
  #filterModel = null;

  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #topRatedComponent = new FilmsListView('topRated');
  #mostCommentedComponent = new FilmsListView('mostCommented');
  #loadingComponent = new LoadingView();
  #noFilmComponent = null;
  #profileComponent = null;
  #sortComponent = null;
  #showMoreButtonComponent = null;

  #renderedFilmsCount = FILMS_COUNT_PER_STEP;
  #filmPresenter = new Map();
  #topRatedPresenter = new Map();
  #mostCommentedPresenter = new Map();

  #currentSortType = SortType.DEFAULT;
  #currentFilterType = FilterType.ALL;
  #isLoading = true;
  #replacingMode = null;

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

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmsModel.updateFilm(updateType, update);
        if (!this.#filmsModel.mostCommentedFilms.find((film) => film.id === update.id)) {
          this.#replacingMode = MODE_MESSAGE;
        }
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmsModel.updateFilm(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#updateFilm(data);
        break;
      case UpdateType.BLOCK:
        if (!this.#filmsModel.mostCommentedFilms.find((film) => film.id === data.id) || this.#replacingMode === MODE_MESSAGE) {
          remove(this.#mostCommentedComponent);
          this.#renderMostCommentedFilms();
          this.#replacingMode = null;
        }

        this.#updateFilm(data);
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

  #clearFilmsBoard = ({ resetRenderedFilmsCount = false, resetSortType = false } = {}) => {
    const filmsCount = this.films.length;

    this.#filmPresenter.forEach((presenter) => presenter.destroy());

    this.#filmPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    remove(this.#noFilmComponent);
    remove(this.#showMoreButtonComponent);
    remove(this.#topRatedComponent);
    remove(this.#mostCommentedComponent);

    this.#renderedFilmsCount = resetRenderedFilmsCount ? FILMS_COUNT_PER_STEP : Math.min(filmsCount, this.#renderedFilmsCount);

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

    if (!filmsCount) {
      this.#renderNoFilm();
      return;
    }

    this.#renderSort();
    this.#renderFilmsList();

    this.#renderFilms(films.slice(0, Math.min(filmsCount, this.#renderedFilmsCount)), this.#filmsListComponent, this.#filmPresenter);

    if (filmsCount > FILMS_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }

    this.#renderTopRatedFilms();
    this.#renderMostCommentedFilms();
  };

  #updateFilm = (updatedFilm) => {
    [this.#filmPresenter, this.#topRatedPresenter, this.#mostCommentedPresenter].forEach((presenter) => this.#initFilmPresenter(presenter, updatedFilm));
  };

  #initFilmPresenter = (presenter, updatedFilm) => {
    if (presenter.has(updatedFilm.id)) {
      presenter.get(updatedFilm.id).init(updatedFilm);
    }
  };

  #renderLoading = () => {
    render(this.#filmsComponent, this.#loadingComponent, RenderPosition.BEFOREEND);
  };

  #renderNoFilm = () => {
    this.#noFilmComponent = new NoFilmView(this.#currentFilterType);
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
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

  #renderSort = () => {
    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
  };

  #renderFilmsList = () => {
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);
  };

  #renderFilms = (films, place, filmPresenter) => {
    films.forEach((film) => this.#renderFilm(film, place, filmPresenter));
  };

  #renderFilm = (film, place, filmsCloud) => {
    const filmPresenter = new FilmPresenter(place, this.#handleViewAction, this.#currentFilterType, this.#renderProfile);
    filmPresenter.init(film);
    filmsCloud.set(film.id, filmPresenter);
  };

  #renderShowMoreButton = () => {
    this.#showMoreButtonComponent = new ShowMoreButtonView();
    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);

    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);
  };

  #renderTopRatedFilms = () => {
    if (this.#filmsModel.topRatedFilms && this.#filmsModel.topRatedFilms.length !== 0) {
      render(this.#filmsComponent, this.#topRatedComponent, RenderPosition.BEFOREEND);
      this.#renderFilms(this.#filmsModel.topRatedFilms, this.#topRatedComponent, this.#topRatedPresenter);
    }
  };

  #renderMostCommentedFilms = () => {
    if (this.#filmsModel.mostCommentedFilms && this.#filmsModel.mostCommentedFilms.length !== 0) {
      render(this.#filmsComponent, this.#mostCommentedComponent, RenderPosition.BEFOREEND);
      this.#renderFilms(this.#filmsModel.mostCommentedFilms, this.#mostCommentedComponent, this.#mostCommentedPresenter);
    }
  };

  #handleShowMoreButtonClick = () => {
    const filmsCount = this.films.length;
    const newRenderedFilmsCount = Math.min(filmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP);
    const films = this.films.slice(this.#renderedFilmsCount, newRenderedFilmsCount);

    this.#renderFilms(films, this.#filmsListComponent, this.#filmPresenter);
    this.#renderedFilmsCount = newRenderedFilmsCount;

    if (this.#renderedFilmsCount >= filmsCount) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearFilmsBoard({ resetRenderedFilmsCount: true });
    this.#renderFilmsBoard();
  };
}
