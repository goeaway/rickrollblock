import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { browser } from "webextension-polyfill-ts";
import OptionsItem from "./options-item";
import UrlInput from "./url-input";

const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const PopupApp = () => {
    const [menuHeight, setMenuHeight] = useState(null);
    const [showMenu, setShownMenu] = useState("main");
    const [enabled, setEnabled] = useState(false);
    const [blacklist, setBlacklist] = useState([]);
    
    const mainRef = useRef<HTMLDivElement>(null);
    const blacklistRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAsync = async () => {
            const blacklistItem = await browser.storage.local.get("blacklist");
            setBlacklist(blacklistItem[Object.keys(blacklistItem)[0]] || []);
        
            const enabledItem = await browser.storage.local.get("enabled");
            setEnabled(enabledItem[Object.keys(enabledItem)[0]] || false);
        }

        loadAsync();

        setMenuHeight((containerRef.current.firstChild as HTMLDivElement).offsetHeight);
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
        if(!value) {
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
                        <button type="button" onClick={returnToMainClickHandler}>{"<"}</button>
                        blacklist
                        {blacklist.map((b,i) => (
                            <UrlInput 
                                key={i} 
                                value={b} 
                                onUpdate={value => blacklistItemUpdated(value, i)}
                                onRemove={() => removeBlacklistItemHandler(i)} />
                        ))}
                        <UrlInput onUpdate={addBlacklistItemHandler} resetAfterUpdate />
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
    overflow-x: hidden;
    overflow-y: auto;
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