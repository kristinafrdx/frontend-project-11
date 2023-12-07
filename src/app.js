import * as yup from 'yup';
// import render from './view.js';
import onChange from 'on-change';

const schema = yup.object().shape({
  url: yup.string().url(),
});

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    buttonSubmit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
  };
  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: true,
      errors: [],
    },
  };
  // const watchedState = onChange(initialState, render(initialState, elements));
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url'); // получили значение в инпуте
    schema.validate({ url: value }) // когда промис разрешится
      .then(() => {
        // в случае валидности
        initialState.form.status = 'sending'; // поменять на watchedState
        initialState.form.valid = 'true'; // поменять на watchedState
        initialState.form.field = formData.get('url'); // поменять на watchedState
        elements.input.style.border = '1px solid black';
      })
      // в случае невалидности
      .catch(() => {
        initialState.form.valid = 'false'; // поменять на watchedState
        elements.input.style.border = '1px solid red';
      });
  });

//     try {
//       const data = {
//         field: state.form.field
//       }
//      // отправить данные на сервер
//      // поменять статус формы
//      // state.form.status = 'sent'
//     }
//     catch (error) {
//     // обработка ошибок при отправке
//     }
//   })
};

export default app;
