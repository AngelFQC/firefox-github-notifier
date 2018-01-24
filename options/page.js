document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local
        .get({
            accessToken: '',
            showNotifications: false,
            showNotificationsDecreased: true
        })
        .then((options) => {
            document.querySelector('#access-token').value = options.accessToken;
            document.querySelector('#show-notifications').checked = options.showNotifications;
            document.querySelector('#show-notifications-decreased').checked = options.showNotificationsDecreased;
        });
});
document.querySelector('form')
    .addEventListener('submit', (e) => {
        e.preventDefault();

        browser.storage.local.set({
            accessToken: e.target['access_token'].value,
            showNotifications: e.target['show_notifications'].checked,
            showNotificationsDecreased: e.target['show_notifications_decreased'].checked
        });
    });
