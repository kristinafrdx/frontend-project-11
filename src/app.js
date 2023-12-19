import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';

const timeOut = 5000;
const defaultLang = 'ru';
const getAxiosResponse = (link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);

const validation = (url, addedLinks, i18Instance) => {
  const schema = yup.string()
    .trim()
    .required(i18Instance.t('errors.require')) // message from locales/ru.js
    .url(i18Instance.t('errors.invalidLink'))
    .notOneOf(addedLinks, i18Instance.t('errors.addedLink'))
    .validate(url);
  return schema;
};

const updatePosts = (state, time) => {
  const stateCopy = { ...state };
  const existPosts = stateCopy.posts;
  const url = state.form.field;
  getAxiosResponse(url)
    .then((data) => parser(data))
    .then((newData) => {
      const newPosts = newData.posts;

      // get array of old links
      const oldLinks = existPosts.map((post) => post.link);

      // get array of new links
      const newLinks = newPosts.map((item) => item.link);

      newLinks.forEach((link) => { // get every new link
        if (!oldLinks.includes(link)) {
          const findedPost = newPosts.find((post) => post.link === link); // get post with this link
          state.posts.unshift(findedPost); // add to state the finded post
        }
      });
    })
    .catch((error) => {
      stateCopy.errors = error.message;
    })
    .then(() => {
      setTimeout(() => updatePosts(state), time);
    });
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
    buttonSend: document.querySelector('button[type="submit"]'),
  };

  const initialState = {
    form: {
      field: '',
      status: 'filling',
      valid: 'valid',
      addedLinks: [],
    },
    errors: null,
    feeds: [],
    posts: [],
    readPost: [],
    activePost: null,
  };

  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: defaultLang,
    resources: { // get from /locales/ru.js
      ru,
    },
  })
    // set locale "notOneOf()" for using links were already added
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: i18Instance.t('addedLink'),
        },
        string: {
          url: i18Instance.t('invalidLink'),
        },
      });

      const watchedState = onChange(initialState, render(initialState, elements, i18Instance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const value = formData.get('url');
        validation(value, watchedState.form.addedLinks, i18Instance)
          .then((url) => getAxiosResponse(url))
          .then((response) => parser(response))
          .then((parsRss) => {
            const feedTitle = parsRss.feed.titleChannel;
            const feedDescription = parsRss.feed.descriptionChannel;
            const feedId = uniqueId();

            const posts = parsRss.posts.map((item) => {
              const id = uniqueId();
              const { title } = item;
              const { description } = item;
              const { link } = item;
              return {
                id,
                title,
                description,
                link,
              };
            });
            // add feeds to watchedState
            watchedState.feeds.unshift({ feedId, feedTitle, feedDescription });
            // add posts to watchedState
            watchedState.posts = posts.concat(watchedState.posts);
          })
          .then(() => {
            watchedState.form.status = 'sending';
            watchedState.form.valid = 'valid';
          })
          .then(() => {
            watchedState.form.addedLinks.push(value);
            watchedState.form.status = 'sent';
            watchedState.form.field = value;
            updatePosts(watchedState, timeOut);
          })
          .catch((error) => {
            watchedState.form.valid = 'invalid';
            if (error.message === 'Network Error') {
              watchedState.errors = i18Instance.t('errors.networkError');
            } else {
              watchedState.errors = error.message; // push last error
            }
            watchedState.form.status = 'failed';
          })
          .finally(() => {
            watchedState.form.status = 'filling';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const idClick = e.target.dataset.id; // id place where was click(post or modalWindow)
        if (idClick) {
          // looking for the post in watchedState.posts, where was click
          const selectPost = watchedState.posts.find((post) => idClick === post.id);
          // change style of text - id of click
          watchedState.activePost = selectPost.id;
          watchedState.readPost.push(selectPost);
        }
      });
    });
};

export default app;
