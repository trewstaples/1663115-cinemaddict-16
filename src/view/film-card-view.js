import { StringFormat } from '../utils/const.js';
import { getClassName } from '../utils/films.js';
import { formatRuntime } from '../utils/date.js';
import AbstractView from './abstract-view.js';
import dayjs from 'dayjs';

const renderFilmTemplate = (film) => {
  const { info, userDetails, comments } = film;
  const description = info.description.length > 140 ? info.description.slice(0, 139).concat('...') : info.description;
  const date = dayjs(info.release.date).format(StringFormat.RELEASE_YEAR);

  const watchlistClassName = getClassName(userDetails.watchlist, 'film-card__controls-item--active');
  const wactchedButtonClassName = getClassName(userDetails.alreadyWatched, 'film-card__controls-item--active');
  const favoriteClassName = getClassName(userDetails.favorite, 'film-card__controls-item--active');

  return `<article class="film-card">
  <a class="film-card__link">
    <h3 class="film-card__title">${info.title}</h3>
    <p class="film-card__rating">${info.totalRating}</p>
    <p class="film-card__info">
      <span class="film-card__year">${date}</span>
      <span class="film-card__duration">${formatRuntime(info.runtime)}</span>
      <span class="film-card__genre">${info.genre.join(', ')}</span>
    </p>
    <img src=${info.poster} alt="" class="film-card__poster">
    <p class="film-card__description">${description}</p>
    <span class="film-card__comments">${comments.length} comments</span>
  </a>
  <div class="film-card__controls">
    <button class="film-card__controls-item film-card__controls-item--add-to-watchlist ${watchlistClassName}" type="button">Add to watchlist</button>
    <button class="film-card__controls-item film-card__controls-item--mark-as-watched ${wactchedButtonClassName}" type="button">Mark as watched</button>
    <button class="film-card__controls-item film-card__controls-item--favorite ${favoriteClassName}" type="button">Mark as favorite</button>
  </div>
</article>
  `;
};

export default class FilmCardView extends AbstractView {
  #film = null;

  constructor(film) {
    super();

    this.#film = film;
  }

  get template() {
    return renderFilmTemplate(this.#film);
  }

  setCardClickHandler = (callback) => {
    this._callback.cardClick = callback;
    this.element.querySelector('.film-card__link').addEventListener('click', this.#cardClickHandler);
  };

  setWatchlistClickHandler = (callback) => {
    this._callback.watchlistClick = callback;
    this.element.querySelector('.film-card__controls-item--add-to-watchlist').addEventListener('click', this.#watchlistClickHandler);
  };

  setWatchedClickHandler = (callback) => {
    this._callback.watchedClick = callback;
    this.element.querySelector('.film-card__controls-item--mark-as-watched').addEventListener('click', this.#watchedClickHandler);
  };

  setFavoriteClickHandler = (callback) => {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.film-card__controls-item--favorite').addEventListener('click', this.#favoriteClickHandler);
  };

  #cardClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.cardClick(this.#film);
  };

  #watchlistClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.watchlistClick();
  };

  #watchedClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.watchedClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };
}
