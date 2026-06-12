// AI TOOLS HUB — Logic

// DOM Elements
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobileMenu');

// State
let currentActiveFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initScrollListener();
  renderHeroStats();
  renderCategoriesGrid();
  renderFeaturedTools();
  renderAllToolsFilters();
  renderAllTools('all');
  if (typeof blogCategories !== 'undefined') {
    renderBlogFilters();
    renderBlogPosts('all');
  }
});

// -------------------------
// Navigation & Layout
// -------------------------
function initScrollListener() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function toggleMobileMenu() {
  mobileMenu.classList.toggle('open');
}

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });
  
  // Update navbar links
  document.querySelectorAll('.navbar-link').forEach(link => {
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Show requested page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.style.display = 'block';
    targetPage.classList.remove('page-enter');
    // trigger reflow
    void targetPage.offsetWidth;
    targetPage.classList.add('page-enter');
  }

  // Handle specific page inits
  if (pageId === 'search') {
    document.getElementById('searchPageInput').focus();
    handleSearchPage();
  }

  window.scrollTo(0, 0);
}

// -------------------------
// Rendering Helpers
// -------------------------
function createToolCard(tool) {
  const category = getCategoryById(tool.category);
  const stars = '★'.repeat(Math.floor(tool.rating));
  const pricingClass = tool.pricing.toLowerCase().replace(/\s/g, '');
  
  // Real Logo Implementation
  let domain = '';
  try {
    domain = new URL(tool.url).hostname;
  } catch(e) {}
  
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const card = document.createElement('div');
  card.className = `tool-card ${tool.featured ? 'featured' : ''} stagger-item`;
  card.onclick = () => showToolDetail(tool.slug);

  let featuredBadge = tool.featured ? `<div class="featured-badge">Featured</div>` : '';

  card.innerHTML = `
    ${featuredBadge}
    <div class="tool-card-header">
      <div class="tool-card-icon" style="background: white; overflow: hidden; padding: 4px;">
        <img 
          src="${logoUrl}" 
          alt="${tool.name} logo" 
          style="width: 100%; height: 100%; object-fit: contain; border-radius: var(--radius-md);"
          onerror="
            if(this.src !== '${fallbackUrl}') { 
              this.src = '${fallbackUrl}'; 
            } else { 
              this.style.display='none'; 
              this.parentNode.innerHTML='<div style=\\'font-size: 1.5rem;\\'>${tool.icon}</div>'; 
            }
          " 
        />
      </div>
      <span class="tool-card-pricing ${pricingClass}">${tool.pricing}</span>
    </div>
    <h3 class="tool-card-name">${tool.name}</h3>
    <p class="tool-card-desc">${tool.description}</p>
    <div class="tool-card-footer">
      <div class="tool-card-category">
        ${category ? category.icon + ' ' + category.name : ''}
      </div>
      <div class="tool-card-rating">
        ${stars} <span>${tool.rating}</span>
      </div>
    </div>
  `;
  return card;
}

// -------------------------
// Home Page Renderers
// -------------------------
function renderHeroStats() {
  document.getElementById('heroToolCount').textContent = tools.length;
  document.getElementById('statToolCount').textContent = tools.length + '+';
}

function renderCategoriesGrid() {
  const container = document.getElementById('categoriesGrid');
  if(!container) return;
  container.innerHTML = '';
  
  categories.forEach(cat => {
    const count = getToolsByCategory(cat.id).length;
    const el = document.createElement('div');
    el.className = 'category-card stagger-item';
    el.style.setProperty('--cat-color', cat.color);
    el.onclick = () => showCategory(cat.slug);
    
    el.innerHTML = `
      <div class="category-card-icon">${cat.icon}</div>
      <h3 class="category-card-name">${cat.name}</h3>
      <p class="category-card-count">${count} tools</p>
      <span class="category-card-arrow">→</span>
    `;
    container.appendChild(el);
  });
}

function renderFeaturedTools() {
  const container = document.getElementById('featuredScroll');
  if(!container) return;
  container.innerHTML = '';
  
  const featured = getFeaturedTools();
  featured.forEach(tool => {
    container.appendChild(createToolCard(tool));
  });
}

