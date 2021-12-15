import { render, remove, RenderPosition, renderPopup, renderCard } from './utils/render.js';
import NoFilmView from './view/no-film.js';
import ProfileView from './view/profile-view.js';
import FilterView from './view/filter-view.js';
import SortView from './view/sort-view.js';
import FilmsView from './view/films-view.js';
import FilmsListView from './view/films-list-view.js';
import FilmCardView from './view/film-card-view.js';
import FilmPopupView from './view/film-popup-view.js';
import ShowMoreButtonView from './view/show-more-button-view.js';
import FooterView from './view/footer-stats-view.js';

const FILMS_COUNT_PER_STEP = 5;

export default class FilmPresenter {
  #mainContainer = null;
  #headerContainer = null;

  #noFilmComponent = new NoFilmView();
  #filterComponent = new FilterView();
  #profileComponent = new ProfileView();
  #sortComponent = new SortView();
  #filmsComponent = new FilmsView();
  #filmsListComponent = new FilmsListView();
  #showMoreButtonComponent = new ShowMoreButtonView();
  #footerComponent = new FooterView();

  #boardFilms = [];
  #filters = [];

  constructor(mainContainer, headerContainer) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
  }

  init = (boardFilms, filters) => {
    this.#boardFilms = [...boardFilms];
    this.#filters = [...filters];

    render(this.#mainContainer, this.#filterComponent(this.#filters), RenderPosition.BEFOREEND);
    render(this.#mainContainer, this.#filmsComponent, RenderPosition.BEFOREEND);

    this.#renderFilmsBoard();
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
    const filmCardComponent = new FilmCardView(film);
    const filmPopupComponent = new FilmPopupView(film);

    const replacePopupToCard = () => {
      renderCard(filmPopupComponent);
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replacePopupToCard();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    const replaceCardToPopup = () => {
      renderPopup(filmPopupComponent);
      document.addEventListener('keydown', onEscKeyDown);
    };

    filmCardComponent.setEditClickHandler(() => {
      replaceCardToPopup();
    });

    filmPopupComponent.setEditClickHandler(() => {
      replacePopupToCard();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(this.#filmsListComponent.container, filmCardComponent, RenderPosition.BEFOREEND);
  };

  #renderFilms = (from, to) => {
    this.#boardFilms.slice(from, to).forEach((boardFilm) => this.#renderFilm(boardFilm));
  };

  #renderFilmsBoard = () => {
    if (this.#boardFilms.length === 0) {
      this.#renderNoFilm();
    } else {
      this.#renderProfile();
      this.#renderSort();
      this.#renderFilmsList();

      this.#renderFilms(0, Math.min(this.#boardFilms.length, FILMS_COUNT_PER_STEP));

      if (this.#boardFilms.length > FILMS_COUNT_PER_STEP) {
        let renderedFilmsCount = FILMS_COUNT_PER_STEP;

        const showMoreButtonComponent = new ShowMoreButtonView();
        render(this.#filmsListComponent, this.#showMoreButtonComponent, RenderPosition.BEFOREEND);

        showMoreButtonComponent.setClickHandler(() => {
          this.#boardFilms
            .slice(renderedFilmsCount, renderedFilmsCount + FILMS_COUNT_PER_STEP)
            .forEach((film) => this.#renderFilm(this.#filmsListComponent.container, film));
          renderedFilmsCount += FILMS_COUNT_PER_STEP;

          if (renderedFilmsCount >= this.#boardFilms.length) {
            remove(showMoreButtonComponent);
          }
        });
      }
      this.#renderFooter();
    }
  };

  #renderFooter = () => {
    const footerStatistics = document.querySelector('.footer__statistics');
    render(footerStatistics, this.#footerComponent(this.#boardFilms), RenderPosition.BEFOREEND);
  };
}
