// config.js - إعدادات JSONBin.io

const CONFIG = {
    JSONBIN: {
        BIN_ID: '69c9835736566621a85cb01f',
        MASTER_KEY: '$2a$10$5X1fbgOhCiGV23rKGUkLLuhD/a1eIHNuKwvtNzKwu3W7KT8CGpaG.',
        BASE_URL: 'https://api.jsonbin.io/v3/b/'
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
