import dayjs from 'dayjs';

export const renderFilCardTemplate = (film) => {
  const { comments, info, userDetails } = film;
  const description = info.description.length > 140 ? info.description.slice(0, 139).concat('...') : info.description;
  const date = dayjs(info.release.date).format('YYYY');

  const watchlistClassName = userDetails.watchlist ? 'active' : '';
  const wactchedButtonClassName = userDetails.alreadyWatched ? 'film-card__controls-item--active' : '';
  const favoriteClassName = userDetails.favorite ? 'film-card__controls-item--active' : '';

  return `
  <article class="film-card">
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
    <button class="film-card__controls-item film-card__controls-item--add-to-watchlist film-card__controls-item--${watchlistClassName}" type="button">Add to watchlist</button>
    <button class="film-card__controls-item film-card__controls-item--mark-as-watched ${wactchedButtonClassName}" type="button">Mark as watched</button>
    <button class="film-card__controls-item film-card__controls-item--favorite ${favoriteClassName}" type="button">Mark as favorite</button>
  </div>
</article>
  `;
};
