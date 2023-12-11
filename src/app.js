import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

yup.setLocale({ // set locale "notOneOf()" for using links were already added
  mixed: {
    notOneOf: 'RSS уже существует',
  },
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const app = () => {
  const i18Instance = i18next.createInstance(); // init i18Next
  const defaultLang = 'ru';
  i18Instance.init({
    lng: defaultLang,
    resources: { // get from /locales/ru.js
      ru,
    },
  });

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
      addedLinks: [], // save already addded links
      errors: [],
    },
  };
  const watchedState = onChange(initialState, render(initialState, elements, i18Instance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url'); // get value in input
    // give array 'alreadyAddedLinks' (There is not this link)
    const schema = yup.string()
      .url(i18Instance.t('errors.invalidLink')) // instead of message of error - message from locales/ru.js
      .notOneOf(watchedState.form.addedLinks, i18Instance.t('errors.addedLink')) // the same
      .trim();
    schema.validate(value) // when promis resolve
      .then(() => { // in case - validation
        watchedState.form.valid = 'valid';
        watchedState.form.status = 'sending';
      })
      .then(() => { // add in alreadyAdded when previous success
        watchedState.form.addedLinks.push(value);
        watchedState.form.status = 'sent';
        watchedState.form.field = value;
      })
      .catch((error) => { // in case no-valid (if error is on during 'sending' or smth else)
        watchedState.form.valid = 'invalid';
        watchedState.form.errors = error.message; // push error
        watchedState.form.status = 'failed';
      })
      .finally(() => {
        watchedState.form.status = 'filling';
      });
  });
};

export default app;
