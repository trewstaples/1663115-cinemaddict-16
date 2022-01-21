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
import FooterView from '../view/footer-stats-view.js';
import FilmPresenter from './film-presenter.js';
import ProfileView from '../view/profile-view.js';

//Исправить поведение попапа - попап не должен скрываться при изменении фильтров
//В поисковике ссылка всё время идёт на watchlist после # или вообще пропадает
//После рефакторинга убрать передачу комментариев во вью карточки

const FILMS_COUNT_PER_STEP = 5;

export default class FilmsBoardPresenter {
  #profileContainer = null;
  #mainContainer = null;
  #filmsModel = null;
  #filterModel = null;

  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #footerComponent = new FooterView();
  #noFilmComponent = null;
  #profileComponent = null;
  #sortComponent = null;
  #showMoreButtonComponent = null;

  #renderedFilmsCount = FILMS_COUNT_PER_STEP;
  #filmPresenter = new Map();

  #currentSortType = SortType.DEFAULT;
  #currentFilterType = FilterType.ALL;

  constructor(profileContainer, mainContainer, filmsModel, filterModel) {
    this.#profileContainer = profileContainer;
    this.#mainContainer = mainContainer;
    this.#filmsModel = filmsModel;
    this.#filterModel = filterModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
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

    this.#renderFilmsBoard();
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
    const filmComments = film.comments;
    const filmPresenter = new FilmPresenter(this.#filmsListComponent, this.#removePrevPopup, filmComments, this.#handleViewAction, this.#currentFilterType, this.#renderProfile);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  };

  #removePrevPopup = () => {
    if (document.body.querySelector('.film-details')) {
      document.body.querySelector('.film-details').remove();
    }
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
        if (this.#filmPresenter.has(data.id)) {
          this.#filmPresenter.get(data.id).init(data);
        }
        break;
      case UpdateType.MINOR:
        this.#clearFilmsBoard();
        this.#renderFilmsBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearFilmsBoard({ resetRenderedFilmsCount: true, resetSortType: true });
        this.#renderFilmsBoard();
        break;
    }
  };

  /*   #handleViewAction = (actionType, updateType, update) => {
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
  }

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#updateFilm(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetRenderedFilmCount: true, resetSortType: true});
        this.#renderBoard();
        break;
    }
  } */

  #renderFilmsList = () => {
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);
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
    remove(this.#noFilmComponent);
    remove(this.#showMoreButtonComponent);
    remove(this.#footerComponent);

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
    const films = this.films;
    const filmsCount = this.films.length;
    if (filmsCount === 0) {
      this.#renderNoFilm();
      return;
    }

    if (this.#profileComponent === null) {
      this.#renderProfile();
    }

    this.#renderSort();
    this.#renderFilmsList();

    this.#renderFilms(films.slice(0, Math.min(filmsCount, this.#renderedFilmsCount)));

    if (filmsCount > FILMS_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }

    this.#renderFooter();
  };

  #renderFooter = () => {
    const footerStatistics = document.querySelector('.footer__statistics');
    this.#footerComponent = new FooterView(this.films);
    render(footerStatistics, this.#footerComponent, RenderPosition.BEFOREEND);
  };
}
