// import { schema } from "./app.js";

const render = (watchedState, elements) => (path, value) => {
  const { form, input, message } = elements;
  switch (value) {
    case 'sending':
      input.style.border = '1px solid black';
      break;
    case 'sent':
      input.focus();
      input.style.border = '1px solid black';
      message.classList.remove('text-danger');
      message.classList.add('text-success');
      message.textContent = 'Ваш RSS успешно загружен';
      break;
    case 'failed':
      input.style.border = '2px solid #D23333';
      form.reset();
      input.focus();
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      message.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'filling':
      input.style.border = 'initial'; // Сброс границы к исходному значению
      input.focus();
      break;
    default:
      break;
  }
};

export default render;
