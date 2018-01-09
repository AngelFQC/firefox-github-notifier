const notificationsUrl = "https://github.com/notifications";
var count = 0;

function update() {
    browser.storage.local
        .get({
            accessToken: '',
            showNotifications: false
        })
        .then((options) => {
            if (!options.accessToken) {
                return;
            }

            fetch(`https://api.github.com/notifications?access_token=${options.accessToken}`, {
                cache: 'reload'
            })
                .then((response) => {
                    response.json()
                        .then((notifications) => {
                            let badgeText = notifications.length
                                + (notifications.length >= 50 ? '+' : '');

                            browser.browserAction.setBadgeText({
                                text: badgeText
                            });

                            if (0 === notifications.length || count === notifications.length) {
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
                                iconUrl: browser.extension.getURL("icons/github.png"),
                                title: count === 1
                                    ? `There is 1 new notification`
                                    : `There are ${badgeText} new notifications`,
                                message: items
                            });
                        });
                });

        });
}

setInterval(update, 1000 * 60);

browser.browserAction.onClicked.addListener((e) => {
    browser.tabs.query({
        'url': notificationsUrl
    }, (tabs) => {
        if (!tabs.length) {
            browser.tabs.create({
                'url': notificationsUrl,
                'active': true
            });

            return;
        }

        browser.tabs.query({
            'url': notificationsUrl,
            'active': true
        }, (activeTabs) => {
            if (activeTabs.length) {
                return;
            }

            browser.tabs.update(tabs[0].id, {
                'active': true
            });
        });
    });
});
