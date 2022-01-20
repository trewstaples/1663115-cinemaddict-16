import dayjs from 'dayjs';
import { StringFormats } from './const';

export const formatCommentDate = (commentDate) => dayjs(commentDate).format(StringFormats.COMMENT_DATE);
