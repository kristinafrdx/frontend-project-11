import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId, cloneDeep } from 'lodash';
import render from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';

const getAxiosResponse = (link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`);

const updatePosts = (state) => {
  const stateCopy = { ...state };
  const existPosts = stateCopy.form.posts;
  const oldPosts = cloneDeep(existPosts);
  const url = state.form.field;
  getAxiosResponse(url)
    .then((data) => parser(data))
    .then((newData) => {
      const newPosts = newData.posts;
      newPosts.forEach((newPost) => {
        const foundsPosts = !oldPosts.find((oldPost) => oldPost.postLink === newPost.link);
        if (foundsPosts) {
          stateCopy.form.posts.push(newPost);
        }
      });
    })
    .catch((error) => {
      stateCopy.form.errors = error.message;
    })
    .then(() => {
      setTimeout(() => updatePosts(state), 5000);
    });
};

const app = () => {
  // step 1: get DOM elements
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'), // a message at the bottom of input
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
    buttonSent: document.querySelector('button[type="submit"]'),
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
      readPost: [],
      activePost: null,
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
          .required(i18Instance.t('errors.require'))
          .validate(value) // check validation
          .then((url) => getAxiosResponse(url)) // get response
          .then((response) => parser(response)) // parsing => return {feed, posts}
          .then((parsRss) => {
            const feedTitle = parsRss.feed.titleChannel; // get title in feed
            const feedDescription = parsRss.feed.descriptionChannel; // get description in feed
            const feedId = uniqueId();

            const posts = parsRss.posts.map((item) => {
              const postId = uniqueId();
              const postTitle = item.title; // get title in posts
              const postDescription = item.description; // get description in post
              const postLink = item.link; // get link in post
              return {
                postId,
                postTitle,
                postDescription,
                postLink,
              };
            });
            // add feeds to watchedState
            watchedState.form.feeds.push({ feedId, feedTitle, feedDescription });
            // add posts to watchedState
            watchedState.form.posts = posts.concat(watchedState.form.posts);
          })
          .then(() => { // in case - validation
            watchedState.form.valid = 'valid';
            watchedState.form.status = 'sending';
          })
          .then(() => { // add in alreadyAdded when previous success
            watchedState.form.addedLinks.push(value);
            watchedState.form.status = 'sent';
            watchedState.form.field = value;
            updatePosts(watchedState)
          })
          .catch((error) => { // in case no-valid (if error is on during 'sending' or smth else)
            watchedState.form.valid = 'invalid';
            if (error.message === 'Network Error') {
              watchedState.form.errors = i18Instance.t('errors.networkError');
            } else {
              watchedState.form.errors = error.message; // push last error
            }
            watchedState.form.status = 'failed';
          })
          .finally(() => {
            watchedState.form.status = 'filling';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const idClick = e.target.dataset.id; // id place where was click(post or modalWindow)
        if (idClick) { // if click was on button
          // selectPost - looking for the post in watchedState.form.posts, where was click
          const selectPost = watchedState.form.posts.find((post) => idClick === post.postId);
          // change state for change style of text - id of click
          watchedState.form.activePost = selectPost.postId;
          watchedState.form.readPost.push(selectPost); // add selectPost in watchedState
        }
      });
    });
};

export default app;
