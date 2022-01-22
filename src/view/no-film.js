import { FilterType } from '../utils/const.js';
import AbstractView from './abstract-view.js';

const NoFilmsMessage = {
  [FilterType.ALL]: 'There are no movies in our database',
  [FilterType.WATCHLIST]: 'There are no movies to watch now',
  [FilterType.HISTORY]: 'There are no watched movies now',
  [FilterType.FAVORITES]: 'There are no favorite movies now',
};

const renderNoFilmTemplate = (currentFilter) => `<section class="films-list">
    <h2 class="films-list__title">${NoFilmsMessage[currentFilter]}</h2>
  </section>`;

export default class NoFilmView extends AbstractView {
  #currentFilter = null;

  constructor(currentFilter) {
    super();
    this.#currentFilter = currentFilter;
  }

  get template() {
    return renderNoFilmTemplate(this.#currentFilter);
  }
}
