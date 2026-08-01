'use strict';

/* global hexo */

// Protect display-math blocks from Marked so MathJax can process them afterward.
hexo.extend.filter.register('marked:extensions', extensions => {
  extensions.push({
    name: 'displayMath',
    level: 'block',
    start(source) {
      return source.match(/^\s*\$\$/m)?.index;
    },
    tokenizer(source) {
      const match = /^\$\$[ \t]*\r?\n([\s\S]+?)\r?\n\$\$[ \t]*(?:\r?\n|$)/.exec(source);
      if (!match) return;
      return {
        type: 'displayMath',
        raw: match[0],
        text: match[1]
      };
    },
    renderer(token) {
      return `<div class="math-display">$$\n${token.text}\n$$</div>\n`;
    }
  });
});
