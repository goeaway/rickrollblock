import { browser } from "webextension-polyfill-ts";
import messageListener from "./message-listener";
import tabUpdatedListener from "./tab-updated-listener";

// change to get from local storage


// start by getting the blacklist
browser.storage.local.get("blacklist").then(data => {
    const blacklist = data[Object.keys(data)[0]];
    // use the built in filter on the listener to only run the event when the url matches a blacklisted url
    browser.tabs.onUpdated.addListener(tabUpdatedListener, { urls: blacklist });
    browser.runtime.onMessage.addListener(messageListener);
});

browser.storage.onChanged.addListener(changes => {
    const blacklistChange = changes["blacklist"];

    if(blacklistChange) {
        const newBlacklist = blacklistChange.newValue;
        // remove existing listener 
        browser.tabs.onUpdated.removeListener(tabUpdatedListener);
        // add listener with new blacklist
        browser.tabs.onUpdated.addListener(tabUpdatedListener, { urls: newBlacklist });
    }
});


