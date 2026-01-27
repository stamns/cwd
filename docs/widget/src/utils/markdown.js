import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked
try {
  marked.setOptions({
    gfm: true, // 启用 GitHub Flavored Markdown
    breaks: true, // 启用换行符转 <br>
  });
} catch (e) {
  console.error('Failed to configure marked:', e);
}

/**
 * 渲染 Markdown 为 HTML，并进行净化
 * @param {string} content Markdown 内容
 * @returns {string} 净化后的 HTML
 */
export function renderMarkdown(content) {
  if (!content) return '';
  try {
    const html = marked.parse(content);
    // marked.parse can return a Promise if async is enabled, but we are using sync mode
    // Just in case, handle potential Promise (though unlikely with current config)
    if (html instanceof Promise) {
      console.warn('marked.parse returned a Promise. Async markdown rendering is not fully supported in this sync flow.');
      return '';
    }
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return DOMPurify.sanitize(content); // Fallback to plain text (sanitized)
  }
}
