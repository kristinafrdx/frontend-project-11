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
