import AbstractView from './abstract-view.js';

const renderFooterTemplate = (films) => `<p>${films.length} movies inside </p>`;

export default class FooterView extends AbstractView {
  #films = null;

  constructor(films) {
    super();
    this.#films = films;
  }

  get template() {
    return renderFooterTemplate(this.#films);
  }
}
