// import { schema } from "./app.js";

const errorHandler = (elem, err) => {
  elem.input.classList.add('is-invalid');
  elem.feedback.textContent = err;
  elem.input.focus();
  elem.form.reset()
}

const finishErrorHandler = (elem) => {
  elem.input.classList.remove('is-invalid');
  elem.input.classList.add('is-valid');
  // elem.feedback.classList.remove('text-danger');  // Убираем класс для красного цвета текста
  // elem.feedback.classList.add('text-success');
  elem.feedback.textContent = 'Ваш RSS добавлен успешно';
  elem.input.focus();
  elem.form.reset();
} 

const render = (state, elements) => (path, value) => {
  switch (path) {
    case 'form.status':
      if (value === 'failed') {
        errorHandler(elements, state.form.errors)
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
