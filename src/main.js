import { MenuItem, Server } from './utils/const.js';
import { render, remove, RenderPosition } from './utils/render.js';
import FilmsModel from './model/films-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilmsBoardPresenter from './presenter/films-board-presenter.js';
import ApiService from './api-service.js';
import StatsView from './view/stats-view.js';
import FooterView from './view/footer-stats-view.js';

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');
const footerElement = document.querySelector('.footer__statistics');

const filmsModel = new FilmsModel(new ApiService(Server.END_POINT, Server.AUTHORIZATION));
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter(siteMainElement, filterModel, filmsModel);
const filmsBoardPresenter = new FilmsBoardPresenter(siteHeaderElement, siteMainElement, filmsModel, filterModel);

let statsComponent = null;

const footerComponent = new FooterView(filmsModel.films);
render(footerElement, footerComponent, RenderPosition.BEFOREEND);

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.FILMS:
      filterPresenter.init(handleSiteMenuClick);
      filterPresenter.setMenuHandlers();

      if (!siteMainElement.querySelector('.films')) {
        filmsBoardPresenter.init();
      }

      remove(statsComponent);
      break;

    case MenuItem.STATS:
      filterPresenter.init(handleSiteMenuClick, MenuItem.STATS);
      filterPresenter.setMenuHandlers();
      filmsBoardPresenter.destroy();
      statsComponent = new StatsView(filmsModel.films);
      render(siteMainElement, statsComponent, RenderPosition.BEFOREEND);
      break;
  }
};

filterPresenter.init(handleSiteMenuClick);
filmsBoardPresenter.init();
filmsModel.init().finally(() => {
  filterPresenter.setMenuHandlers();
  remove(footerComponent);
  render(footerElement, new FooterView(filmsModel.films), RenderPosition.BEFOREEND);
});
