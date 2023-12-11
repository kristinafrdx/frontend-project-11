import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

yup.setLocale({ // set locale "notOneOf()"" for using links were already added
  mixed: {
    notOneOf: 'RSS уже существует',
    // default: 'the entered data is\' valid',
  },
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    buttonSubmit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'), // a message at the bottom of input
  };

  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: 'valid',
      addedLinks: [],
      errors: [],
    },
  };
  const watchedState = onChange(initialState, render(initialState, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url'); // get value in input

    const schema = yup.string().url().notOneOf(watchedState.form.addedLinks).trim() // give array 'alreadyAddedLinks' (There is not this link)
    schema.validate(value) // when promis resolve
      .then(() => { // in case - validation
        watchedState.form.valid = 'valid';
        watchedState.form.status = 'sending';
        watchedState.form.addedLinks.push(value);
        watchedState.form.status = 'sent';
        // watchedState.form.field = value;
       })
      .catch((error) => { // in case no-valid (if error is on during 'sending' or smth else)
        watchedState.form.valid = 'invalid';
        watchedState.form.errors = error.message; // push error
        watchedState.form.status = 'failed';
      })
      .finally(() => {
        watchedState.form.status = 'filling'
      })
  });
};

export default app;
