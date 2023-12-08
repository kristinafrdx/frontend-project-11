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
    message: document.querySelector('.feedback'), // a message at the bottom of input
  };

  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: true,
      addedLinks: [],
      errors: [],
    },
  };
  const watchedState = onChange(initialState, render(initialState, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url'); // get value in input

    const schema = yup.object().shape({ // give array 'alreadyAddedLinks' (There is not this link)
      url: yup.string().url().notOneOf(watchedState.form.addedLinks),
    });
    schema.validate({ url: value }) // when promis resolve
      .then(() => { // in case - validation
        watchedState.form.status = 'sending';
        watchedState.form.valid = true;
        watchedState.form.field = value;
      })
      .then(() => { // when previous promiss resolve
        watchedState.form.status = 'sent';
        watchedState.form.valid = true;
        watchedState.form.addedLinks.push(value); // add link from input in addedLinks
      })
      .catch((error) => { // in case no-valid (if error is on during 'sending' or smth else)
        watchedState.form.status = 'failed';
        watchedState.form.valid = false;
        watchedState.form.errors.push(error); // push error
      });
  });
};

export default app;
