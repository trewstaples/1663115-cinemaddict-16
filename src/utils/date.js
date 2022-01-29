import { StringFormat } from './const';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
dayjs.extend(duration);

export const formatCommentDate = (commentDate) => dayjs(commentDate).format(StringFormat.COMMENT_DATE);

export const formatRuntime = (minutesDuration) => {
  const runtime = dayjs.duration(minutesDuration, 'm').format(StringFormat.RUNTIME_HOURS);
  return runtime;
};

export const formatReleaseDate = (releaseDate) => dayjs(releaseDate).format(StringFormat.RELEASE_DATE);

export const getTotalDuration = (films) => {
  const totalDuration = films.map((film) => film.info.runtime).reduce((sum, current) => sum + current, 0);

  return totalDuration;
};
