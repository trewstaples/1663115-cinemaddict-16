export const getClassName = (element, attribute) => (element ? attribute : '');

export const createTemplateFromArray = (array, cb) => array.map((item) => cb(item)).join('');
