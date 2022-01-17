import AbstractObservable from '../utils/abstract-observable.js';

export default class CommentsModel extends AbstractObservable {
  #comments = [];

  set comments(comments) {
    this.#comments = [...comments];
  }

  get comments() {
    return this.#comments;
  }

  addComment = (updateType, update) => {
    this.#comments = [update, ...this.#comments];

    this._notify(updateType, update);
  };

  deleteComment = (updateType, update) => {
    const index = this.#comments.findIndex((task) => task.id === update.id);

    if (index === -1) {
      throw new Error('Cannot delete unexisting film');
    }

    this.#comments = [...this.#comments.slice(0, index), ...this.#comments.slice(index + 1)];

    this._notify(updateType);
  };
}
