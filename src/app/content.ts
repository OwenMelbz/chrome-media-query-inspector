import defaultScreens from "../default-screens";

let screens = [];

interface Screen {
    label: string,
    value: string,
    mql?: undefined | null | any,
}

const announce = (screen) => {
    chrome.runtime.sendMessage({
        type: 'SCREEN_CHANGED',
        data: {
            label: screen.label,
            value: screen.value,
        },
    });
}

const handle = event => event.matches ? announce(screen) : false

const watch = (screen:Screen) => {
    screen.mql = window.matchMedia(screen.value);

    screen.mql.addListener(event => event.matches ? announce(screen) : false)

    if (screen.mql.matches) {
        announce(screen);
    }
}

const reset = () => {
    chrome.storage.sync.get(['enabled', 'screens'], function(result) {

        screens.filter(screen => screen.mql).forEach((screen:Screen) => {
            screen.mql.removeListener(handle)
        });

        screens = (result.screens || defaultScreens);

        if (!result.enabled) {
            return chrome.runtime.sendMessage({
                type: 'DISABLED',
                data: '',
            });
        }

        screens.forEach(watch);
    })
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CONFIG_UPDATED') {
        reset()
    }
});

reset()
