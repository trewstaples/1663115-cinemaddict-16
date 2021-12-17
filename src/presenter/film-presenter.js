import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import { render, replace, remove, renderCard, renderPopup, RenderPosition } from '../utils/render.js';

export default class FilmPresenter {
  #filmsListComponent = null;

  #filmCardComponent = null;
  #filmPopupComponent = null;

  #film = null;

  constructor(filmListComponent) {
    this.#filmsListComponent = filmListComponent;
  }

  init = (film) => {
    this.#film = film;

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film);

    this.#filmCardComponent.setEditClickHandler(this.#replaceCardToPopup);
    this.#filmPopupComponent.setEditClickHandler(() => {
      this.#replacePopupToCard();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    });

    if (prevFilmCardComponent === null || prevFilmPopupComponent === null) {
      render(this.#filmsListComponent.container, this.#filmCardComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#filmsListComponent.element.contains(prevFilmCardComponent.element)) {
      replace(this.#filmCardComponent, prevFilmCardComponent);
    }

    if (document.body.contains(prevFilmPopupComponent.element)) {
      replace(this.#filmPopupComponent, prevFilmPopupComponent);
    }

    remove(prevFilmCardComponent);
    remove(prevFilmPopupComponent);
  };

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent);
  };

  #replacePopupToCard = () => {
    renderCard(this.#filmPopupComponent);
  };

  #onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replacePopupToCard();
      document.removeEventListener('keydown', this.#onEscKeyDown);
    }
  };

  #replaceCardToPopup = () => {
    renderPopup(this.#filmPopupComponent);
    document.addEventListener('keydown', this.#onEscKeyDown);
  };
}
