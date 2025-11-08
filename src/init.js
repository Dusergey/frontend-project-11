import _ from 'lodash';
import axios from 'axios';
import i18n from './i18n.js';
import { fetchData, getFeedAndPosts, validateUrl } from './src/utils.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('input[aria-label="url"]'),
  feedback: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
};

// Начальное состояние
const state = {
  rssForm: {
    state: 'filling', // filling | processing | success | error
    error: null,
  },
  feeds: [],
  posts: [],
};

// Функция рендеринга состояния формы
const renderFormState = () => {
  const { rssForm } = state;

  if (rssForm.state === 'success') {
    elements.feedback.textContent = 'RSS успешно загружен';
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.input.value = '';
  } else if (rssForm.state === 'filling' && rssForm.error) {
    elements.feedback.textContent = i18n[rssForm.error] || rssForm.error;
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
  } else {
    elements.feedback.textContent = '';
    elements.feedback.classList.remove('text-success', 'text-danger');
  }
};

// Функция добавления ленты в DOM
const renderFeeds = () => {
  elements.feedsContainer.innerHTML = '';
  state.feeds.forEach((feed) => {
    const feedEl = document.createElement('div');
    feedEl.classList.add('card', 'mb-3');
    feedEl.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${feed.title}</h5>
        <p class="card-text">${feed.description}</p>
      </div>
    `;
    elements.feedsContainer.appendChild(feedEl);
  });
};

// Функция добавления постов в DOM
const renderPosts = () => {
  elements.postsContainer.innerHTML = '';
  state.posts.forEach((post) => {
    const postEl = document.createElement('div');
    postEl.classList.add('list-group', 'mb-2');
    postEl.innerHTML = `
      <a href="${post.link}" target="_blank" class="list-group-item list-group-item-action">${post.title}</a>
    `;
    elements.postsContainer.appendChild(postEl);
  });
};

// Обработчик отправки формы
elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.rssForm.state = 'filling';
  renderFormState();

  const formData = new FormData(e.target);
  const url = formData.get('url');
  const urlsList = state.feeds.map((feed) => feed.url);

  validateUrl(url, urlsList, i18n)
    .then((validUrl) => {
      state.rssForm.error = null;
      state.rssForm.state = 'processing';
      renderFormState();
      return fetchData(validUrl);
    })
    .then(({ data }) => {
      const [feed, posts] = getFeedAndPosts(data.contents);
      const newFeed = { ...feed, id: _.uniqueId(), url };
      const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));

      state.feeds = [newFeed, ...state.feeds];
      state.posts = [...newPosts, ...state.posts];

      state.rssForm.state = 'success';
      renderFormState();
      renderFeeds();
      renderPosts();
    })
    .catch((err) => {
      state.rssForm.state = 'filling';
      if (err.name === 'ValidationError') {
        state.rssForm.error = err.message;
      } else if (err.NotValidRss) {
        state.rssForm.error = 'form.errors.notValidRss';
      } else if (axios.isAxiosError(err)) {
        state.rssForm.error = 'form.errors.networkProblems';
      }
      renderFormState();
    });
});
