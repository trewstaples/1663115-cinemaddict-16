import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import { EvtKey, UserAction, UpdateType } from '../utils/const.js';
import { render, replace, remove, renderCard, RenderPosition } from '../utils/render.js';
import AbstractView from '../view/abstract-view.js';

export default class FilmPresenter {
  #filmsListComponent = null;
  #changeData = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;
  #commentsModel = null;

  constructor(filmListComponent, changeData, commentsModel) {
    this.#filmsListComponent = filmListComponent;
    this.#changeData = changeData;
    this.#commentsModel = commentsModel;

    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  init = (film) => {
    this.#film = film;

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film, this.#changeData);

    this.#filmCardComponent.setEditClickHandler(this.#replaceCardToPopup);
    this.#filmPopupComponent.setCloseClickHandler(() => {
      this.#filmPopupComponent.reset(this.#film);
      this.#replacePopupToCard();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    });

    this.#filmCardComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#filmCardComponent.setWatchedClickHandler(this.#handleAlreadyWatchedClick);
    this.#filmCardComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmPopupComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#filmPopupComponent.setWatchedClickHandler(this.#handleAlreadyWatchedClick);
    this.#filmPopupComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
    this.#filmPopupComponent.setCommentPostHandler(this.#handleCommentPost);

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
    if (evt.key === EvtKey.ESCAPE || evt.key === EvtKey.ESC) {
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
    document.body.classList.add('hide-overflow');
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

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.ADD_COMMENT:
        this.#commentsModel.addComment(updateType, update);
        console.log(this.comments);
        break;
      case UserAction.DELETE_COMMENT:
        this.#commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)

        break;
      case UpdateType.MINOR:
        // - обновить список (например, когда задача ушла в архив)
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
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
