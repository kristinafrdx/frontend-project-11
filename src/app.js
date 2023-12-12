import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

const app = () => {
  // step 1: get DOM elements
  const elements = {
    form: document.querySelector('form'),
    buttonSubmit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'), // a message at the bottom of input
  };
  // step 2: init state
  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: 'valid',
      addedLinks: [], // save already addded links
      errors: [],
    },
  };
  // step 3: init i18Next
  const i18Instance = i18next.createInstance();
  const defaultLang = 'ru';
  i18Instance.init({
    lng: defaultLang,
    resources: { // get from /locales/ru.js
      ru,
    },
  })
  // step 4: set locale "notOneOf()" for using links were already added
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: i18Instance.t('addedLink'),
        },
        string: {
          url: i18Instance.t('invalidLink'),
        },
      });
  // step 5: watch for state
      const watchedState = onChange(initialState, render(initialState, elements, i18Instance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const value = formData.get('url'); // get value in input

        const schema = yup.string()
          .trim()
          .url(i18Instance.t('errors.invalidLink')) // instead of message of error - message from locales/ru.js
          .notOneOf(watchedState.form.addedLinks, i18Instance.t('errors.addedLink')); // the same

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
    });
};

export default app;
