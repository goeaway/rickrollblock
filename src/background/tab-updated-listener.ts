import { browser, Tabs } from "webextension-polyfill-ts";

const tabUpdatedListener = async (id: number, change: Tabs.OnUpdatedChangeInfoType, tab: Tabs.Tab) => {
    if(change.url) {
        // make sure we're enabled first
        const enabledItem = await browser.storage.local.get("enabled");
        const enabled = enabledItem && enabledItem[Object.keys(enabledItem)[0]];

        if(!enabled) {
            return;
        }

        const { url } = tab;
        // check if a oneTimeOverride for this exists (we don't want to block it)
        const oneTimeOverrideItem = await browser.storage.local.get("oneTimeOverride");
        const oneTimeOverrideVal = oneTimeOverrideItem && oneTimeOverrideItem[Object.keys(oneTimeOverrideItem)[0]];
        const oneTimeOverride = oneTimeOverrideVal === url; 

        // if tab is not in a whitelist, redirect to the blocked page
        if(!oneTimeOverride) {
            await browser.storage.local.set({"currentBlacklistURL": url})
            await browser.tabs.update(id, { url: "/blocked.html", loadReplace: true });
        }
    
        // now remove the override so it doesn't happen again
        if(oneTimeOverride) {
            await browser.storage.local.remove("oneTimeOverride");
        }
    }
};

export default tabUpdatedListener;