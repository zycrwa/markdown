'use strict';

hexo.extend.filter.register('before_generate', () => {
  hexo.theme.config.menu = {
    首页: '/',
    归档: '/archives'
  };
});
