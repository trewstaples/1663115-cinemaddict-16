import AbstractView from './abstract-view.js';

const renderFilmsListTemplate = () =>
  `<section class="films-list">
    <h2 class="films-list__title visually-hidden">All movies. Upcoming</h2>
    <div class="films-list__container"></div>
    </section>
`;

export default class FilmsListView extends AbstractView {
  #container = null;

  get template() {
    return renderFilmsListTemplate();
  }

  get container() {
    this.#container = this.element.querySelector('.films-list__container');

    return this.#container;
  }
}
