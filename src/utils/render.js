import AbstractView from '../view/abstract-view';

export const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

export const render = (container, element, place) => {
  const parent = container instanceof AbstractView ? container.element : container;
  const child = element instanceof AbstractView ? element.element : element;

  switch (place) {
    case RenderPosition.BEFOREBEGIN:
      parent.before(child);
      break;
    case RenderPosition.AFTERBEGIN:
      parent.prepend(child);
      break;
    case RenderPosition.BEFOREEND:
      parent.append(child);
      break;
    case RenderPosition.AFTEREND:
      parent.after(child);
      break;
  }
};

export const createElement = (template) => {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;

  return newElement.firstChild;
};

export const remove = (component) => {
  if (component === null) {
    return;
  }

  if (!(component instanceof AbstractView)) {
    throw new Error('Can remove only components');
  }

  component.element.remove();
  component.removeElement();
};

export const renderPopup = (component) => {
  if (document.body.querySelector('.film-details')) {
    document.body.querySelector('.film-details').remove();
  }
  const popup = component instanceof AbstractView ? component.element : component;
  document.body.appendChild(popup);
  document.body.classList.add('hide-overflow');
};

export const renderCard = (component) => {
  const popup = component instanceof AbstractView ? component.element : component;
  document.body.removeChild(popup);
  document.body.classList.remove('hide-overflow');
};
