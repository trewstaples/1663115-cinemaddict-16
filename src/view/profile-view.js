import { userRank } from '../utils/const.js';
import { getUserRank } from '../utils/stats.js';
import AbstractView from './abstract-view.js';

const renderProfileTemplate = (watchedFilmsCount) => {
  const profileUserRank = getUserRank(watchedFilmsCount, userRank);

  return `<section class="header__profile profile"> ${
    profileUserRank !== 'None'
      ? `<p class="profile__rating">${profileUserRank}</p>
    <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35"></img>`
      : ''
  }
    </section>
`;
};

export default class ProfileView extends AbstractView {
  #watchedFilmsCount = null;

  constructor(watchedFilmsCount) {
    super();
    this.#watchedFilmsCount = watchedFilmsCount;
  }

  get template() {
    return renderProfileTemplate(this.#watchedFilmsCount);
  }
}
