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

export default class MainPresenter {
  #mainContainer = null;

  #films = [];

  constructor(mainContainer) {
    this.#mainContainer = mainContainer;
  }

  init = (films) => {
    this.#films = films;
  };

  #renderNoFilm = () => {};

  #renderProfile = () => {};

  #renderFilter = () => {};

  #renderSort = () => {};

  #renderFilms = () => {};

  #renderFilmsList = () => {};

  #renderFilmCard = () => {};

  #renderFilmPopup = () => {};

  #renderShowMoreButton = () => {};

  #renderFooter = () => {};
}
