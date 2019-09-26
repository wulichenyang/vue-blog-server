const xss = require('xss')

/**
 * 普通文本过滤
 * 
 * @param {String} stringXss
 * @return {String} xss过滤后的文本
 */
const stringXss = (stringXss) => {
  let afterString = xss(stringXss, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: function (tag, name, value, isWhiteAttr) {
      return '';
    }
  })
  return afterString
}

/**
 * html文本过滤
 * 
 * @param {String} htmlContent
 * @return {String} xss过滤后的html文本
 */
const htmlXss = (htmlContent) => {

  let afterHtmlContent = xss(htmlContent, {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt'],
      p: [],
      div: [],
      br: [],
      blockquote: [],
      li: [],
      ol: [],
      ul: [],
      strong: [],
      em: [],
      u: [],
      pre: [],
      b: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      h7: [],
      video: []
    },
    stripIgnoreTag: true,
    onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
      if (tag == 'div' && name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    }
  });

  return afterHtmlContent;
}

module.exports = {
  stringXss,
  htmlXss
}