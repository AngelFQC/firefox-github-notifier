document.addEventListener('DOMContentLoaded', () => {
    var accessToken = browser.storage.local.get('accessToken');

    accessToken.then((options) => {
        document.querySelector('#access-token').value = options.accessToken || '';
    });
});
document.querySelector('form')
    .addEventListener('submit', (e) => {
        e.preventDefault();

        browser.storage.local.set({
            accessToken: document.querySelector('#access-token').value
        });
    });
