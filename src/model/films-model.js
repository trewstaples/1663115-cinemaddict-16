import AbstractObservable from '../utils/abstract-observable.js';
import { UpdateType } from '../utils/const.js';

export default class FilmsModel extends AbstractObservable {
  #films = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get films() {
    return this.#films;
  }

  init = async () => {
    try {
      const films = await this.#apiService.films;
      this.#films = films.map(this.#adaptFilmToClient);
    } catch (err) {
      this.#films = [];
    }

    this._notify(UpdateType.INIT);
  };

  updateFilm = (updateType, update) => {
    const index = this.#films.findIndex((film) => film.id === update.id);

    if (index === -1) {
      throw new Error('Cannot update unexisting film');
    }

    this.#films = [...this.#films.slice(0, index), update, ...this.#films.slice(index + 1)];

    this._notify(updateType, update);
  };

  #adaptFilmToClient = (film) => {
    const adaptedFilm = {
      ...film,
      info: {
        actors: film.film_info['actors'],
        ageRating: film.film_info['age_rating'],
        alternativeTitle: film.film_info['alternative_title'],
        description: film.film_info['description'],
        director: film.film_info['director'],
        genre: film.film_info['genre'],
        poster: film.film_info['poster'],
        release: {
          date: film.film_info.release['date'] !== null ? new Date(film.film_info.release['date']) : film.film_info.release['date'],
          country: film.film_info.release['release_country'],
        },
        runtime: film.film_info['runtime'],
        title: film.film_info['title'],
        totalRating: film.film_info['total_rating'],
        writers: film.film_info['writers'],
      },
      userDetails: {
        alreadyWatched: film.user_details['already_watched'],
        favorite: film.user_details['favorite'],
        watchingDate: film.user_details['watching_date'] !== null ? new Date(film.user_details['watching_date']) : film.user_details['watching_date'],
        watchlist: film.user_details['watchlist'],
      },
    };

    delete adaptedFilm['film_info'];
    delete adaptedFilm['user_details'];

    return adaptedFilm;
  };
}
