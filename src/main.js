import { MenuItem, AUTHORIZATION, END_POINT } from './utils/const.js';
import { render, remove, RenderPosition } from './utils/render.js';
import FilmsBoardPresenter from './presenter/films-board-presenter.js';
import FilmsModel from './model/films-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import StatsView from './view/stats-view.js';
import FooterView from './view/footer-stats-view.js';
import ApiService from './api-service.js';

//разобраться с комментариями
//разобраться с футером
//Фильтры блокировать в finally?

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');
const footerStats = document.querySelector('.footer__statistics');

const filmsModel = new FilmsModel(new ApiService(END_POINT, AUTHORIZATION));
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter(siteMainElement, filterModel, filmsModel);
const filmsBoardPresenter = new FilmsBoardPresenter(siteHeaderElement, siteMainElement, filmsModel, filterModel);

let statsComponent = null;

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.FILMS:
      filterPresenter.init(handleSiteMenuClick);
      if (!siteMainElement.querySelector('.films')) {
        filmsBoardPresenter.init();
      }

      remove(statsComponent);
      break;

    case MenuItem.STATS:
      filterPresenter.init(handleSiteMenuClick, MenuItem.STATS);
      filmsBoardPresenter.destroy();
      statsComponent = new StatsView(filmsModel.films);
      render(siteMainElement, statsComponent, RenderPosition.BEFOREEND);
      break;
  }
};

filterPresenter.init(handleSiteMenuClick);
filmsBoardPresenter.init();

filmsModel.init();

const footerStatsComponent = new FooterView(filmsModel.films);
render(footerStats, footerStatsComponent, RenderPosition.BEFOREEND);
