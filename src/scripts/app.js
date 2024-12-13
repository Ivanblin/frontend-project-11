/* eslint-disable no-use-before-define */
import { nanoid } from 'nanoid';
import * as yup from 'yup';
import { setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';

import resources from '../locales/languages.js';
import { renderValidation, renderLanguage, renderRss } from './watchers.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      renderLanguage(i18nInstance);
    });

  const state = {
    feeds: [],
    posts: [],
    uiState: {
      language: defaultLanguage,
      validate: {
        isValid: null,
        message: null,
      },
    },
  };

  const watchedValidation = onChange(state.uiState.validate, (path, value) => {
    renderValidation(path, value, i18nInstance);
  });

  const watchedState = onChange(state, (path, value, prevValue) => {
    renderRss(path, value, prevValue, i18nInstance);
  });
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');

  const validateURL = (url) => {
    const customMessages = {
      mixed: {
        notOneOf: 'rssAlreadyAdded',
        required: 'emptyField',
      },
      string: {
        url: 'invalidUrl',
      },
    };

    setLocale(customMessages);
    const urlsInState = state.feeds.map((feed) => feed.url);
    const formSchema = yup.string().required().url().notOneOf(urlsInState);

    return formSchema
      .validate(url)
      .then(() => {
        getFeedData(url);
      })
      .catch((error) => {
        watchedValidation.isValid = false;
        watchedValidation.message = error.message;
      });
  };

  function rssParce(xmlData) {
    const parser = new DOMParser();
    const data = parser.parseFromString(xmlData, 'text/xml');

    return data;
  }

  function getFeedData(url) {
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        try {
          const data = rssParce(response.data.contents);
          const id = nanoid(6);
          const feedTitle = data.querySelector('channel > title').textContent;
          const feedDescription = data.querySelector('channel > description').textContent;
          const posts = data.querySelectorAll('channel > item');

          watchedState.feeds.push({
            url,
            id,
            title: feedTitle,
            description: feedDescription,
          });

          posts.forEach((post) => {
            const postLink = post.querySelector('link').textContent;
            const postTitle = post.querySelector('title').textContent;
            const postDescription = post.querySelector('description').textContent;

            watchedState.posts.push({
              feedId: id,
              postTitle,
              postDescription,
              postLink,
            });
          });
          watchedValidation.isValid = true;
          watchedValidation.message = 'success';
          input.value = '';
          input.focus();
        } catch (error) {
          watchedValidation.isValid = false;
          watchedValidation.message = 'noValidRss';
        }
      })
      .catch(() => {
        watchedValidation.isValid = false;
        watchedValidation.message = 'connectionError';
      });
  }

  function validateForm(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button');
    const url = input.value.trim();

    submitBtn.classList.add('disabled');

    validateURL(url).finally(() => {
      submitBtn.classList.remove('disabled');

      setTimeout(postsUpdate, 5000);
    });
  }

  function postsUpdate() {
    state.feeds.forEach((feed) => {
      axios
        .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
        .then((response) => {
          const postsList = [];
          const data = rssParce(response.data.contents);
          const posts = data.querySelectorAll('channel > item');

          posts.forEach((post) => {
            const postLink = post.querySelector('link').textContent;
            const postTitle = post.querySelector('title').textContent;
            const postDescription = post.querySelector('description').textContent;

            postsList.push({
              feedId: feed.id,
              postTitle,
              postDescription,
              postLink,
            });
          });

          const currentPosts = state.posts.filter((post) => post.feedId === feed.id);
          const addedPosts = _.differenceWith(postsList, currentPosts, _.isEqual);

          watchedState.posts.push(...addedPosts);
        });
    });
    setTimeout(postsUpdate, 5000);
  }
  form.addEventListener('submit', validateForm);
};
