(function () {
    let lastNotificationCount = 0,
        responsePollInterval = 30;

    async function update() {
        let options,
            githubNotifications;

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

            responsePollInterval = response.headers.get('X-Poll-Interval') || responsePollInterval;

            setTimeout(update, 1000 * responsePollInterval);

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            githubNotifications = await response.json();
        } catch (error) {
            browser.browserAction.setTitle({
                title: error.message
            });
            browser.browserAction.disable();

            setTimeout(update, 1000 * responsePollInterval);

            return;
        }

        browser.browserAction.setTitle({
            title: 'GitHub Notifier'
        });
        browser.browserAction.enable();

        if (0 === githubNotifications.length) {
            browser.browserAction.setBadgeText({
                text: ''
            });

            return;
        }

        let badgeText = githubNotifications.length + (githubNotifications.length >= 50 ? '+' : '');

        browser.browserAction.setBadgeText({
            text: badgeText
        });

        if (lastNotificationCount === githubNotifications.length) {
            return;
        }

        if (lastNotificationCount > githubNotifications.length && !options.showNotificationsDecreased) {
            return;
        }

        lastNotificationCount = githubNotifications.length;

        if (!options.showNotifications) {
            return;
        }

        if (!lastNotificationCount) {
            return;
        }

        let items = '';

        githubNotifications.forEach((notification) => {
            items += `[${notification.repository.full_name}] ${notification.subject.title} \n`;
        });

        browser.notifications.create({
            type: "basic",
            iconUrl: browser.extension.getURL("icons/github.svg"),
            title: lastNotificationCount === 1
                ? `There is 1 new notification`
                : `There are ${badgeText} new notifications`,
            message: items
        });
    }

    browser.browserAction.onClicked.addListener((e) => {
        const notificationsUrl = 'https://github.com/notifications';

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

    update();
})();
