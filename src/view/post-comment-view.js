import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { EMOTIONS, KeyboardKeys, StringFormats } from '../utils/const';
import { createTemplateFromArray } from '../utils/films';
import SmartView from './smart-view';

const postCommentTemplate = (data) => {
  const renderEmojiItemTemplate = (emoji) => `<input class="film-details__emoji-item visually-hidden"
  name="comment-emoji" type="radio" id="emoji-${emoji}" value="${emoji}" ${data.emojiChecked === `emoji-${emoji}` ? 'checked' : ''}>
<label class="film-details__emoji-label" for="emoji-${emoji}">
  <img src="./images/emoji/${emoji}.png" width="30" height="30" alt="emoji">
</label>`;

  return `<div class="film-details__new-comment">
    <div class="film-details__add-emoji-label">
      ${data.emoji !== null ? `<img src="images/emoji/${data.emoji}.png" width="55" height="55" alt="emoji-${data.emoji}"></img>` : ''}
    </div>
    <label class="film-details__comment-label">
      <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment">${data.text}</textarea>
    </label>
    <div class="film-details__emoji-list">
    ${createTemplateFromArray(EMOTIONS, renderEmojiItemTemplate)}
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
    if ((evt.ctrlKey || evt.metaKey) && evt.code === KeyboardKeys.ENTER) {
      if (!this._data.emoji || !this._data.text) {
        return;
      }

      evt.preventDefault();
      this.#disableForm();

      const newComment = {
        id: nanoid(),
        author: 'Author',
        text: this._data.text,
        date: dayjs(Date.now()).format(StringFormats.COMMENT_DATE),
        emotion: this._data.emoji,
      };

      PostCommentView.parseDataToComment(this._data);
      this._callback.formSubmit(newComment);
    }
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
  // reset = (film) => {
  //   this.updateData(AddCommentView.parseFilmToData());
  // }

  #commentInputHandler = (evt) => {
    this.updateData(
      {
        text: evt.target.value,
      },
      true,
    );
  };

  #disableForm = () => {
    this.element.querySelector('.film-details__comment-input').disabled = true;
    this.element.querySelector('.film-details__emoji-list').disabled = true;
  };

  // static parseFilmToData = (film) => ({ ...film, isEmoji: '', isMessage: '', isEmojiChecked: '' });

  static parseCommentToData = () => {
    const data = {};

    return { ...data, emoji: null, text: '', emojiChecked: '' };
  };

  static parseDataToComment = (data) => {
    const comment = { ...data };

    delete comment.emoji;
    delete comment.text;
    delete comment.emojiChecked;

    return comment;
  };
}
