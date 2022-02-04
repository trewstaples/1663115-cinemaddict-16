import { KeyboardKey, UserAction, UpdateType, Mode, FilterType, Server } from '../utils/const.js';
import { render, replace, remove, RenderPosition } from '../utils/render.js';
import AbstractView from '../view/abstract-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import CommentsModel from '../model/comments-model.js';
import ApiService from '../api-service.js';

export const State = {
  SAVING: 'SAVING',
  DELETING: 'DELETING',
  ABORTING: 'ABORTING',
};

export default class FilmPresenter {
  #filmsListComponent = null;
  #changeData = null;
  #currentFilter = null;
  #changeWatchedFilms = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;
  #commentsModel = null;
  #mode = null;

  constructor(filmListComponent, changeData, currentFilter, changeWatchedFilms) {
    this.#filmsListComponent = filmListComponent;
    this.#changeData = changeData;
    this.#currentFilter = currentFilter;
    this.#changeWatchedFilms = changeWatchedFilms;

    this.#mode = Mode.CARD;

    this.#commentsModel = new CommentsModel(new ApiService(Server.END_POINT, Server.AUTHORIZATION));
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  get comments() {
    const comments = this.#commentsModel.comments;

    return comments;
  }

  init = (film) => {
    this.#film = film;

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film, this.#handleViewAction);

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
      this.#changeWatchedFilms();
    }

    if (document.body.contains(prevFilmPopupComponent.element)) {
      const scrollPosition = prevFilmPopupComponent.element.scrollTop;

      replace(this.#filmPopupComponent, prevFilmPopupComponent);
      this.#filmPopupComponent.renderCommentList(this.comments);

      this.#filmPopupComponent.element.scrollTop = scrollPosition;

      this.#setPopupHandlers();

      remove(prevFilmPopupComponent);
    }

    remove(prevFilmCardComponent);
  };

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent);
  };

  setViewState = (state, id = null) => {
    if (this.#mode === Mode.CARD) {
      return;
    }

    this.#filmPopupComponent.updateData(state, id);
  };

  #handleViewAction = async (actionType, update) => {
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.setViewState(State.SAVING);
        try {
          await this.#commentsModel.addComment(actionType, update, this.#film.id);
        } catch (err) {
          this.setViewState(State.ABORTING);
        }
        break;
      case UserAction.DELETE_COMMENT:
        this.setViewState(State.DELETING, update);
        try {
          await this.#commentsModel.deleteComment(actionType, update);
        } catch (err) {
          this.setViewState(State.ABORTING, update);
        }
        break;
    }
  };

  #handleModelEvent = (actionType, data) => {
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.#changeData(UserAction.ADD_COMMENT, UpdateType.BLOCK, { ...this.#film, comments: data.comments.map((comment) => comment.id) });
        break;
      case UserAction.DELETE_COMMENT:
        this.#changeData(UserAction.DELETE_COMMENT, UpdateType.BLOCK, { ...this.#film, comments: this.#film.comments.filter((comment) => comment !== data) });
        break;
      case UserAction.INIT:
        this.#filmPopupComponent.renderCommentList(this.comments);
    }
  };

  #removePrevPopup = () => {
    if (document.body.querySelector('.film-details')) {
      document.body.querySelector('.film-details').remove();
      document.removeEventListener('keydown', this.#handleEscKeyDown);
    }
  };

  #renderPopup = () => {
    this.#commentsModel.init(this.#film);

    const popup = this.#filmPopupComponent instanceof AbstractView ? this.#filmPopupComponent.element : this.#filmPopupComponent;
    document.body.classList.add('hide-overflow');
    document.body.appendChild(popup);
    this.#setPopupHandlers();
    this.#mode = Mode.POPUP;

    if (!this.comments.length) {
      this.#commentsModel.init(this.#film);
      return;
    }
    this.#handleModelEvent(UserAction.INIT);
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

  #handleCardClick = () => {
    if (!document.body.contains(this.#filmPopupComponent.element)) {
      document.addEventListener('keydown', this.#handleEscKeyDown);
      this.#removePrevPopup();
      this.#renderPopup();
    }
  };

  #handleEscKeyDown = (evt) => {
    if (evt.key === KeyboardKey.ESCAPE || evt.key === KeyboardKey.ESC) {
      evt.preventDefault();
      this.#removePopup();
      document.removeEventListener('keydown', this.#handleEscKeyDown);
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
  };
}
