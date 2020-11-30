import { browser, Runtime } from "webextension-polyfill-ts";

const messageListener = async (message: {key: string, value: any}, sender: Runtime.MessageSender) => {
    const currentData = await browser.storage.local.get("currentBlacklistURL");
    // get the current blacklist url
    const url = currentData[Object.keys(currentData)[0]];

    switch(message.key) {
        case "override": {
            // set that we want to allow it this time
            await browser.storage.local.set({"oneTimeOverride": url})
            // update the tab, expect the url listener to pick up
            browser.tabs.update(sender.tab.id, {url, loadReplace: true });
            break;
        }
        case "unblock": {
            const blacklistItem = await browser.storage.local.get("blacklist");
            const blacklist = (blacklistItem && blacklistItem[Object.keys(blacklistItem)[0]] as Array<string>) || [];

            const unblockIndex = blacklist.indexOf(url);
            blacklist.splice(unblockIndex, 1);
            await browser.storage.local.set({"blacklist": blacklist});

            browser.tabs.update(sender.tab.id, { url, loadReplace: true });
            break;
        }
    }
}

export default messageListener;