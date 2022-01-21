import { KeyboardKeys, UserAction, UpdateType, Mode, FilterType } from '../utils/const.js';
import { render, replace, remove, RenderPosition } from '../utils/render.js';
import AbstractView from '../view/abstract-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import CommentsModel from '../model/comments-model.js';

//Отрегулировать changeWatchedData
//Разобраться с AbstractView
//Настроить удаление комментариев (не отображаются в карточке), добавление - отображается
//Подумать, как объеденить метод initPopup в один
//Чекнуть ошибку, которая вылетает в консоль при клике мимо фильтрации
export default class FilmPresenter {
  #filmsListComponent = null;
  #changeData = null;
  #removePrevPopup = null;
  #currentFilter = null;
  #changeWatchedFilms = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;
  #commentsModel = null;
  #mode = null;

  constructor(filmListComponent, removePrevPopup, comments, changeData, currentFilter, changeWatchedFilms) {
    this.#filmsListComponent = filmListComponent;
    this.#changeData = changeData;
    this.#removePrevPopup = removePrevPopup;
    this.#currentFilter = currentFilter;
    this.#changeWatchedFilms = changeWatchedFilms;

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

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent); //-удалять или нет?
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
    document.addEventListener('keydown', this.#handleEscKeyDown);
    //    const popup = this.#filmPopupComponent instanceof AbstractView ? this.#filmPopupComponent.element : this.#filmPopupComponent;
    render(document.body, this.#filmPopupComponent, RenderPosition.BEFOREEND); //document.body.appendChild(popup);
    this.#filmPopupComponent.renderCommentInfo();
    document.body.classList.add('hide-overflow');

    this.#setPopupHandlers();

    this.#mode = Mode.EDIT;
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
    remove(this.#filmPopupComponent);
    document.body.classList.remove('hide-overflow');
    this.#mode = Mode.DEFAULT;
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

  #handleCardClick = () => {
    if (!document.body.contains(this.#filmPopupComponent.element)) {
      this.#removePrevPopup();
      this.#renderPopup();
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

    if (this.#mode === Mode.EDIT) {
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

    if (this.#mode === Mode.EDIT) {
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

    if (this.#mode === Mode.EDIT) {
      this.#initPopup(this.#film);
    }
  };
}
