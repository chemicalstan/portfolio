/**
 * Medium Blog Feed
 * Renders articles from the local articles.json, refreshed by a GitHub
 * Action on every push (see .github/workflows/refresh-articles.yml).
 */

(function () {
  'use strict';

  var MEDIUM_PROFILE = 'https://medium.com/@chemicalstan15';
  var MAX_ARTICLES = 6;

  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function articleHTML(article) {
    return (
      '<div class="blog-post">' +
        '<h3>' + escapeHtml(article.title) + '</h3>' +
        '<div class="blog-post-meta">' +
          '<span><i class="fa fa-calendar"></i>' + formatDate(article.pubDate) + '</span>' +
        '</div>' +
        (article.excerpt
          ? '<p class="blog-post-excerpt">' + escapeHtml(article.excerpt) + '</p>'
          : '') +
        '<div class="blog-post-link">' +
          '<a href="' + escapeHtml(article.link) + '" target="_blank" rel="noopener noreferrer">Read Article</a>' +
        '</div>' +
      '</div>'
    );
  }

  function showFallback(container) {
    container.innerHTML =
      '<div class="blog-error">' +
        '<p>Unable to load articles at the moment.</p>' +
        '<p>Visit my <a href="' + MEDIUM_PROFILE + '" target="_blank" rel="noopener noreferrer">Medium profile</a> directly.</p>' +
      '</div>';
  }

  function loadBlogPosts() {
    var container = document.getElementById('blog-posts');
    if (!container) return;

    fetch('articles.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var articles = (data && data.articles) || [];
        if (!articles.length) { showFallback(container); return; }
        container.innerHTML = articles
          .slice(0, MAX_ARTICLES)
          .map(articleHTML)
          .join('');
      })
      .catch(function () { showFallback(container); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
  } else {
    loadBlogPosts();
  }
})();
