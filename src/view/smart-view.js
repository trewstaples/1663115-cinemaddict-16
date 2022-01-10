import AbstractView from './abstract-view.js';

export default class SmartView extends AbstractView {
  _data = {};

  updateData = (update, justDataUpdating) => {
    if (!update) {
      return;
    }

    this._data = { ...this._data, ...update };

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
