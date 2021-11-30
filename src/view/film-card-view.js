export const renderFilCardTemplate = (film) => {
  const { comments, info } = film;
  return `
  <article class="film-card">
  <a class="film-card__link">
    <h3 class="film-card__title">${info.title}</h3>
    <p class="film-card__rating">${info.totalRating}</p>
    <p class="film-card__info">
      <span class="film-card__year">${info.release.date}</span>
      <span class="film-card__duration">${info.runtime}</span>
      <span class="film-card__genre">${info.genre}</span>
    </p>
    <img src=${info.poster} alt="" class="film-card__poster">
    <p class="film-card__description">${info.description}</p>
    <span class="film-card__comments">${comments.length} comments</span>
  </a>
  <div class="film-card__controls">
    <button class="film-card__controls-item film-card__controls-item--add-to-watchlist film-card__controls-item--active" type="button">Add to watchlist</button>
    <button class="film-card__controls-item film-card__controls-item--mark-as-watched" type="button">Mark as watched</button>
    <button class="film-card__controls-item film-card__controls-item--favorite" type="button">Mark as favorite</button>
  </div>
</article>
  `;
};
