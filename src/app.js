import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';

// let currentId = 1;
// const getId = () => {
//   const id = currentId;
//   currentId += 1;
//   return id;
// };
const getAxiosResponse = (link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);

const app = () => {
  // step 1: get DOM elements
  const elements = {
    form: document.querySelector('form'),
    buttonSubmit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'), // a message at the bottom of input
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };
  // step 2: init state
  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: 'valid',
      addedLinks: [], // save already addded links
      errors: [],
      feeds: [],
      posts: [],
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
        yup
          .string()
          .trim()
          .url(i18Instance.t('errors.invalidLink')) // instead of message of error - message from locales/ru.js
          .notOneOf(watchedState.form.addedLinks, i18Instance.t('errors.addedLink')) // the same
          .validate(value) // check validation
          .then((url) => getAxiosResponse(url)) // get response
          .then((response) => parser(response)) // parsing => return {feed, posts}
          .then((parsRss) => {
            const feedTitle = parsRss.feed.titleChannel; // get title in feed
            const feedDescription = parsRss.feed.descriptionChannel; // get description in feed

            const posts = parsRss.posts.map((item) => {
              const postTitle = item.title; // get title in posts
              const postDescription = item.description; // get description in post
              const postLink = item.link; // get link in post
              return { postTitle, postDescription, postLink };
            });
            // add feeds to watchedState
            watchedState.form.feeds.push({ title: feedTitle, description: feedDescription });
            // add posts to watchedState
            // watchedState.form.posts.push({ postTitle, postDescription, postLink});
          })
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
