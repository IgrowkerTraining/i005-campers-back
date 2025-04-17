import * as sanitizeHtml  from 'sanitize-html';

export const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
};


export const SANITIZE_RICH_TEXT_CONFIG: sanitizeHtml.IOptions = {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'code', 'pre', 'blockquote'],
    allowedAttributes: {
        'a': ['href', 'name', 'target'],
        
    },
    allowedIframeHostnames: [],
};