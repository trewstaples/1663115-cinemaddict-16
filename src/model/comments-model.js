import { UserAction } from '../utils/const.js';
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
      this.#comments = comments.map(this.#adaptCommentToClient);
    } catch (err) {
      this.#comments = [];
    }

    this._notify(UserAction.INIT);
  };

  addComment = async (updateType, update) => {
    try {
      const response = await this.#apiService.addComment(update);
      this.#comments = response.comments.map(this.#adaptCommentToClient);
      this._notify(updateType, response);
    } catch (err) {
      throw new Error('Cannot add comment');
    }
  };

  deleteComment = async (actionType, update) => {
    const index = this.#comments.findIndex((comment) => comment.id === update);

    if (index === -1) {
      throw new Error('Cannot delete unexisting comment');
    }
    try {
      await this.#apiService.deleteComment(update);
      this.#comments = [...this.#comments.slice(0, index), ...this.#comments.slice(index + 1)];

      this._notify(actionType);
    } catch (err) {
      throw new Error('Cannot delete comment');
    }
  };

  #adaptCommentToClient = (comment) => {
    const adaptedComment = {
      ...comment,
      text: comment.comment,
      date: comment.date !== null ? new Date(comment.date) : comment.date,
    };

    delete comment.comment;
    delete comment.date;

    return adaptedComment;
  };
}
