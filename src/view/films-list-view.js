import AbstractView from './abstract-view.js';

const renderFilmsListTemplate = (title) => {
  let listTitle;

  switch (title) {
    case 'topRated':
      listTitle = 'Top rated';
      break;
    case 'mostCommented':
      listTitle = 'Most commented';
      break;
    default:
      listTitle = 'All movies. Upcoming';
      break;
  }

  return `<section class="films-list ${title ? 'films-list--extra' : ''}">
    <h2 class="films-list__title ${title ? '' : 'visually-hidden'}">${listTitle}</h2>
    <div class="films-list__container"></div>
    </section>
`;
};

export default class FilmsListView extends AbstractView {
  #container = null;
  #listTitle = null;

  constructor(listTitle) {
    super();
    this.#listTitle = listTitle;
  }

  get template() {
    return renderFilmsListTemplate(this.#listTitle);
  }

  get container() {
    this.#container = this.element.querySelector('.films-list__container');

    return this.#container;
  }
}
