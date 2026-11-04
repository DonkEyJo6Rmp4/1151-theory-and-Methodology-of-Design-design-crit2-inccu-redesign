(() => {
  const articleId = new URLSearchParams(window.location.search).get('article');
  const article = window.PORTAL_DATA.news.find(item => item.id === articleId) || window.PORTAL_DATA.news[0];
  document.title = `${article.label}｜iNCCU`;
  document.querySelector('#article-title').textContent = article.title;
  document.querySelector('#article-summary').textContent = article.summary;
})();
