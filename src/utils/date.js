import { Runtime, StringFormats } from './const';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

export const formatCommentDate = (commentDate) => dayjs(commentDate).format(StringFormats.COMMENT_DATE);

export const formatRuntime = (minutesDuration) => {
  dayjs.extend(duration);
  let formatString = StringFormats.RUNTIME_MINUTES;
  if (minutesDuration >= Runtime.MINUTES_IN_HOUR) {
    formatString = StringFormats.RUNTIME_HOURS;
  }

  const runtime = dayjs.duration(minutesDuration, 'm').format(formatString);
  return runtime;
};

export const formatReleaseDate = (releaseDate) => dayjs(releaseDate).format(StringFormats.RELEASE_DATE);
