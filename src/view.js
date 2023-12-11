// import { schema } from "./app.js";

const errorHandler = (elem, err) => {
  const elements = { ...elem };
  elements.input.classList.remove('is-valid');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = err;
  elements.input.focus();
  elements.form.reset();
};

const finishErrorHandler = (elem) => {
  const elements = { ...elem };
  elements.input.classList.remove('is-invalid');
  elements.input.classList.add('is-valid');
  elem.feedback.classList.remove('text-danger');
  elem.feedback.classList.add('text-success');
  elements.feedback.textContent = 'Ваш RSS добавлен успешно';
  elements.input.focus();
  elements.form.reset();
};

const render = (state, elements) => (path, value) => {
  switch (path) {
    case 'form.status':
      if (value === 'failed') {
        errorHandler(elements, state.form.errors);
      }
      if (value === 'sent') {
        finishErrorHandler(elements);
      }
      break;

    default:
      break;
  }
};

export default render;
