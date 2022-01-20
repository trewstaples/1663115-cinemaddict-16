import { EvtKey, EMOTIONS, Runtime, StringFormats } from '../utils/const.js';
import { getClassName, createTemplateFromArray } from '../utils/films.js';
import { UserAction } from '../utils/const.js';
import { render, RenderPosition } from '../utils/render.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import SmartView from './smart-view.js';
import CommentView from './comments-view.js';

const renderFilmPopupTemplate = (data, comments) => {
  const { info, userDetails, isEmoji, isMessage, isEmojiChecked } = data;

  const genresNaming = info.genre.length > 1 ? 'Genres' : 'Genre';
  const createGenreTemplate = (genre) => `<span class="film-details__genre">${genre}</span>`;

  const formatRuntime = (minutesDuration) => {
    dayjs.extend(duration);
    let formatString = StringFormats.RUNTIME_MINUTES;
    if (minutesDuration >= Runtime.MINUTES_IN_HOUR) {
      formatString = StringFormats.RUNTIME_HOURS;
    }

    const runtime = dayjs.duration(minutesDuration, 'm').format(formatString);
    return runtime;
  };

  const formatReleaseDate = (releaseDate) => dayjs(releaseDate).format(StringFormats.RELEASE_DATE);

  const renderEmojiItemTemplate = (emoji) => `<input class="film-details__emoji-item visually-hidden"
  name="comment-emoji" type="radio" id="emoji-${emoji}" value="${emoji}" ${isEmojiChecked === `emoji-${emoji}` ? 'checked' : ''}>
<label class="film-details__emoji-label" for="emoji-${emoji}">
  <img src="./images/emoji/${emoji}.png" width="30" height="30" alt="emoji">
</label>`;

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

          <p class="film-details__age">${info.ageRating}</p>
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

    <div class="film-details__bottom-container">
      <section class="film-details__comments-wrap">
        <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments.length}</span></h3>

        <ul class="film-details__comments-list">
        </ul>

        <div class="film-details__new-comment">
          <div class="film-details__add-emoji-label">${isEmoji}
          </div>

          <label class="film-details__comment-label">
            <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment">${isMessage}</textarea>
          </label>

          <div class="film-details__emoji-list">
          ${createTemplateFromArray(EMOTIONS, renderEmojiItemTemplate)}
          </div>
        </div>
      </section>
    </div>
  </form>
</section>
`;
};

export default class FilmPopupView extends SmartView {
  #film = null;
  #changeCommentData = null;
  #container = null;
  #filmComments = [];
  emoji = null;
  commentText = null;

  constructor(film, filmComments, changeCommentData) {
    super();
    this._data = FilmPopupView.parseFilmToData(film);
    this.#filmComments = [...filmComments];
    this.#changeCommentData = changeCommentData;

    this.#setInnerHandlers();
  }

  get template() {
    return renderFilmPopupTemplate(this._data, this.#filmComments);
  }

  get container() {
    this.#container = this.element.querySelector('.film-details__comments-list');

    return this.#container;
  }

  renderCommentInfo = () => {
    this.#renderComments();
    // this.#renderAddComment();
  };

  #renderComments = () => {
    for (const comment of this.#filmComments) {
      const commentComponent = new CommentView(comment);
      commentComponent.setDeleteClickHandler(this.#handleDeleteCommentClick);
      render(this.container, commentComponent, RenderPosition.BEFOREEND);
    }
  };

  #handleDeleteCommentClick = (update) => {
    this.#changeCommentData(UserAction.DELETE_COMMENT, update);
  };

  /*
  #renderAddComment = () => {
    const addCommentComponent = new AddCommentView();
    addCommentComponent.setFormKeydownHandler(this.#addCommentKeydownHandler);
    render(this.container, addCommentComponent, RenderPosition.AFTEREND);
  }; */

  /*   #addCommentKeydownHandler = (update) => {
    this.#changeCommentData(UserAction.ADD_COMMENT, update);
  }; */

  reset = (film) => {
    this.updateData(FilmPopupView.parseFilmToData(film));
  };

  restoreHandlers = () => {
    this.#setInnerHandlers();
    this.setCloseClickHandler(this._callback.closeClick);
    this.setWatchlistClickHandler(this._callback.watchlistClick);
    this.setWatchedClickHandler(this._callback.watchedClick);
    this.setFavoriteClickHandler(this._callback.favoriteClick);
  };

  #setInnerHandlers = () => {
    const emojies = this.element.querySelectorAll('.film-details__emoji-list input[name="comment-emoji"]');
    emojies.forEach((emoji) => emoji.addEventListener('click', this.#emojiClickHandler));
    this.element.querySelector('.film-details__comment-input').addEventListener('input', this.#commentInputHandler);
    this.setCommentPostHandler(this._callback.postComment);
  };

  #emojiClickHandler = (evt) => {
    evt.preventDefault();
    this.updateData({
      isEmoji: `<img src="images/emoji/${evt.target.value}.png" width="55" height="55" alt="emoji-${evt.target.value}">`,
      isEmojiChecked: evt.target.id,
    });
    this.emoji = evt.target.value;
  };

  #commentInputHandler = (evt) => {
    evt.preventDefault();
    this.updateData(
      {
        isMessage: evt.target.value,
      },
      true,
    );
  };

  setCommentPostHandler = (callback) => {
    this._callback.postComment = callback;
    this.element.querySelector('.film-details__comment-input').addEventListener('keydown', this.#commentPostHandler);
  };

  #commentPostHandler = (evt) => {
    if ((evt.ctrlKey || evt.metaKey) && evt.code === EvtKey.ENTER) {
      evt.preventDefault();
      this.commentText = evt.target.value;
      this._callback.postComment(this.emoji, this.commentText);
    }
  };

  setCloseClickHandler = (callback) => {
    this._callback.closeClick = callback;
    this.element.querySelector('.film-details__close-btn').addEventListener('click', this.#closeClickHandler);
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    FilmPopupView.parseDataToFilm(this._data);
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

  static parseFilmToData = (film) => ({ ...film, isEmoji: '', isMessage: '', isEmojiChecked: '' });

  static parseDataToFilm = (data) => {
    const film = { ...data };

    delete film.isEmoji;
    delete film.isMessage;
    delete film.isEmojiChecked;

    return film;
  };
}
