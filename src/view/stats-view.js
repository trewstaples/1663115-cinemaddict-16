import { StatsType, userRank } from '../utils/const.js';
import { getUserRank, getGenres, getTopGenre, statisticFilter } from '../utils/stats.js';
import { getTotalDuration, formatRuntime } from '../utils/date.js';
import SmartView from './smart-view.js';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const BAR_HEIGHT = 50;

const ChartConfiguration = {
  TYPE: 'horizontalBar',
  BACKGROUND: '#ffe800',
  ANCHOR: 'start',
  BAR_THICKNESS: 24,
  SIZE: 20,
  COLOR: '#ffffff',
  ALIGN: 'start',
  OFFSET: 40,
  PADDING: 100,
};

const renderChart = (statisticCtx, films) => {
  const genresStats = getGenres(films);

  const sortedGenresStats = Object.keys(genresStats)
    .sort((a, b) => genresStats[b] - genresStats[a])
    .reduce(
      (sortedObj, key) => ({
        ...sortedObj,
        [key]: genresStats[key],
      }),
      {},
    );

  const genres = Object.keys(sortedGenresStats);
  const genresCount = Object.values(sortedGenresStats);

  statisticCtx.height = BAR_HEIGHT * genres.length;

  return new Chart(statisticCtx, {
    plugins: [ChartDataLabels],
    type: ChartConfiguration.TYPE,
    data: {
      labels: genres,
      datasets: [
        {
          data: genresCount,
          backgroundColor: ChartConfiguration.BACKGROUND,
          hoverBackgroundColor: ChartConfiguration.BACKGROUND,
          anchor: ChartConfiguration.ANCHOR,
          barThickness: ChartConfiguration.BAR_THICKNESS,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        datalabels: {
          font: {
            size: ChartConfiguration.SIZE,
          },
          color: ChartConfiguration.COLOR,
          anchor: ChartConfiguration.ANCHOR,
          align: ChartConfiguration.ALIGN,
          offset: ChartConfiguration.OFFSET,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: ChartConfiguration.COLOR,
              padding: ChartConfiguration.PADDING,
              fontSize: ChartConfiguration.SIZE,
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: true,
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  });
};

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
  const statsUserRank = getUserRank(watchedFilms.length, userRank);
  const topGenre = getTopGenre(filteredFilms);
  const totalDuration = formatRuntime(getTotalDuration(filteredFilms));
  const hours = totalDuration.split(' ')[0];
  const minutes = totalDuration.split(' ')[1];

  const statsFiltersTemplate = filters.map((filter) => createStatsFilterTemplate(filter, currentFilter)).join('');

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
        <p class="statistic__item-text">${filteredFilms.length} <span class="statistic__item-description">${filteredFilms.length === 1 ? 'movie' : 'movies'}</span></p>
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Total duration</h4>
        <p class="statistic__item-text">${parseInt(hours, 10)} <span class="statistic__item-description">h</span> ${parseInt(minutes, 10)} <span class="statistic__item-description">m</span></p>
      </li>
      <li class="statistic__text-item">
  ${filteredFilms.length !== 0 ? `<h4 class="statistic__item-title">Top genre</h4>
    <p class="statistic__item-text">${topGenre}</p>` : '' }
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
    this.#setCharts();
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

  restoreHandlers = () => {
    this.setStatsFilterChangeHandler();
    this.#setCharts();
  };

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

  #setCharts = () => {
    if (this.#chart !== null) {
      this.#chart = null;
    }

    const chartContainer = this.element.querySelector('.statistic__chart');
    this.#chart = renderChart(chartContainer, this._data);
  };
}
