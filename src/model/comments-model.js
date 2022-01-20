import AbstractObservable from '../utils/abstract-observable.js';

export default class CommentsModel extends AbstractObservable {
  #comments = [];

  set comments(comments) {
    this.#comments = [...comments];
  }

  get comments() {
    return this.#comments;
  }

  addComment = (actionType, update) => {
    this.#comments = [...this.#comments, update];

    this._notify(actionType, update);
  };

  deleteComment = (actionType, update) => {
    const index = this.#comments.findIndex((comment) => comment.id === update);

    if (index === -1) {
      throw new Error('Cannot delete unexisting comment');
    }

    this.#comments = [...this.#comments.slice(0, index), ...this.#comments.slice(index + 1)];

    this._notify(actionType, update);
  };
}
