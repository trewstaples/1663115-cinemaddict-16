import AbstractView from './abstract-view.js';

const createCommentInfoTemplate = (comments) => `<div class="film-details__bottom-container">
<section class="film-details__comments-wrap">
  <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments.length}</span></h3>

  <ul class="film-details__comments-list">
  </ul>
</section>
</div>`;

export default class CommentInfoView extends AbstractView {
  #comments;

  constructor(comments) {
    super();

    this.#comments = comments;
  }

  get template() {
    return createCommentInfoTemplate(this.#comments);
  }
}
