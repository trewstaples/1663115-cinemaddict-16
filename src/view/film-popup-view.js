import { UserAction } from '../utils/const.js';
import { render, RenderPosition, remove } from '../utils/render.js';
import { getClassName, createTemplateFromArray } from '../utils/films.js';
import { formatRuntime, formatReleaseDate } from '../utils/date.js';
import SmartView from './smart-view.js';
import CommentInfoView from './comment-info-view.js';
import CommentView from './comments-view.js';
import PostCommentView from './post-comment-view.js';
import { State } from '../presenter/film-presenter.js';

const renderFilmPopupTemplate = (film) => {
  const { info, userDetails } = film;

  const genresNaming = info.genre.length > 1 ? 'Genres' : 'Genre';
  const createGenreTemplate = (genre) => `<span class="film-details__genre">${genre}</span>`;

  const watchlistClassName = getClassName(userDetails.watchlist, 'film-details__control-button--active');
  const wactchedButtonClassName = getClassName(userDetails.alreadyWatched, 'film-details__control-button--active');
  const favoriteClassName = getClassName(userDetails.favorite, 'film-details__control-button--active');

  return `<section class="film-details">
  <form class="film-details__inner" action="" method="get">
    <div class="film-details__top-container">
      <div class="film-details__close">
        <button class="film-details__close-btn" type="button">close</button>
      </div>
      <div class="film-details__info-wrap">
        <div class="film-details__poster">
          <img class="film-details__poster-img" src=${info.poster} alt="">

          <p class="film-details__age">${info.ageRating}+</p>
        </div>

        <div class="film-details__info">
          <div class="film-details__info-head">
            <div class="film-details__title-wrap">
              <h3 class="film-details__title">${info.title}</h3>
              <p class="film-details__title-original">Original: ${info.alternativeTitle}</p>
            </div>

            <div class="film-details__rating">
              <p class="film-details__total-rating">${info.totalRating}</p>
            </div>
          </div>

          <table class="film-details__table">
            <tr class="film-details__row">
              <td class="film-details__term">Director</td>
              <td class="film-details__cell">${info.director}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">Writers</td>
              <td class="film-details__cell">${info.writers.join(', ')}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">Actors</td>
              <td class="film-details__cell">${info.actors.join(', ')}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">Release Date</td>
              <td class="film-details__cell">${formatReleaseDate(info.release.date)}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">Runtime</td>
              <td class="film-details__cell">${formatRuntime(info.runtime)}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">Country</td>
              <td class="film-details__cell">${info.release.country}</td>
            </tr>
            <tr class="film-details__row">
              <td class="film-details__term">${genresNaming}</td>
              <td class="film-details__cell">
                ${createTemplateFromArray(info.genre, createGenreTemplate)}
            </tr>
          </table>

          <p class="film-details__film-description">
          ${info.description}
          </p>
        </div>
      </div>

      <section class="film-details__controls">
        <button type="button" class="film-details__control-button film-details__control-button--watchlist ${watchlistClassName}" id="watchlist" name="watchlist">Add to watchlist</button>
        <button type="button" class="film-details__control-button film-details__control-button--watched ${wactchedButtonClassName}" id="watched" name="watched">Already watched</button>
        <button type="button" class="film-details__control-button film-details__control-button--favorite ${favoriteClassName}" id="favorite" name="favorite">Add to favorites</button>
      </section>
    </div>

  </form>
</section>
`;
};

export default class FilmPopupView extends SmartView {
  #film = null;
  #container = null;
  #commentList = null;
  #changeCommentData = null;
  #commentInfoComponent = null;
  #commentComponent = null;
  #postCommentComponent = null;
  #comments = new Map();

  constructor(film, changeCommentData) {
    super();

    this.#film = film;
    this.#changeCommentData = changeCommentData;
  }

  get template() {
    return renderFilmPopupTemplate(this.#film);
  }

  get container() {
    this.#container = this.element.querySelector('.film-details__inner');

    return this.#container;
  }

  get commentList() {
    this.#commentList = this.element.querySelector('.film-details__comments-list');
    return this.#commentList;
  }

  updateData = (state, id) => {
    switch (state) {
      case State.SAVING:
        this.#postCommentComponent.updateData({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this.#comments.get(id).updateData({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case State.ABORTING:
        if (id !== null) {
          this.#setCommentAborting(id);
        } else {
          this.#setPostCommentAborting();
        }
        break;
    }
  };

  #setCommentAborting = (id) => {
    const resetFormState = () => {
      this.#comments.get(id).updateData({
        isDisabled: true,
        isDeleting: false,
      });
    };
    this.#comments.get(id).shake(resetFormState);
  };

  #setPostCommentAborting = () => {
    const resetFormState = () => {
      this.#postCommentComponent.updateData({
        isDisabled: false,
        isSaving: false,
      });
    };
    this.#postCommentComponent.shake(resetFormState);
  };

  #removeCommentList = () => {
    this.#comments.forEach((comment) => remove(comment));
    this.#comments.clear();
  };

  renderCommentList = (comments) => {
    this.#renderCommentInfo(comments);
    this.#renderComments(comments);
    this.#renderPostComment();
  };

  #renderCommentInfo = (comments) => {
    const prevCommentInfoComponent = this.#commentInfoComponent;
    this.#commentInfoComponent = new CommentInfoView(comments);
    render(this.container, this.#commentInfoComponent, RenderPosition.BEFOREEND);
    remove(prevCommentInfoComponent);
  };

  #renderComments = (comments) => {
    this.#removeCommentList();
    for (const comment of comments) {
      this.#commentComponent = new CommentView(comment);
      this.#commentComponent.setDeleteClickHandler(this.#handleDeleteCommentClick);
      render(this.commentList, this.#commentComponent, RenderPosition.BEFOREEND);
      this.#comments.set(comment.id, this.#commentComponent);
    }
  };

  #handleDeleteCommentClick = (update) => {
    this.#changeCommentData(UserAction.DELETE_COMMENT, update);
  };

  #renderPostComment = () => {
    const prevPostCommentComponent = this.#postCommentComponent;
    this.#postCommentComponent = new PostCommentView();
    this.#postCommentComponent.setCommentKeydownHandler(this.#handleCommentKeydown);
    render(this.commentList, this.#postCommentComponent, RenderPosition.AFTEREND);
    remove(prevPostCommentComponent);
  };

  #handleCommentKeydown = (update) => {
    this.#changeCommentData(UserAction.ADD_COMMENT, update);
  };

  restoreHandlers = () => {
    this.setCloseClickHandler(this._callback.closeClick);
    this.setWatchlistClickHandler(this._callback.watchlistClick);
    this.setWatchedClickHandler(this._callback.watchedClick);
    this.setFavoriteClickHandler(this._callback.favoriteClick);
  };

  setCloseClickHandler = (callback) => {
    this._callback.closeClick = callback;
    this.element.querySelector('.film-details__close-btn').addEventListener('click', this.#closeClickHandler);
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.closeClick();
  };

  setWatchlistClickHandler = (callback) => {
    this._callback.watchlistClick = callback;
    this.element.querySelector('.film-details__control-button--watchlist').addEventListener('click', this.#watchlistClickHandler);
  };

  #watchlistClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.watchlistClick();
  };

  setWatchedClickHandler = (callback) => {
    this._callback.watchedClick = callback;
    this.element.querySelector('.film-details__control-button--watched').addEventListener('click', this.#watchedClickHandler);
  };

  #watchedClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.watchedClick();
  };

  setFavoriteClickHandler = (callback) => {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.film-details__control-button--favorite').addEventListener('click', this.#favoriteClickHandler);
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };
}
