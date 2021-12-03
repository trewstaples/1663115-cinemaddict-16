import { createTemplateFromArray } from '../utils.js';
import { createElement } from '../render.js';

const createFilterTemplate = (filter) => {
  const { name, count } = filter;
  const convertToPascalCase = (word) => word.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
  return `
  <a href="#${name}" class="main-navigation__item">${convertToPascalCase(name)} <span class="main-navigation__item-count">${count}</span></a>
  `;
};

const renderFilterTemplate = (filters) => `<nav class="main-navigation">
    <div class="main-navigation__items">
      <a href="#all" class="main-navigation__item main-navigation__item--active">All movies</a>
    </div>
    ${createTemplateFromArray(filters, createFilterTemplate)}
    <a href="#stats" class="main-navigation__additional">Stats</a>
  </nav>
  `;

export default class FilterView {
  #element = null;
  #filters = null;

  constructor(filters) {
    this.#filters = filters;
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  get template() {
    return renderFilterTemplate(this.#filters);
  }

  removeElement() {
    this.#element = null;
  }
}
