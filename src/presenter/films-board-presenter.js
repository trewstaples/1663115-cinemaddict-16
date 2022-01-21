import { render, remove, RenderPosition } from '../utils/render.js';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/films.js';
import { UserAction, UpdateType } from '../utils/const.js';
import { SortType } from '../view/sort-view.js';
import { filter } from '../utils/filter.js';
import NoFilmView from '../view/no-film.js';
import SortView from '../view/sort-view.js';
import FilmsView from '../view/films-view.js';
import FilmsListView from '../view/films-list-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FooterView from '../view/footer-stats-view.js';
import FilmPresenter from './film-presenter.js';

//Исправить поведение попапа - попап не должен скрываться при изменении фильтров
//В поисковике ссылка всё время идёт на watchlist после # или вообще пропадает
//После рефакторинга убрать передачу комментариев во вью карточки

const FILMS_COUNT_PER_STEP = 5;

export default class FilmsBoardPresenter {
  #mainContainer = null;
  #filmsModel = null;
  #filterModel = null;

  #noFilmComponent = new NoFilmView();
  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #footerComponent = new FooterView();
  #sortComponent = null;
  #showMoreButtonComponent = null;

  #renderedFilmsCount = FILMS_COUNT_PER_STEP;
  #filmPresenter = new Map();
  #currentSortType = SortType.DEFAULT;

  constructor(mainContainer, filmsModel, filterModel) {
    this.#mainContainer = mainContainer;
    this.#filmsModel = filmsModel;
    this.#filterModel = filterModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get films() {
    const filterType = this.#filterModel.filter;
    const films = this.#filmsModel.films;
    const filteredFilms = filter[filterType](films);

    switch (this.#currentSortType) {
      case SortType.BY_DATE:
        return filteredFilms.sort(sortFilmsByDate);
      case SortType.BY_RATING:
        return filteredFilms.sort(sortFilmsByRating);
    }
    return filteredFilms;
  }

  init = () => {
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();
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

  #renderSort = () => {
    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
  };

  #renderFilm = (film) => {
    const filmComments = film.comments;
    const filmPresenter = new FilmPresenter(this.#filmsListComponent, this.#handleViewAction, filmComments);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  };

  #renderFilms = (films) => {
    films.forEach((film) => this.#renderFilm(film));
  };

  #renderNoFilm = () => {
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

    this.#renderSort();
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);

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
