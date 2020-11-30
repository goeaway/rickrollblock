import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { browser, Storage } from "webextension-polyfill-ts";
import OptionsItem from "./options-item";
import UrlInput from "./url-input";

const defaultBlacklist = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
];

const neverBlockPattern = "moz-extension://*.?|about:*.?";

/**
 * Returns true if specified url is not allowed to be blocked
 * @param url 
 */
const urlBlockForbidden = (url: string) => RegExp(neverBlockPattern).test(url);

const PopupApp = () => {
    const [menuHeight, setMenuHeight] = useState(null);
    const [showMenu, setShownMenu] = useState("main");
    const [enabled, setEnabled] = useState(false);
    const [blacklist, setBlacklist] = useState([]);
    const [currentUrlAdded, setCurrentUrlAdded] = useState(false);
    const [currentUrlBlockForbidden, setCurrentUrlBlockForbidden] = useState(false);
    
    const mainRef = useRef<HTMLDivElement>(null);
    const blacklistRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAsync = async () => {
            const blacklistItem = await browser.storage.local.get("blacklist");
            setBlacklist(blacklistItem[Object.keys(blacklistItem)[0]] || defaultBlacklist);
        
            const enabledItem = await browser.storage.local.get("enabled");
            setEnabled(enabledItem[Object.keys(enabledItem)[0]] || false);
        }
        
        loadAsync();

        const storageUpdateHandler = ((changes: {[s: string]: Storage.StorageChange}) => {
            const blacklistChange = changes["blacklist"];
            if(blacklistChange) {
                const newBlacklist = blacklistChange.newValue as Array<string>;

                browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
                    const { url } = tabs[0];
                    setCurrentUrlAdded(newBlacklist.indexOf(url) > -1);
                    setCurrentUrlBlockForbidden(urlBlockForbidden(url));
                });
            }
        });

        browser.storage.onChanged.addListener(storageUpdateHandler);

        setMenuHeight((containerRef.current.firstChild as HTMLDivElement).offsetHeight);

        return () => {
            browser.storage.onChanged.removeListener(storageUpdateHandler);
        }
    }, []);

    useEffect(() => {
        const setBlacklist = async () => {
            await browser.storage.local.set({"blacklist": blacklist});
        }

        setBlacklist();

        if(showMenu === "blacklist") {
            setMenuHeight(blacklistRef.current.offsetHeight);
        }
    }, [blacklist]);

    useEffect(() => {
        setMenuHeight(mainRef.current.offsetHeight);
    }, [currentUrlBlockForbidden, currentUrlAdded]);

    const blacklistItemUpdated = (value: string, index: number) => {
        if(!value) {
            removeBlacklistItemHandler(index);
        } else {
            setBlacklist(bl => {
                // don't update if the values are the same
                if(bl[index] !== value) {
                    const copy = [...bl];
                    copy.splice(index, 1, value);
                    return copy;
                }
                return bl;
            });
        }
    }

    const removeBlacklistItemHandler = (index: number) => {
        setBlacklist(bl => {
            const copy = [...bl];
            copy.splice(index, 1);
            return copy;
        });
    }

    const addBlacklistItemHandler = (value: string) => {
        if(!value || blacklist.indexOf(value) > -1) {
            return;
        }

        setBlacklist(bl => [...bl, value]);
    }

    const enabledChangeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setEnabled(checked);

        await browser.storage.local.set({"enabled": checked});
    }

    const returnToMainClickHandler = () => {
        setShownMenu("main");
    }

    const blacklistOptionClickHandler = () => {
        setShownMenu("blacklist");
    }

    const onAnimationStartHandler = () => {
        // entry happens before exit
        // hence why these are switched
        if(showMenu === "main") {
            setMenuHeight(blacklistRef.current.offsetHeight);
        }
        
        if(showMenu === "blacklist") {
            setMenuHeight(mainRef.current.offsetHeight);
        }
    }

    const toggleCurrentClickHandler = () => {
        browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
            const { url } = tabs[0];
            // some pages shouldn't be blockable, such as any page of the extension itself
            if(!currentUrlAdded && !urlBlockForbidden(url)) {
                addBlacklistItemHandler(url);
            } 
            
            if(currentUrlAdded) {
                const index = blacklist.indexOf(url);
                removeBlacklistItemHandler(index);
            }
        })
    }

    return (
        <Container height={menuHeight} ref={containerRef}>
            <AnimatePresence initial={false}>
                {showMenu === "main" && (
                    <Menu
                        key="main"
                        initial={{x: "-105%"}}
                        animate={{x: 0}}
                        exit={{x: "-105%"}}
                        ref={mainRef}
                        onAnimationStart={onAnimationStartHandler}
                    >
                        {!currentUrlBlockForbidden && (
                            <OptionsButton onClick={toggleCurrentClickHandler}>
                                {currentUrlAdded ? "Remove Current URL from blacklist" : "Add Current URL to blacklist"}
                            </OptionsButton>
                        )}
                        <OptionsItem name="Enabled" desc="Toggle if blacklisted urls should be blocked">
                            <input type="checkbox" checked={enabled} onChange={enabledChangeHandler} />
                        </OptionsItem>
                        <OptionsItem name="Blacklist" desc="Define exactly which urls should be blocked">
                            <button onClick={blacklistOptionClickHandler}>{">"}</button>
                        </OptionsItem>
                    </Menu>
                )}
                {showMenu === "blacklist" && (
                    <Menu
                        key="blacklist"
                        initial={{x: "105%"}}
                        animate={{x: 0}}
                        exit={{x: "105%"}}
                        ref={blacklistRef}
                        onAnimationStart={onAnimationStartHandler}
                    >
                        <BlacklistContainer>
                            <OptionsItem name="Blacklist" reverse>
                                <button type="button" onClick={returnToMainClickHandler}>{"<"}</button>
                            </OptionsItem>
                            {blacklist.map((b,i) => (
                                <UrlInput 
                                    key={i} 
                                    value={b} 
                                    onUpdate={value => blacklistItemUpdated(value, i)}
                                    onRemove={() => removeBlacklistItemHandler(i)} />
                            ))}
                            <UrlInput onUpdate={addBlacklistItemHandler} resetAfterUpdate />
                        </BlacklistContainer>
                    </Menu>
                )}
            </AnimatePresence>
        </Container>
    );
}

export default PopupApp;

interface ContainerProps {
    height: number;
}

const Container = styled.div`
    width: 250px;
    height: ${(p: ContainerProps) => p.height}px;
    max-height: 450px;
    overflow: hidden;
    display: flex;
    transition: height 100ms;
    flex-direction: column;
    position: relative;
`

const Menu = styled(motion.div)`
    width: 100%;
    position: absolute;
    padding: 1rem;
`

const BlacklistContainer = styled.div`
    max-height: 450px;
    overflow-x: hidden;
    overflow-y: auto;
`

const OptionsButton = styled.button`
    width: 100%;
`