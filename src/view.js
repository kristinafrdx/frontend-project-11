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

const renderModalWindow = (elem, posts) => {
  const elements = { ...elem };
  const result = posts.forEach((post) => {
    const title = post.postTitle;
    const description = post.postDescription;
    const link = post.postLink;

    elements.modalTitle.textContent = title;
    elements.modalDescription.textContent = description;
    elements.modalLink.setAttribute('href', link);
  });
  return result;
};

// <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"
const makeContainer = (elem, state, titleName, i18Instance) => {
  const elements = { ...elem };
  elements[titleName].textContent = ''; // titleName - feeds or posts

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18Instance.t(titleName);
  cardBody.append(h2);
  card.append(cardBody);
  elements[titleName].append(card);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  if (titleName === 'feeds') {
    state.form.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.feedTitle;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.feedDescription;
      li.append(h3, p);
      ul.append(li);
    });
    card.append(ul);
  }
  if (titleName === 'posts') {
    state.form.posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const a = document.createElement('a');
      a.classList.add('fw-bold');
      a.dataset.id = post.postId;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('href', post.postLink);
      a.textContent = post.postTitle;

      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = post.postId;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = i18Instance.t('show');

      li.append(a, button);
      ul.append(li);
    });
    card.append(ul);
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
    case 'form.feeds': {
      makeContainer(elements, state, 'feeds', i18Instance);
      break;
    }
    case 'form.posts': {
      makeContainer(elements, state, 'posts', i18Instance);
      break;
    }
    case 'form.readPost': {
      renderModalWindow(elements, value);
      break;
    }
    case 'form.activePost': {
      const linkDom = document.querySelector(`[data-id="${value}"]`);
      linkDom.classList.remove('fw-bold');
      linkDom.classList.add('fw-normal', 'text-muted');
      break;
    }
    default:
      break;
  }
};

export default render;
