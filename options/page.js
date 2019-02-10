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

        let token = e.target['access_token'].value.trim();

        browser.storage.local.set({
            accessToken: token,
            showNotifications: e.target['show_notifications'].checked,
            showNotificationsDecreased: e.target['show_notifications_decreased'].checked
        });

        e.target['access_token'].value = token;
    });
