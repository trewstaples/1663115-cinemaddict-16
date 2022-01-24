import { StatsType, userRanks } from '../utils/const.js';
import { statisticFilter } from '../utils/stats.js';
import { createTemplateFromArray } from '../utils/films.js';
import SmartView from './smart-view.js';
import { getUserRank } from '../utils/stats.js';

const createStatsFilterTemplate = (filter, currentFilter) => {
  const { name, type } = filter;

  return `<input
    type="radio"
    class="statistic__filters-input visually-hidden"
    name="statistic-filter"
    id="statistic-${type}" value="${type}" ${type === currentFilter ? 'checked' : ''}>
    <label for="statistic-${type}" class="statistic__filters-label">${name}</label>`;
};

const renderStatsTemplate = (watchedFilms, currentFilter, filteredFilms, filters) => {
  const statsFiltersTemplate = filters.map((filter) => createStatsFilterTemplate(filter, currentFilter)).join('');
  const statsUserRank = getUserRank(watchedFilms.length, userRanks);

  return `<section class="statistic"> ${
    statsUserRank !== 'None'
      ? `<p class="statistic__rank"> Your rank
    <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
    <span class="statistic__rank-label">${statsUserRank}</span>
    </p>`
      : ''
  }

    <form action="https://echo.htmlacademy.ru/" method="get" class="statistic__filters">
      <p class="statistic__filters-description">Show stats:</p>
      ${statsFiltersTemplate}
    </form>

    <ul class="statistic__text-list">
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">You watched</h4>
        <p class="statistic__item-text">28 <span class="statistic__item-description">movies</span></p>
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Total duration</h4>
        <p class="statistic__item-text">69 <span class="statistic__item-description">h</span> 41 <span class="statistic__item-description">m</span></p>
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Top genre</h4>
        <p class="statistic__item-text">Drama</p>
      </li>
    </ul>

    <div class="statistic__chart-wrap">
      <canvas class="statistic__chart" width="1000"></canvas>
    </div>

  </section>`;
};

export default class StatsView extends SmartView {
  #watchedFilms = null;
  #currentFilter = null;
  #chart = null;

  constructor(films) {
    super();

    this.#watchedFilms = films.filter((film) => film.userDetails.alreadyWatched);
    this.#currentFilter = StatsType.ALL;
    this._data = statisticFilter[this.#currentFilter](this.#watchedFilms);

    this.setStatsFilterChangeHandler();
  }

  get template() {
    return renderStatsTemplate(this.#watchedFilms, this.#currentFilter, this._data, this.filters);
  }

  get filters() {
    return [
      {
        type: StatsType.ALL,
        name: 'All time',
      },
      {
        type: StatsType.TODAY,
        name: 'Today',
      },
      {
        type: StatsType.WEEK,
        name: 'Week',
      },
      {
        type: StatsType.MONTH,
        name: 'Month',
      },
      {
        type: StatsType.YEAR,
        name: 'Year',
      },
    ];
  }

  setStatsFilterChangeHandler = () => {
    this.element.querySelector('.statistic__filters').addEventListener('change', this.#statsFilterChangeHandler);
  };

  #statsFilterChangeHandler = (evt) => {
    evt.preventDefault();

    if (evt.target.name !== 'statistic-filter') {
      return;
    }

    this.#currentFilter = evt.target.value;
    this._data = statisticFilter[this.#currentFilter](this.#watchedFilms);
    this.updateElement();
  };
}
