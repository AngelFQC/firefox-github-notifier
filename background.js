const notificationsUrl = 'https://github.com/notifications';
let count = 0;

async function update() {
    let options,
        notifications;

    try {
        options = await browser.storage.local.get({
            accessToken: '',
            showNotifications: false,
            showNotificationsDecreased: true
        });

        if (0 === options.accessToken.length) {
            throw new Error('Access Token not found.');
        }

        let response = await fetch('https://api.github.com/notifications', {
            headers: {'Authorization': `token ${options.accessToken}`},
            cache: 'reload'
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        notifications = await response.json();
    } catch (error) {
        browser.browserAction.setTitle({
            title: error.message
        });
        browser.browserAction.disable();

        return;
    }

    browser.browserAction.setTitle({
        title: 'GitHub Notifier'
    });
    browser.browserAction.enable();

    if (0 === notifications.length) {
        browser.browserAction.setBadgeText({
            text: ''
        });

        return;
    }

    let badgeText = notifications.length
        + (notifications.length >= 50 ? '+' : '');

    browser.browserAction.setBadgeText({
        text: badgeText
    });

    if (count === notifications.length) {
        return;
    }

    if (count > notifications.length && !options.showNotificationsDecreased) {
        return;
    }

    count = notifications.length;

    if (!options.showNotifications) {
        return;
    }

    if (!count) {
        return;
    }

    let items = '';

    notifications.forEach((notification) => {
        items += `[${notification.repository.full_name}] ${notification.subject.title} \n`;
    });

    browser.notifications.create({
        type: "basic",
        iconUrl: browser.extension.getURL("icons/github.svg"),
        title: count === 1
            ? `There is 1 new notification`
            : `There are ${badgeText} new notifications`,
        message: items
    });
}

setInterval(update, 1000 * 60);

browser.browserAction.onClicked.addListener((e) => {
    browser.tabs.query({
        'url': [
            notificationsUrl,
            `${notificationsUrl}?*`,
            `${notificationsUrl}/*`,
        ]
    }, (tabs) => {
        if (!tabs.length) {
            browser.tabs.create({
                'url': notificationsUrl,
                'active': true
            });

            return;
        }

        browser.tabs.update(tabs[0].id, {
            'active': true
        });
    });
});
