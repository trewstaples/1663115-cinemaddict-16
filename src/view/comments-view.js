import { formatCommentDate } from '../utils/date';
import AbstractView from './abstract-view';
import he from 'he';

const createCommentItemTemplate = (data = {}) => {
  const { author, text, date, emotion, isDisabled, isDeleting } = data;

  return `<li class="film-details__comment">
    <span class="film-details__comment-emoji">
      <img src="./images/emoji/${emotion}.png" width="55" height="55" alt="emoji-${emotion}">
    </span>
    <div>
      <p class="film-details__comment-text">${he.encode(text)}</p>
      <p class="film-details__comment-info">
        <span class="film-details__comment-author">${author}</span>
        <span class="film-details__comment-day">${formatCommentDate(date)}</span>
        <button ${isDisabled ? 'disabled' : ''} class="film-details__comment-delete">${isDeleting ? 'Deleting...' : 'Delete'} </button>
      </p>
    </div>
  </li>`;
};

export default class CommentView extends AbstractView {
  #comment = null;

  constructor(comment) {
    super();
    this._data = CommentView.parseCommentToData(comment);
  }

  get template() {
    return createCommentItemTemplate(this._data);
  }

  setDeleteClickHandler = (callback) => {
    this._callback.deleteClick = callback;
    this.element.querySelector('.film-details__comment-delete').addEventListener('click', this.#deleteClickHandler);
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();

    this._callback.deleteClick(this.#comment.id);
  };

  static parseCommentToData = (comment) => ({ ...comment, isDisabled: false, isDeleting: false });

  static parseDataToComment = (data) => {
    const comment = { ...data };

    delete comment.isDisabled;
    delete comment.isDeleting;

    return comment;
  };
}
