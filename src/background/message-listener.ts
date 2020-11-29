import { browser, Runtime } from "webextension-polyfill-ts";

const messageListener = async (message: {override:boolean}, sender: Runtime.MessageSender) => {
    if(message.override) {
        // get the current blacklist url
        const currentData = await browser.storage.local.get("currentBlacklistURL");

        const url = currentData[Object.keys(currentData)[0]];

        // set that we want to allow it this time
        await browser.storage.local.set({"oneTimeOverride": url})
        // update the tab, expect the url listener to pick up
        browser.tabs.update(sender.tab.id, {url, loadReplace: true });
    }
}

export default messageListener;