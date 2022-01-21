import { KeyboardKeys, UserAction, UpdateType, Mode } from '../utils/const.js';
import { render, replace, remove, renderCard, RenderPosition } from '../utils/render.js';
import AbstractView from '../view/abstract-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import CommentsModel from '../model/comments-model.js';

export default class FilmPresenter {
  #filmsListComponent = null;
  #changeData = null;
  #removePopup = null;
  #filterType = null;
  #changeWatchedData = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;
  #commentsModel = null;
  #mode = null;

  constructor(filmListComponent, changeData, comments, removePopup, filterType, changeWatchedData) {
    this.#filmsListComponent = filmListComponent;
    this.#changeData = changeData;
    this.#removePopup = removePopup;
    this.#filterType = filterType;
    this.#changeWatchedData = changeWatchedData;

    this.#mode = Mode.DEFAULT;

    this.#commentsModel = new CommentsModel();
    this.#commentsModel.comments = comments;
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  init = (film) => {
    this.#film = film;

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film, this.#commentsModel.comments, this.#handleViewAction);

    this.#filmCardComponent.setEditClickHandler(this.#replaceCardToPopup);
    this.#filmPopupComponent.setCloseClickHandler(() => {
      this.#filmPopupComponent.reset(this.#film);
      this.#replacePopupToCard();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    });

    this.#filmCardComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmCardComponent.setWatchedClickHandler(this.#handleAlreadyWatchedClick);
    this.#filmCardComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#filmPopupComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmPopupComponent.setWatchedClickHandler(this.#handleAlreadyWatchedClick);
    this.#filmPopupComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    // this.#filmPopupComponent.setCommentPostHandler(this.#handleCommentPost);

    if (prevFilmCardComponent === null || prevFilmPopupComponent === null) {
      render(this.#filmsListComponent.container, this.#filmCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#filmsListComponent.element.contains(prevFilmCardComponent.element)) {
      replace(this.#filmCardComponent, prevFilmCardComponent);
    }
    if (document.body.contains(prevFilmPopupComponent.element)) {
      const scrollPosition = prevFilmPopupComponent.element.scrollTop;

      replace(this.#filmPopupComponent, prevFilmPopupComponent);
      this.#filmPopupComponent.renderCommentInfo();

      this.#filmPopupComponent.element.scrollTop = scrollPosition;
    }

    remove(prevFilmCardComponent);
    remove(prevFilmPopupComponent);
  };

  get comments() {
    return this.#commentsModel.comments;
  }

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent);
  };

  #replacePopupToCard = () => {
    renderCard(this.#filmPopupComponent);
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === KeyboardKeys.ESCAPE || evt.key === KeyboardKeys.ESC) {
      evt.preventDefault();
      this.#filmPopupComponent.reset(this.#film);
      this.#replacePopupToCard();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    }
  };

  #removePrevPopup = () => {
    if (document.body.querySelector('.film-details')) {
      document.body.querySelector('.film-details').remove();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    }
  };

  #replaceCardToPopup = () => {
    document.addEventListener('keydown', this.#onEscKeyDown);
    this.#removePrevPopup();
    const popup = this.#filmPopupComponent instanceof AbstractView ? this.#filmPopupComponent.element : this.#filmPopupComponent;
    document.body.appendChild(popup);
    this.#filmPopupComponent.renderCommentInfo();
    document.body.classList.add('hide-overflow');
  };

  #handleWatchlistClick = () => {
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.MINOR, {
      ...this.#film,
      userDetails: {
        watchlist: !this.#film.userDetails.watchlist,
        alreadyWatched: this.#film.userDetails.alreadyWatched,
        watchingDate: this.#film.userDetails.watchingDate,
        favorite: this.#film.userDetails.favorite,
      },
    });
  };

  #handleAlreadyWatchedClick = () => {
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.MINOR, {
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
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.MINOR, {
      ...this.#film,
      userDetails: {
        watchlist: this.#film.userDetails.watchlist,
        alreadyWatched: this.#film.userDetails.alreadyWatched,
        watchingDate: this.#film.userDetails.watchingDate,
        favorite: !this.#film.userDetails.favorite,
      },
    });
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
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.#changeData(UserAction.ADD_COMMENT, UpdateType.PATCH, { ...this.#film, comments: this.#film.comments.concat([data.id]) });
        break;
      case UserAction.DELETE_COMMENT:
        this.#changeData(UserAction.DELETE_COMMENT, UpdateType.PATCH, { ...this.#film, comments: this.#film.comments.filter((comment) => comment !== data) });
        break;
    }
  };

  #handleCommentPost = (emoji, comment) => {
    this.#handleViewAction(UserAction.ADD_COMMENT, UpdateType.PATCH, {
      comment: {
        id: 0,
        author: 'Michael Jordan',
        date: 'Now',
        comment: comment,
        emotion: emoji,
      },
    });
  };
}
