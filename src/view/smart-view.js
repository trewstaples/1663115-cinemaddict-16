import AbstractView from './abstract-view.js';

export default class SmartView extends AbstractView {
  _filteredFilms = {};

  updateData = (update, justDataUpdating) => {
    if (!update) {
      return;
    }

    this._filteredFilms = { ...this._filteredFilms, ...update };

    if (justDataUpdating) {
      return;
    }

    this.updateElement();
  };

  updateElement = () => {
    const prevElement = this.element;
    const scrollPosition = prevElement.scrollTop;
    const parent = prevElement.parentElement;
    this.removeElement();

    const newElement = this.element;

    parent.replaceChild(newElement, prevElement);
    newElement.scrollTop = scrollPosition;

    this.restoreHandlers();
  };

  restoreHandlers = () => {
    throw new Error('Abstract method not implemented: restoreHandlers');
  };
}
