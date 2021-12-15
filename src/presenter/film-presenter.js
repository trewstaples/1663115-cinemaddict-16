import { render, remove, replace, RenderPosition, renderCard, renderPopup } from '../utils/render.js';
import NoFilmView from '../view/no-film.js';
import ProfileView from '../view/profile-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import FilmsView from '../view/films-view.js';
import FilmsListView from '../view/films-list-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmPopupView from '../view/film-popup-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FooterView from '../view/footer-stats-view.js';

const FILMS_COUNT_PER_STEP = 5;

export default class FilmPresenter {
  #mainContainer = null;
  #headerContainer = null;
  #filmCardComponent = null;
  #filmPopupComponent = null;

  #noFilmComponent = new NoFilmView();
  #profileComponent = new ProfileView();
  #sortComponent = new SortView();
  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #showMoreButtonComponent = new ShowMoreButtonView();
  #footerComponent = new FooterView();

  #boardFilms = [];
  #filters = [];
  #renderedFilmsCount = FILMS_COUNT_PER_STEP;

  constructor(mainContainer, headerContainer) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
  }

  init = (boardFilms, filters) => {
    this.#boardFilms = [...boardFilms];
    this.#filters = [...filters];

    render(this.#mainContainer, new FilterView(filters), RenderPosition.BEFOREEND);
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();

    const prevFilmCardComponent = this.#filmCardComponent;
    const prevFilmPopupComponent = this.#filmPopupComponent;

    if (prevFilmCardComponent === null || prevFilmPopupComponent === null) {
      this.#renderFilms(0, Math.min(this.#boardFilms.length, FILMS_COUNT_PER_STEP));
      return;
    }

    if (this.#filmsListComponent.element.contains(prevFilmCardComponent.element)) {
      replace(this.filmCardComponent, prevFilmCardComponent);
    }

    if (this.#filmsListComponent.element.contains(prevFilmPopupComponent.element)) {
      replace(this.#filmPopupComponent, prevFilmPopupComponent);
    }

    remove(prevFilmCardComponent);
    remove(prevFilmPopupComponent);
  };

  destroy = () => {
    remove(this.#filmCardComponent);
    remove(this.#filmPopupComponent);
  };

  #renderNoFilm = () => {
    render(this.#filmsComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
  };

  #renderProfile = () => {
    render(this.#headerContainer, this.#profileComponent, RenderPosition.BEFOREEND);
  };

  #renderSort = () => {
    render(this.#filmsComponent, this.#sortComponent, RenderPosition.BEFOREBEGIN);
  };

  #renderFilmsList = () => {
    render(this.#filmsComponent, this.#filmsListComponent, RenderPosition.BEFOREEND);
  };

  #renderFilm = (film) => {
    this.#filmCardComponent = new FilmCardView(film);
    this.#filmPopupComponent = new FilmPopupView(film);

    const replacePopupToCard = () => {
      renderCard(this.#filmPopupComponent);
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replacePopupToCard();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    const replaceCardToPopup = () => {
      renderPopup(this.#filmPopupComponent);
      document.addEventListener('keydown', onEscKeyDown);
    };

    this.#filmCardComponent.setEditClickHandler(() => {
      replaceCardToPopup();
    });

    this.#filmPopupComponent.setEditClickHandler(() => {
      replacePopupToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(this.#filmsListComponent.container, this.#filmCardComponent, RenderPosition.BEFOREEND);
  };

  #renderFilms = (from, to) => {
    this.#boardFilms.slice(from, to).forEach((boardFilm) => this.#renderFilm(boardFilm));
  };

  #handleShowMoreButtonClick = () => {
    this.#boardFilms.slice(this.#renderedFilmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP).forEach((film) => this.#renderFilm(film));
    this.#renderedFilmsCount += FILMS_COUNT_PER_STEP;

    if (this.#renderedFilmsCount >= this.#boardFilms.length) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #renderShowMoreButton = () => {
    render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);

    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);
  };

  #renderFilmsBoard = () => {
    if (this.#boardFilms.length === 0) {
      this.#renderNoFilm();
    } else {
      this.#renderProfile();
      this.#renderSort();
      this.#renderFilmsList();

      if (this.#boardFilms.length > FILMS_COUNT_PER_STEP) {
        this.#renderShowMoreButton();
      }
      this.#renderFooter();
    }
  };

  #renderFooter = () => {
    const footerStatistics = document.querySelector('.footer__statistics');
    render(footerStatistics, new FooterView(this.#boardFilms), RenderPosition.BEFOREEND);
  };
}
