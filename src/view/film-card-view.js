import dayjs from 'dayjs';
import { getClassName } from '../utils/films.js';
import AbstractView from './abstract-view.js';

const renderFilmTemplate = (film) => {
  const { comments, info, userDetails } = film;
  const description = info.description.length > 140 ? info.description.slice(0, 139).concat('...') : info.description;
  const date = dayjs(info.release.date).format('YYYY');

  const watchlistClassName = getClassName(userDetails.watchlist, 'film-card__controls-item--active');
  const wactchedButtonClassName = getClassName(userDetails.alreadyWatched, 'film-card__controls-item--active');
  const favoriteClassName = getClassName(userDetails.favorite, 'film-card__controls-item--active');

  return `<article class="film-card">
  <a class="film-card__link">
    <h3 class="film-card__title">${info.title}</h3>
    <p class="film-card__rating">${info.totalRating}</p>
    <p class="film-card__info">
      <span class="film-card__year">${date}</span>
      <span class="film-card__duration">${info.runtime}</span>
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
  #films = null;
  #filmCardLink = null;

  constructor(films) {
    super();
    this.#films = films;
  }

  get template() {
    return renderFilmTemplate(this.#films);
  }

  get filmCardLink() {
    this.#filmCardLink = this.element.querySelector('.film-card__link');

    return this.#filmCardLink;
  }

  setEditClickHandler = (callback) => {
    this._callback.editClick = callback;
    this.filmCardLink.addEventListener('click', this.#editClickHandler);
  };

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.editClick();
  };

  setFavoriteClickHandler = (callback) => {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.film-card__controls-item--favorite').addEventListener('click', this.#favoriteClickHandler);
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };

  setWatchedClickHandler = (callback) => {
    this._callback.alreadyWatched = callback;
    this.element.querySelector('.film-card__controls-item--mark-as-watched').addEventListener('click', this.#watchedClickHandler);
  };

  #watchedClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.alreadyWatched();
  };

  setWatchlistClickHandler = (callback) => {
    this._callback.watchlist = callback;
    this.element.querySelector('.film-card__controls-item--add-to-watchlist').addEventListener('click', this.#watchlistClickHandler);
  };

  #watchlistClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.watchlist();
  };
}
