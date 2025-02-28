const translations = {
    'zh-CN': {
        'submit': '提交',
        'charCount': '字符数',
        // 其他翻译...
    },
    'en-US': {
        'submit': 'Submit',
        'charCount': 'Character count',
        // 其他翻译...
    }
};

function t(key) {
    const lang = navigator.language || 'zh-CN';
    return translations[lang][key] || key;
} 