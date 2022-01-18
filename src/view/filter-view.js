import AbstractView from './abstract-view.js';
import { FilterType, MenuItem } from '../utils/const.js';

const createFilterItemTemplate = (filter, currentFilterType) => {
  const { type, name, count } = filter;
  return `<a href="#${name}" class="main-navigation__item ${type === currentFilterType ? 'main-navigation__item--active' : ''}">${name} ${type === 'all' ? '' : `<span class="main-navigation__item-count">${count}</span>`} </a>`;
};

const renderFilterTemplate = (filters, currentFilterType) => {
  const filterItemsTemplate = filters.map((filter) => createFilterItemTemplate(filter, currentFilterType)).join('');
  return `<nav class="main-navigation">
    <div class="main-navigation__items">
      ${filterItemsTemplate}
    </div>
    <a href="#stats" class="main-navigation__additional">Stats</a>
  </nav>`;
};

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #menuItem = null;

  constructor(filters, currentFilterType, menuItem) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilterType;
    this.#menuItem = menuItem;
  }

  get template() {
    return renderFilterTemplate(this.#filters, this.#currentFilter);
  }

  setMenuClickHandler = (callback) => {
    this._callback.menuClick = callback;
    this.element.addEventListener('click', this.#menuClickHandler);
  };

  #menuClickHandler = (evt) => {
    evt.preventDefault();

    if (evt.target.classList.contains('main-navigation__additional')) {
      this._callback.menuClick(MenuItem.STATS);
    } else if (evt.target.dataset.filter) {
      this._callback.menuClick(MenuItem.FILMS);
    }
  };

  setFilterTypeChangeHandler = (callback) => {
    this._callback.filterTypeChange = callback;
    this.element.querySelector('.main-navigation__items').addEventListener('change', this.#filterTypeChangeHandler);
  };

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    console.log(0);
    this._callback.filterTypeChange(evt.target.value);
  };
}
