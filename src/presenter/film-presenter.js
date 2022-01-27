import { KeyboardKeys, UserAction, UpdateType, Mode, FilterType, AUTHORIZATION, END_POINT } from '../utils/const.js';
import { render, replace, remove, RenderPosition } from '../utils/render.js';
import AbstractView from '../view/abstract-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import CommentsModel from '../model/comments-model.js';
import ApiService from '../api-service.js';

export default class FilmPresenter {
  #filmsListComponent = null;
  #changeData = null;
  #currentFilter = null;
  #changeWatchedFilms = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;
  #filmId = null;
  #commentsModel = null;
  #mode = null;

  constructor(filmListComponent, changeData, currentFilter, changeWatchedFilms, filmId) {
    this.#filmsListComponent = filmListComponent;
    this.#changeData = changeData;
    this.#currentFilter = currentFilter;
    this.#changeWatchedFilms = changeWatchedFilms;

    this.#mode = Mode.CARD;
    this.#filmId = filmId;

    this.#commentsModel = new CommentsModel(new ApiService(END_POINT, AUTHORIZATION, this.#filmId));
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  init = (film) => {
    this.#film = film;

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film, this.#commentsModel.comments, this.#handleViewAction);

    this.#filmCardComponent.setCardClickHandler(this.#handleCardClick);
    this.#filmCardComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmCardComponent.setWatchedClickHandler(this.#handleWatchedClick);
    this.#filmCardComponent.setFavoriteClickHandler(this.#handleFavoriteClick);

    if (prevFilmCardComponent === null) {
      render(this.#filmsListComponent.container, this.#filmCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#filmsListComponent.element.contains(prevFilmCardComponent.element)) {
      replace(this.#filmCardComponent, prevFilmCardComponent);
    }

    this.#initPopup(this.#film);
    if (document.body.contains(prevFilmPopupComponent.element)) {
      const scrollPosition = prevFilmPopupComponent.element.scrollTop;

      replace(this.#filmPopupComponent, prevFilmPopupComponent);
      this.#filmPopupComponent.renderCommentInfo();

      this.#filmPopupComponent.element.scrollTop = scrollPosition;

      this.#setPopupHandlers();

      remove(prevFilmPopupComponent);
    }

    remove(prevFilmCardComponent);
  };

  get comments() {
    const comments = this.#commentsModel.comments;

    return comments;
  }

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent);
  };

  #initPopup = (film) => {
    this.#film = film;

    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmPopupComponent = new FilmPopupView(film, this.#commentsModel.comments, this.#handleViewAction);

    if (document.body.contains(prevFilmPopupComponent.element)) {
      const scrollPosition = prevFilmPopupComponent.element.scrollTop;

      replace(this.#filmPopupComponent, prevFilmPopupComponent);
      this.#filmPopupComponent.renderCommentInfo();

      this.#filmPopupComponent.element.scrollTop = scrollPosition;

      this.#setPopupHandlers();
      remove(prevFilmPopupComponent);
    }
  };

  #handleEscKeyDown = (evt) => {
    if (evt.key === KeyboardKeys.ESCAPE || evt.key === KeyboardKeys.ESC) {
      evt.preventDefault();
      this.#removePopup();
      document.removeEventListener('keydown', this.#handleEscKeyDown);
    }
  };

  #renderPopup = () => {
    const popup = this.#filmPopupComponent instanceof AbstractView ? this.#filmPopupComponent.element : this.#filmPopupComponent;
    document.body.appendChild(popup);
    this.#commentsModel.init();
    console.log(this.#commentsModel.comments);
    document.body.classList.add('hide-overflow');

    this.#setPopupHandlers();

    this.#mode = Mode.POPUP;
  };

  #setPopupHandlers = () => {
    this.#filmPopupComponent.setCloseClickHandler(() => {
      this.#removePopup();
      document.removeEventListener('keydown', this.#handleEscKeyDown);
    });

    this.#filmPopupComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmPopupComponent.setWatchedClickHandler(this.#handleWatchedClick);
    this.#filmPopupComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
  };

  #removePopup = () => {
    document.body.querySelector('.film-details').remove();
    document.body.classList.remove('hide-overflow');
    this.#mode = Mode.CARD;
  };

  #removePrevPopup = () => {
    if (document.body.querySelector('.film-details')) {
      document.body.querySelector('.film-details').remove();
      document.removeEventListener('keydown', this.#handleEscKeyDown);
    }
  };

  #handleCardClick = () => {
    if (!document.body.contains(this.#filmPopupComponent.element)) {
      document.addEventListener('keydown', this.#handleEscKeyDown);
      this.#removePrevPopup();
      this.#renderPopup();
    }
  };

  #handleViewAction = (actionType, update) => {
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.#commentsModel.addComment(actionType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#commentsModel.deleteComment(actionType, update);
        break;
    }
  };

  #handleModelEvent = (actionType, data) => {
    console.log(actionType);
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.#changeData(UserAction.ADD_COMMENT, UpdateType.PATCH, { ...this.#film, comments: this.#film.comments.concat([data]) });
        break;
      case UserAction.DELETE_COMMENT:
        this.#changeData(UserAction.DELETE_COMMENT, UpdateType.PATCH, { ...this.#film, comments: this.#film.comments.filter((comment) => comment.id !== data) });
        break;
      case UserAction.INIT:
        console.log(this.comments);
        this.#filmPopupComponent.renderCommentInfo(this.comments);
    }
  };

  #handleWatchlistClick = () => {
    this.#changeData(UserAction.UPDATE_FILM, this.#currentFilter !== FilterType.WATCHLIST ? UpdateType.PATCH : UpdateType.MINOR, {
      ...this.#film,
      userDetails: {
        watchlist: !this.#film.userDetails.watchlist,
        alreadyWatched: this.#film.userDetails.alreadyWatched,
        watchingDate: this.#film.userDetails.watchingDate,
        favorite: this.#film.userDetails.favorite,
      },
    });

    if (this.#mode === Mode.POPUP) {
      this.#initPopup(this.#film);
    }
  };

  #handleWatchedClick = () => {
    this.#changeData(UserAction.UPDATE_FILM, this.#currentFilter !== FilterType.HISTORY ? UpdateType.PATCH : UpdateType.MINOR, {
      ...this.#film,
      userDetails: {
        watchlist: this.#film.userDetails.watchlist,
        alreadyWatched: !this.#film.userDetails.alreadyWatched,
        watchingDate: this.#film.userDetails.watchingDate,
        favorite: this.#film.userDetails.favorite,
      },
    });

    if (this.#mode === Mode.POPUP) {
      this.#initPopup(this.#film);
    }

    this.#changeWatchedFilms();
  };

  #handleFavoriteClick = () => {
    this.#changeData(UserAction.UPDATE_FILM, this.#currentFilter !== FilterType.FAVORITES ? UpdateType.PATCH : UpdateType.MINOR, {
      ...this.#film,
      userDetails: {
        watchlist: this.#film.userDetails.watchlist,
        alreadyWatched: this.#film.userDetails.alreadyWatched,
        watchingDate: this.#film.userDetails.watchingDate,
        favorite: !this.#film.userDetails.favorite,
      },
    });

    if (this.#mode === Mode.POPUP) {
      this.#initPopup(this.#film);
    }
  };
}