function renderAllToolsFilters() {
  const container = document.getElementById('filterPills');
  if(!container) return;
  container.innerHTML = `<button class="filter-pill active" onclick="renderAllTools('all')">All Tools</button>`;
  
  categories.forEach(cat => {
    container.innerHTML += `<button class="filter-pill" onclick="renderAllTools('${cat.id}')">${cat.icon} ${cat.name}</button>`;
  });
}

function renderAllTools(categoryId) {
  currentActiveFilter = categoryId;
  
  // Update Pills
  document.querySelectorAll('#filterPills .filter-pill').forEach(pill => {
    pill.classList.remove('active');
    if(categoryId === 'all' && pill.textContent.includes('All Tools')) pill.classList.add('active');
    else if(categoryId !== 'all' && pill.textContent.includes(getCategoryById(categoryId)?.name)) pill.classList.add('active');
  });

  const container = document.getElementById('allToolsGrid');
  if(!container) return;
  container.innerHTML = '';

  let filtered = categoryId === 'all' ? tools : getToolsByCategory(categoryId);
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">📭</div>
        <h3 class="empty-state-title">No tools found</h3>
        <p class="empty-state-desc">We don't have any tools in this category yet.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(tool => {
    container.appendChild(createToolCard(tool));
  });
}

// -------------------------
// Search Logic (Hero & Search Page)
// -------------------------
let heroSearchTimeout;
function handleHeroSearch(query) {
  const dropdown = document.getElementById('heroSearchDropdown');
  clearTimeout(heroSearchTimeout);
  
  if (!query.trim()) {
    dropdown.classList.remove('active');
    return;
  }

  heroSearchTimeout = setTimeout(() => {
    const results = searchTools(query).slice(0, 5);
    dropdown.innerHTML = '';
    
    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-tertiary);">No tools found matching "${query}"</div>`;
    } else {
      results.forEach(tool => {
        const cat = getCategoryById(tool.category);
        let domain = '';
        try { domain = new URL(tool.url).hostname; } catch(e){}
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.onclick = () => {
          showToolDetail(tool.slug);
          document.getElementById('heroSearchInput').value = '';
          dropdown.classList.remove('active');
        };
        
        item.innerHTML = `
          <div class="search-result-icon" style="width: 32px; height: 32px; border-radius: 6px; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
            <img 
              src="${logoUrl}" 
              style="width: 100%; height: 100%; object-fit: contain;" 
              onerror="if(this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; } else { this.style.display='none'; this.parentNode.innerHTML='<div style=\\'font-size: 1.2rem;\\'>${tool.icon}</div>'; }" 
            />
          </div>
          <div class="search-result-info">
            <div class="search-result-name">${tool.name}</div>
            <div class="search-result-desc">${tool.description}</div>
          </div>
          <div class="search-result-category">${cat ? cat.name : ''}</div>
        `;
        dropdown.appendChild(item);
      });
      
      const allResultsLink = document.createElement('div');
      allResultsLink.className = 'search-result-item';
      allResultsLink.style = "justify-content: center; background: var(--bg-glass-strong); color: var(--accent-blue); font-weight: 600;";
      allResultsLink.textContent = `See all results for "${query}" →`;
      allResultsLink.onclick = () => {
        document.getElementById('searchPageInput').value = query;
        showPage('search');
        document.getElementById('heroSearchInput').value = '';
        dropdown.classList.remove('active');
      };
      dropdown.appendChild(allResultsLink);
    }
    
    dropdown.classList.add('active');
  }, 200);
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const searchContainer = document.getElementById('heroSearch');
  const dropdown = document.getElementById('heroSearchDropdown');
  if (searchContainer && dropdown && !searchContainer.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

function handleSearchPage() {
  const query = document.getElementById('searchPageInput').value;
  const resultsGrid = document.getElementById('searchResultsGrid');
  const countDisplay = document.getElementById('searchResultsCount');
  
  // Always render filter pills
  const pillsContainer = document.getElementById('searchFilterPills');
  if(pillsContainer.children.length === 0) {
    pillsContainer.innerHTML = `<button class="filter-pill active" onclick="setSearchFilter('all')">All Tools</button>`;
    categories.forEach(cat => {
      pillsContainer.innerHTML += `<button class="filter-pill" onclick="setSearchFilter('${cat.id}')">${cat.icon} ${cat.name}</button>`;
    });
  }

  let results = tools;
  if(query.trim() !== '') results = searchTools(query);
  if(currentActiveFilter !== 'all') results = results.filter(t => t.category === currentActiveFilter);

  resultsGrid.innerHTML = '';
  countDisplay.textContent = results.length === 0 ? '0 results found' : `Showing ${results.length} tools`;

  if (results.length === 0) {
    resultsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No matching tools</h3>
        <p class="empty-state-desc">Try adjusting your search terms or filters.</p>
      </div>
    `;
    return;
  }

  results.forEach(tool => {
    resultsGrid.appendChild(createToolCard(tool));
  });
}

function setSearchFilter(categoryId) {
  currentActiveFilter = categoryId;
  document.querySelectorAll('#searchFilterPills .filter-pill').forEach(pill => {
    pill.classList.remove('active');
    if(categoryId === 'all' && pill.textContent.includes('All Tools')) pill.classList.add('active');
    else if(categoryId !== 'all' && pill.textContent.includes(getCategoryById(categoryId)?.name)) pill.classList.add('active');
  });
  handleSearchPage();
}

// -------------------------
// Category & Tool Detail Pages
// -------------------------
function showCategory(slug) {
  const cat = getCategoryBySlug(slug);
  if(!cat) return;

  document.getElementById('categoryBreadcrumb').textContent = cat.name;
  document.getElementById('categoryIcon').textContent = cat.icon;
  document.getElementById('categoryName').textContent = cat.name;
  document.getElementById('categoryName').style.color = cat.color;
  document.getElementById('categoryDesc').textContent = cat.description;

  const catTools = getToolsByCategory(cat.id);
  document.getElementById('categoryCount').textContent = `${catTools.length} tool${catTools.length !== 1 ? 's' : ''} available`;

  const grid = document.getElementById('categoryToolsGrid');
  grid.innerHTML = '';
  
  if (catTools.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">📭</div>
        <h3 class="empty-state-title">No tools yet</h3>
        <p class="empty-state-desc">We're adding tools to this category soon. Check back later!</p>
      </div>
    `;
  } else {
    catTools.forEach(tool => grid.appendChild(createToolCard(tool)));
  }

  showPage('category');
}

function showToolDetail(slug) {
  const tool = getToolBySlug(slug);
  if(!tool) return;

  const cat = getCategoryById(tool.category);
  const stars = '★'.repeat(Math.floor(tool.rating));
  const pricingClass = tool.pricing.toLowerCase().replace(/\s/g, '');

  let domain = '';
  try { domain = new URL(tool.url).hostname; } catch(e){}
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  document.getElementById('toolCategoryLink').textContent = cat ? cat.name : 'Category';
  document.getElementById('toolCategoryLink').onclick = (e) => { e.preventDefault(); showCategory(cat.slug); };
  document.getElementById('toolBreadcrumb').textContent = tool.name;

  let tagsHtml = tool.tags.map(t => `<span class="tool-detail-tag">${t}</span>`).join('');
  
  let relatedHtml = '';
  if (cat) {
    const related = getToolsByCategory(tool.category).filter(t => t.id !== tool.id).slice(0, 3);
    if (related.length > 0) {
      relatedHtml = `
        <div class="related-tools">
          <h2 class="related-tools-title">More <span class="gradient-text">${cat.name}</span> Tools</h2>
          <div class="tools-grid">
            ${related.map(t => createToolCard(t).outerHTML).join('')}
          </div>
        </div>
      `;
    }
  }

  const content = document.getElementById('toolDetailContent');
  content.innerHTML = `
    <div class="tool-detail-header">
      <div class="tool-detail-icon" style="background: white; overflow: hidden; padding: 8px;">
        <img 
          src="${logoUrl}" 
          alt="${tool.name} logo" 
          style="width: 100%; height: 100%; object-fit: contain; border-radius: var(--radius-lg);"
          onerror="if(this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; } else { this.style.display='none'; this.parentNode.innerHTML='<div style=\\'font-size: 2.5rem;\\'>${tool.icon}</div>'; }" 
        />
      </div>
      <div class="tool-detail-info">
        <h1 class="tool-detail-name">${tool.name}</h1>
        <div class="tool-detail-meta">
          ${cat ? `<span class="tool-detail-category" onclick="showCategory('${cat.slug}')" style="cursor:pointer">${cat.icon} ${cat.name}</span>` : ''}
          <span class="tool-card-pricing ${pricingClass}">${tool.pricing}</span>
          <span class="tool-detail-rating">${stars} <span>${tool.rating}</span></span>
        </div>
      </div>
    </div>

    <div class="tool-detail-body">
      <div>
        <div class="tool-detail-description" style="white-space: pre-line;">${tool.longDescription}</div>
      </div>

      <div class="tool-detail-sidebar">
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="tool-detail-cta">
          Visit ${tool.name} →
        </a>

        <div class="tool-detail-sidebar-card stagger-item">
          <h3 class="tool-detail-sidebar-title">Tags</h3>
          <div class="tool-detail-tags">${tagsHtml}</div>
        </div>

        <div class="tool-detail-sidebar-card stagger-item">
          <h3 class="tool-detail-sidebar-title">Details</h3>
          <div class="tool-detail-info-row">
            <div>
              <div class="tool-detail-info-item-label">Pricing Model</div>
              <div class="tool-detail-info-item-value">${tool.pricing}</div>
            </div>
            <div>
              <div class="tool-detail-info-item-label">User Rating</div>
              <div class="tool-detail-info-item-value" style="color: var(--accent-yellow);">${stars} ${tool.rating}/5</div>
            </div>
            ${cat ? `
            <div>
              <div class="tool-detail-info-item-label">Category</div>
              <div class="tool-detail-info-item-value">${cat.icon} ${cat.name}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    
    ${relatedHtml}
  `;

  showPage('tool');
}

// -------------------------
// Blog Rendering Logic
// -------------------------
let currentBlogFilter = 'all';

function renderBlogFilters() {
  const container = document.getElementById('blogFilterPills');
  if(!container) return;
  container.innerHTML = `<button class="filter-pill active" onclick="renderBlogPosts('all')">All Articles</button>`;
  
  blogCategories.forEach(cat => {
    container.innerHTML += `<button class="filter-pill" onclick="renderBlogPosts('${cat.id}')">${cat.name}</button>`;
  });
}

function renderBlogPosts(categoryId) {
  currentBlogFilter = categoryId;
  
  // Update Pills
  document.querySelectorAll('#blogFilterPills .filter-pill').forEach(pill => {
    pill.classList.remove('active');
    if(categoryId === 'all' && pill.textContent.includes('All Articles')) pill.classList.add('active');
    else if(categoryId !== 'all' && pill.textContent.includes(getBlogCategoryById(categoryId)?.name)) pill.classList.add('active');
  });

  const container = document.getElementById('blogPostsGrid');
  if(!container) return;
  container.innerHTML = '';

  let filtered = categoryId === 'all' ? blogPosts : getBlogPostsByCategory(categoryId);
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">📝</div>
        <h3 class="empty-state-title">No articles found</h3>
        <p class="empty-state-desc">We are still writing content for this category.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(post => {
    const cat = getBlogCategoryById(post.category);
    
    const card = document.createElement('div');
    card.className = 'tool-card stagger-item';
    card.style.cursor = 'pointer';
    card.onclick = () => window.location.href = post.contentUrl;
    
    card.innerHTML = `
      <div style="height: 220px; margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; position: relative;">
        <img src="${post.featuredImage}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"/>
        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(10,10,10,0.8) 100%); pointer-events: none;"></div>
        <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 0.4rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; color: #fff; border: 1px solid rgba(255,255,255,0.1);">
          ${post.readTime}
        </div>
      </div>
      <div style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">
        <span style="color: ${cat?.color || 'var(--accent-blue)'}; font-weight: 700;">${cat?.name}</span>
      </div>
      <h3 class="tool-card-name" style="margin-bottom: 0.75rem; font-size: 1.35rem; line-height: 1.3; font-family: 'Outfit', sans-serif;">${post.title}</h3>
      <p class="tool-card-desc" style="margin-bottom: 1.5rem; line-height: 1.6; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${post.excerpt}</p>
      <div style="display: flex; align-items: center; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem; margin-top: auto;">
        <img src="${post.author.avatar}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--bg-glass);" />
        <div style="line-height: 1.3;">
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${post.author.name}</div>
          <div style="color: var(--text-tertiary); font-size: 0.8rem;">${post.date}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
