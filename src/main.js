import { MenuItem } from './utils/const.js';
import { render, remove, RenderPosition } from './utils/render.js';
import { generateFilm } from './mock/film.js';
import FilmsBoardPresenter from './presenter/films-board-presenter.js';
import FilmsModel from './model/films-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import StatsView from './view/stats-view.js';
import FooterView from './view/footer-stats-view.js';
//Выполнить задание со статистикой
//Настроить удаление комментариев
//Настроить удаление ESCAPE
//Подумать, как объеденить метод openPopup в один
//Чекнуть ошибку, которая вылетает в консоль при клике мимо фильтрации
//По возможности объеденить функции отрисовки макетов в одну общую, но посложнее

const FILMS_COUNT = 15;

const renderCards = () => {
  const array = [];
  for (let i = 0; i < FILMS_COUNT; i++) {
    array.push(generateFilm());
  }
  return array;
};
const films = renderCards();

const filmsModel = new FilmsModel();
filmsModel.films = films;

const filterModel = new FilterModel();

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');
const footerStats = document.querySelector('.footer__statistics');

const filmsBoardPresenter = new FilmsBoardPresenter(siteHeaderElement, siteMainElement, filmsModel, filterModel);
const filterPresenter = new FilterPresenter(siteMainElement, filterModel, filmsModel);

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

const footerStatsComponent = new FooterView(filmsModel.films);
render(footerStats, footerStatsComponent, RenderPosition.BEFOREEND);
