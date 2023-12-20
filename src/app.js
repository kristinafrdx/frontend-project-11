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

const getAxiosResponse = (link) => {
  const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`;
  return axios.get(url, { timeout: 10000 });
};

const validation = (url, addedLinks, i18Instance) => {
  const schema = yup.string()
    .trim()
    .required(i18Instance.t('errors.require')) // message from locales/ru.js
    .url(i18Instance.t('errors.invalidLink'))
    .notOneOf(addedLinks, i18Instance.t('errors.addedLink'))
    .validate(url);
  return schema;
};

const createFeed = (parsRss, value) => {
  const feedTitle = parsRss.titleChannel;
  const feedDescription = parsRss.descriptionChannel;
  const feedId = uniqueId();
  const feedLink = value;
  return {
    feedTitle,
    feedDescription,
    feedId,
    feedLink,
  };
};

const createPost = (newPosts) => {
  const posts = newPosts.map((item) => {
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
  return posts;
};

const updatePosts = (state, time) => {
  const stateCopy = { ...state };
  const existPosts = stateCopy.posts;
  const { feeds } = stateCopy;

  const feedPromises = feeds.map((feed) => getAxiosResponse(feed.feedLink) // upload for EVERY feed
    .then((data) => parser(data))
    .then((parseData) => createPost(parseData.posts))
    .catch((error) => {
      stateCopy.errors = error.message;
    }));
  Promise.all(feedPromises) // wait all
    .then((posts) => {
      const newPosts = posts.flat();

      // get array of old links
      const oldLinks = existPosts.map((post) => post.link);

      // get array of new links
      const newLinks = newPosts.map((item) => item.link);

      newLinks.forEach((link) => { // get every new link
        if (!oldLinks.includes(link)) {
          const findedPost = newPosts.find((post) => post.link === link); // get post with that link
          state.posts.unshift(findedPost); // add to state the finded post
        }
      });
    })
    .catch((error) => {
      stateCopy.errors = error.message;
    })
    .finally(() => {
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
        watchedState.form.status = 'sending';
        const formData = new FormData(e.target);
        const value = formData.get('url');
        validation(value, watchedState.form.addedLinks, i18Instance)
          // .then(() => {
          //   watchedState.form.valid = 'valid';
          // })
          .then((url) => getAxiosResponse(url))
          .then((response) => parser(response))
          .then((parsRss) => {
            const feed = createFeed(parsRss.feed, value);
            const posts = createPost(parsRss.posts);

            // add feeds to watchedState
            watchedState.feeds.unshift(feed);
            // add posts to watchedState
            watchedState.posts = posts.concat(watchedState.posts);
          })
          .then(() => {
            watchedState.form.valid = 'valid';
            watchedState.form.addedLinks.push(value);
            watchedState.form.status = 'sent';
            watchedState.form.field = value;
            updatePosts(watchedState, timeOut);
          })
          .catch((error) => {
            watchedState.form.valid = 'invalid';
            if (error.message === 'Network Error') {
              watchedState.errors = i18Instance.t('errors.networkError');
            } else if (error.message === 'notRss') {
              watchedState.errors = i18Instance.t('errors.notRss');
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
          if (selectPost) {
            watchedState.activePost = selectPost.id;
            watchedState.readPost.push(selectPost);
          }
        }
      });
    });
};

export default app;
