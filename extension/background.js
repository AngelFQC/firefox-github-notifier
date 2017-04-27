const notificationsUrl = "https://github.com/notifications";
var count = 0;

browser.storage.local.get('accessToken')
    .then((options) => {
        let accessToken = options.accessToken || '';

        function update() {
            if (!accessToken) {
                return;
            }

            fetch('https://api.github.com/notifications?access_token=' + accessToken, {
                cache: 'reload'
            })
                .then((response) => {
                    response.json()
                        .then((notifications) => {
                            browser.browserAction.setBadgeText({
                                text: notifications.length.toString()
                            });

                            if (count === notifications.length) {
                                return;
                            }

                            count = notifications.length;

                            let items = '';

                            notifications.forEach((notification) => {
                                items += '[' + notification.repository.full_name + '] ';
                                items += notification.subject.title;
                                items += "\n";
                            });

                            browser.notifications.create({
                                type: "basic",
                                iconUrl: browser.extension.getURL("icons/github.png"),
                                title: "There are " + count + " new notifications",
                                message: items
                            });
                        });
                });
        }

        setInterval(update, 1000 * 60);
    });

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
