const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class ApiService {
  #endPoint = null;
  #authorization = null;
  #filmId = null;

  constructor(endPoint, authorization, filmId) {
    this.#endPoint = endPoint;
    this.#authorization = authorization;
    this.#filmId = filmId;
  }

  get films() {
    return this.#load({ url: 'movies' }).then(ApiService.parseResponse);
  }

  get comments() {
    return this.#load({ url: `/comments/${this.#filmId}` }).then(ApiService.parseResponse);
  }

  #load = async ({ url, method = Method.GET, body = null, headers = new Headers() }) => {
    headers.append('Authorization', this.#authorization);

    const response = await fetch(`${this.#endPoint}/${url}`, { method, body, headers });

    try {
      ApiService.checkStatus(response);
      return response;
    } catch (err) {
      ApiService.catchError(err);
    }
  };

  #adaptFilmToServer = (film) => {
    const adaptedFilm = {
      ...film,
      'film_info': {
        'actors': film.info.actors,
        'age_rating': film.info.ageRating,
        'alternative_title': film.info.alternativeTitle,
        'description': film.info.description,
        'director': film.info.director,
        'genre': film.info.genre,
        'poster': film.info.poster,
        'release': {
          'date': film.info.release.date instanceof Date ? film.info.release.date.toISOString() : null,
          'release_country': film.info.release.country,
        },
        'runtime': film.info.runtime,
        'title': film.info.title,
        'total_rating': film.info.totalRating,
        'writers': film.info.writers,
      },
      'user_details': {
        'already_watched': film.userDetails.alreadyWatched,
        'favorite': film.userDetails.favorite,
        'watching_date': film.userDetails.watchingDate instanceof Date ? film.userDetails.watchingDate.toISOString() : null,
        'watchlist': film.userDetails.watchlist,
      },
    };

    delete adaptedFilm.info;
    delete adaptedFilm.userDetails;

    return adaptedFilm;
  };

  updateFilm = async (film) => {
    const response = await this.#load({
      url: `movies/${film.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptFilmToServer(film)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  };

  #adaptCommentToServer = (comment) => {
    const adaptedComment = {
      ...comment,
      comment: comment.text,
    };

    delete adaptedComment.text;

    return adaptedComment;
  };

  addComment = async (comment) => {
    const response = await this.#load({
      url:`/comments/${this.#filmId}`,
      method: Method.POST,
      body: JSON.stringify(this.#adaptCommentToServer(comment)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  deleteComment = async (comment) => {
    const response = await this.#load({
      url: `comments/${comment}`,
      method: Method.DELETE,
    });

    return response;
  }

  static parseResponse = (response) => response.json();

  static checkStatus = (response) => {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  };

  static catchError = (err) => {
    throw err;
  };
}
