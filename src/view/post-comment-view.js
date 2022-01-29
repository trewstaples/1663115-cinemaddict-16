import { Film, KeyboardKey } from '../utils/const';
import { createTemplateFromArray } from '../utils/films';
import SmartView from './smart-view';

const postCommentTemplate = (data) => {
  const { emoji, text, emojiChecked, isDisabled } = data;

  const renderEmojiItemTemplate = (emotion) => `<input class="film-details__emoji-item visually-hidden"  ${isDisabled ? 'disabled' : ''}
  name="comment-emoji" type="radio" id="emoji-${emotion}" value="${emotion}" ${emojiChecked === `emoji-${emotion}` ? 'checked' : ''}>
<label class="film-details__emoji-label" for="emoji-${emotion}">
  <img src="./images/emoji/${emotion}.png" width="30" height="30" alt="emoji">
</label>`;

  return `<div class="film-details__new-comment" disabled>
    <div class="film-details__add-emoji-label">
      ${emoji !== null ? `<img src="images/emoji/${emoji}.png" width="55" height="55" alt="emoji-${emoji}"></img>` : ''}
    </div>
    <label class="film-details__comment-label">
      <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment" ${isDisabled ? 'disabled' : ''} >${text}</textarea>
    </label>
    <div class="film-details__emoji-list">
    ${createTemplateFromArray(Film.EMOTIONS, renderEmojiItemTemplate)}
    </div>
  </div>`;
};

export default class PostCommentView extends SmartView {
  constructor() {
    super();

    this._data = PostCommentView.parseCommentToData();
    this.#setInnerHandlers();
  }

  get template() {
    return postCommentTemplate(this._data);
  }

  restoreHandlers = () => {
    this.setCommentKeydownHandler(this._callback.formSubmit);
    this.#setInnerHandlers();
  };

  setCommentKeydownHandler = (callback) => {
    this._callback.formSubmit = callback;
    this.element.querySelector('.film-details__comment-input').addEventListener('keydown', this.#commentKeydownHandler);
  };

  #commentKeydownHandler = (evt) => {
    if ((evt.ctrlKey || evt.metaKey) && evt.code === KeyboardKey.ENTER) {
      if (!this._data.emoji || !this._data.text) {
        return;
      }

      evt.preventDefault();
      this.#disableForm();

      const newComment = {
        text: this._data.text,
        emotion: this._data.emoji,
      };

      PostCommentView.parseDataToComment(this._data);
      this._callback.formSubmit(newComment);
    }
  };

  #disableForm = () => {
    this.element.querySelector('.film-details__comment-input').disabled = true;
    this.element.querySelector('.film-details__emoji-list').disabled = true;
  };

  #setInnerHandlers = () => {
    this.element.querySelector('.film-details__emoji-list').addEventListener('change', this.#emojiChangeHandler);
    this.element.querySelector('.film-details__comment-input').addEventListener('input', this.#commentInputHandler);
  };

  #emojiChangeHandler = (evt) => {
    evt.preventDefault();

    if (this._data.emoji === evt.target.value) {
      return;
    }

    this.updateData({
      emoji: evt.target.value,
      emojiChecked: evt.target.id,
    });
  };

  #commentInputHandler = (evt) => {
    this.updateData(
      {
        text: evt.target.value,
      },
      true,
    );
  };

  static parseCommentToData = () => {
    const data = {};

    return { ...data, emoji: null, text: '', emojiChecked: '', isDisabled: false };
  };

  static parseDataToComment = (data) => {
    const comment = { ...data };

    delete comment.emojiChecked;
    delete comment.isDisabled;

    return comment;
  };
}
