/**
 * Medium Blog Feed Fetcher
 * Fetches and displays Medium articles with engagement metrics
 */

(function() {
  'use strict';

  const MEDIUM_RSS_URL = 'https://medium.com/feed/@chemicalstan15';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  // Function to parse RSS and extract claps from Medium articles
  function parseMediumRSS(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      console.error('Error parsing XML');
      return [];
    }

    const items = xmlDoc.getElementsByTagName('item');
    const articles = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = item.getElementsByTagName('title')[0]?.textContent || 'Untitled';
      const link = item.getElementsByTagName('link')[0]?.textContent || '';
      const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || '';
      const description = item.getElementsByTagName('description')[0]?.textContent || '';
      
      // Extract claps/engagement from description (Medium includes stats in description)
      const claps = extractClapCount(description);
      
      articles.push({
        title: title,
        link: link,
        pubDate: new Date(pubDate),
        claps: claps,
        description: description
      });
    }

    // Sort by publication date (newest first)
    articles.sort((a, b) => b.pubDate - a.pubDate);

    return articles;
  }

  // Extract clap count from Medium description (if available)
  function extractClapCount(description) {
    // Medium RSS doesn't include clap count directly, so we'll use a generic engagement metric
    // You might want to implement a secondary API call or web scraping for actual clap counts
    // For now, we'll just return 0 or implement a placeholder
    return 0;
  }

  // Format date to readable string
  function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Create HTML for a blog post
  function createBlogPostHTML(article) {
    return `
      <div class="blog-post">
        <h3>${escapeHtml(article.title)}</h3>
        <div class="blog-post-meta">
          <span>
            <i class="fa fa-calendar"></i>
            ${formatDate(article.pubDate)}
          </span>
        </div>
        <div class="blog-post-link">
          <a href="${article.link}" target="_blank" rel="noopener noreferrer">
            Read Article
          </a>
        </div>
      </div>
    `;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Fetch and display blog posts
  function loadBlogPosts() {
    const blogContainer = document.getElementById('blog-posts');
    
    if (!blogContainer) {
      console.warn('Blog container not found');
      return;
    }

    // Use CORS proxy to fetch the RSS feed
    const fetchURL = CORS_PROXY + encodeURIComponent(MEDIUM_RSS_URL);

    fetch(fetchURL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        const articles = parseMediumRSS(data);

        if (articles.length === 0) {
          blogContainer.innerHTML = '<div class="blog-error">No articles found. Please check back soon!</div>';
          return;
        }

        // Display only the latest 6 articles
        const displayArticles = articles.slice(0, 6);
        const html = displayArticles.map(article => createBlogPostHTML(article)).join('');

        blogContainer.innerHTML = html;
      })
      .catch(error => {
        console.error('Error fetching blog posts:', error);
        blogContainer.innerHTML = `
          <div class="blog-error">
            <p>Unable to load articles at the moment.</p>
            <p>Visit my <a href="https://medium.com/@chemicalstan15" target="_blank" style="color: #cc005f; text-decoration: underline;">Medium profile</a> directly.</p>
          </div>
        `;
      });
  }

  // Load blog posts when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
  } else {
    loadBlogPosts();
  }
})();
