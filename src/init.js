elements.form.addEventListener('submit', (e) => {
  e.preventDefault(); // предотвращаем редирект
  watchedState.rssForm.state = 'filling';
  const formData = new FormData(e.target);
  const url = formData.get('url');
  const urlsList = watchedState.feeds.map((feed) => feed.url);

  validateUrl(url, urlsList, i18n)
    .then((validUrl) => {
      watchedState.rssForm.error = null;
      watchedState.rssForm.state = 'processing';
      return fetchData(validUrl);
    })
    .then(({ data }) => {
      const [feed, posts] = getFeedAndPosts(data.contents);
      const newFeed = { ...feed, id: _.uniqueId(), url };
      const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
      watchedState.feeds = [newFeed, ...watchedState.feeds];
      watchedState.posts = [...newPosts, ...watchedState.posts];
      watchedState.rssForm.state = 'success'; // триггер для отображения сообщения
    })
    .catch((err) => {
      watchedState.rssForm.valid = err.name !== 'ValidationError';
      if (err.name === 'ValidationError') {
        watchedState.rssForm.error = err.message;
      } else if (err.NotValidRss) {
        watchedState.rssForm.error = 'form.errors.notValidRss';
      } else if (axios.isAxiosError(err)) {
        watchedState.rssForm.error = 'form.errors.networkProblems';
      }
      watchedState.rssForm.state = 'filling';
    });
});
