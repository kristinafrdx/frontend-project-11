// import { schema } from "./app.js";

const errorHandler = (elem, err) => {
  const elements = { ...elem }; // to change copy of elem (lint doesnt like it)
  elements.input.classList.replace('is-valid', 'is-invalid');
  elements.feedback.classList.replace('text-success', 'text-danger');
  elements.feedback.textContent = err;
  elements.input.focus();
  elements.form.reset();
};

const finishErrorHandler = (elem, i18Instance) => {
  const elements = { ...elem }; // get copy of elements (linter doesnt like it)
  elements.input.classList.replace('is-invalid', 'is-valid');
  elem.feedback.classList.replace('text-danger', 'text-success');
  elements.feedback.textContent = i18Instance.t('upload');
  elements.input.focus();
  elements.form.reset();
};

// <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"
const makeContainer = (elem, state, titleName, i18Instance) => {
  const elements = { ...elem };
  elements[titleName].textContent = ''; // title - feeds or posts

  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18Instance.t(titleName);
  cardBody.append(h2);
  div.append(cardBody);
  elements[titleName].append(div);

  if (titleName === 'feeds') {
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    state.form.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = 'description';
      li.append(p, h3);
      ul.append(li);
      div.append(ul);
    });
  }
};

const render = (state, elements, i18Instance) => (path, value) => {
  switch (path) {
    case 'form.status':
      if (value === 'failed') {
        errorHandler(elements, state.form.errors);
      }
      if (value === 'sent') {
        finishErrorHandler(elements, i18Instance);
      }
      break;
    default:
      break;
  }
};

export default render;
