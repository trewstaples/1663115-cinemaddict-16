import AbstractObservable from '../utils/abstract-observable.js';

export default class CommentsModel extends AbstractObservable {
  #comments = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get comments() {
    return this.#comments;
  }

  init = async () => {
    try {
      const comments = await this.#apiService.comments;
      this.#comments = comments;
      console.log(this.#comments);
    } catch (err) {
      this.#comments = [];
    }

    // this._notify(UpdateType.INIT);
  };

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
