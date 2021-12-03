import { createElement } from '../render.js';

const renderFooterTemplate = (films) => `<p>${films.length} movies inside </p>`;

export default class FooterView {
  #element = null;
  #films = null;

  constructor(films) {
    this.#films = films;
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  get template() {
    return renderFooterTemplate(this.#films);
  }

  removeElement() {
    this.#element = null;
  }
}
