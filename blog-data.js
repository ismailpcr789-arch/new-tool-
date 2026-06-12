// AI TOOLS HUB — Blog Data Layer
// ═══════════════════════════════════════════════════════

const blogCategories = [
  { id: 'tutorials', name: 'Tutorials & Guides', color: '#00D4FF' },
  { id: 'comparisons', name: 'Tool Comparisons', color: '#7C3AED' },
  { id: 'industry-news', name: 'Industry News', color: '#F472B6' },
  { id: 'interviews', name: 'Founder Interviews', color: '#F59E0B' }
];

const blogPosts = [
  {
    id: 'how-to-choose-ai-writing-assistant',
    title: 'How to Choose the Right AI Writing Assistant in 2026',
    slug: 'how-to-choose-ai-writing-assistant',
    excerpt: 'With hundreds of AI writing tools on the market, finding the perfect one for your workflow can be overwhelming. Here is our definitive guide to picking the best AI writer.',
    contentUrl: 'blog/how-to-choose-ai-writing-assistant.html',
    category: 'tutorials',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      role: 'Content Strategist'
    },
    date: 'June 10, 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    tags: ['Writing', 'Productivity', 'Guide']
  },
  {
    id: 'chatgpt-vs-claude',
    title: 'ChatGPT vs Claude: Which LLM is better for coding?',
    slug: 'chatgpt-vs-claude',
    excerpt: 'An in-depth comparison of the two leading large language models when it comes to programming, debugging, and software architecture.',
    contentUrl: 'blog/chatgpt-vs-claude.html',
    category: 'comparisons',
    author: {
      name: 'David Chen',
      avatar: 'https://i.pravatar.cc/150?u=david',
      role: 'Lead Developer'
    },
    date: 'June 05, 2026',
    readTime: '8 min read',
    featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    tags: ['LLMs', 'Coding', 'OpenAI', 'Anthropic']
  },
  {
    id: 'future-of-ai-image-generation',
    title: 'The Future of AI Image Generation',
    slug: 'future-of-ai-image-generation',
    excerpt: 'Midjourney, DALL-E, and Stable Diffusion are advancing rapidly. What can we expect from generative art over the next 12 months?',
    contentUrl: 'blog/future-of-ai-image-generation.html',
    category: 'industry-news',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://i.pravatar.cc/150?u=elena',
      role: 'AI Researcher'
    },
    date: 'May 28, 2026',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1686191128892-3b37013f7382?auto=format&fit=crop&w=800&q=80',
    tags: ['Generative Art', 'Design', 'Trends']
  }
];

// ─── Helper Functions ───
function getBlogCategoryById(id) { return blogCategories.find(c => c.id === id); }
function getBlogPostBySlug(slug) { return blogPosts.find(p => p.slug === slug); }
function getBlogPostsByCategory(catId) { return blogPosts.filter(p => p.category === catId); }
function getRelatedBlogPosts(currentPostId, categoryId) {
  return blogPosts.filter(p => p.category === categoryId && p.id !== currentPostId).slice(0, 3);
}
