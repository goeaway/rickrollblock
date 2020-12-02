import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { browser, Storage } from "webextension-polyfill-ts";
import OptionsItem from "./options-item";
import UrlInput from "./url-input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faSkullCrossbones } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "./checkbox";

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
    const [enabled, setEnabled] = useState(true);
    const [blacklist, setBlacklist] = useState([]);
    const [currentUrlAdded, setCurrentUrlAdded] = useState(false);
    const [currentUrlBlockForbidden, setCurrentUrlBlockForbidden] = useState(false);
    
    useEffect(() => {
        const loadAsync = async () => {
            const blacklistItem = await browser.storage.local.get("blacklist");
            setBlacklist(blacklistItem[Object.keys(blacklistItem)[0]] || defaultBlacklist);
        
            const enabledItem = await browser.storage.local.get("enabled");

            const enabled = enabledItem[Object.keys(enabledItem)[0]]; 

            if(enabled !== undefined) {
                setEnabled(enabled);
            } else {
                // default to true
                await browser.storage.local.set({"enabled": true});
            }
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

        return () => {
            browser.storage.onChanged.removeListener(storageUpdateHandler);
        }
    }, []);

    useEffect(() => {
        const setBlacklist = async () => {
            await browser.storage.local.set({"blacklist": blacklist});
        }

        setBlacklist();
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
        if(!value || value === "https://" || value === "http://" || blacklist.indexOf(value) > -1) {
            return;
        }

        setBlacklist(bl => [value, ...bl]);
    }

    const enabledChangeHandler = async (checked: boolean) => {
        setEnabled(checked);

        await browser.storage.local.set({"enabled": checked});
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
        <Container>
            <Title>
                Rick Roll Blocker
            </Title>
            {!currentUrlBlockForbidden && (
                <OptionsButton addMode={!currentUrlAdded} onClick={toggleCurrentClickHandler}>
                    {currentUrlAdded ? "Unblock Current URL" : "Blacklist Current URL"}
                </OptionsButton>
            )}
            <OptionsItem name="Enabled" desc="Toggle if blacklisted urls should be blocked">
                <Checkbox checked={enabled} onChange={enabledChangeHandler} />
            </OptionsItem>
            <OptionsItem name="Blacklist" desc="Define which urls should be blocked">
            </OptionsItem>
            <UrlInput 
                placeholder="Add URL to blacklist"
                onUpdate={addBlacklistItemHandler} 
                resetAfterUpdate 
                />
            <BlacklistContainer>
                {blacklist.map((b,i) => (
                    <UrlInput 
                        key={i} 
                        value={b} 
                        onUpdate={value => blacklistItemUpdated(value, i)}
                        onRemove={() => removeBlacklistItemHandler(i)} />
                ))}
                {blacklist.length === 0 && (
                    <BlacklistEmptyContainer>
                        <FontAwesomeIcon icon={faExclamationTriangle} size="4x" color={"rgba(0,0,0,0.24)"} />
                        <BlacklistEmptyText>Nothing in Blacklist</BlacklistEmptyText>
                    </BlacklistEmptyContainer>
                )}
            </BlacklistContainer>
        </Container>
    );
}

export default PopupApp;

const Container = styled.div`
    width: 300px;
    height: 400px;
    overflow: hidden;
    display: flex;
    transition: height 100ms;
    flex-direction: column;
    position: relative;
    padding: .5rem;
    gap: 1rem;
    color: rgba(0,0,0,0.87);
    background: #F9FAFB;
`

const BlacklistContainer = styled.div`
    overflow-x: hidden;
    overflow-y: auto;

    padding: 0 .5rem;
    padding-bottom: .75rem;
    margin: -.5rem;
`

interface OptionsButtonProps {
    addMode: boolean;
}

const OptionsButton = styled.button`
    width: 100%;
    outline: none;
    padding: .5rem;
    cursor: pointer;
    border-radius: 4px;
    background: #F3F4F6;
    color: #111827;
    border: 1px solid rgba(0,0,0,0.5);
    transition: background 300ms ease;
    font-family: 'Oxygen', sans-serif;

    &:hover {
        background: rgba(0,0,0,.2);
    }
    
    ${(p: OptionsButtonProps) => p.addMode && css`
        background: #111827;
        color: #F3F4F6;
        border: none;

        &:hover {
            background: rgba(0,0,0,.8);
        }
    `}
    
`

const Title = styled.h1`
    font-size: 20px;
    line-height: 30px;
    margin: 0;
    margin-bottom: -.5rem;
`

const BlacklistEmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;

    > *:first-child {
        margin-bottom: .5rem;
    }
`

const BlacklistEmptyText = styled.span`
    font-size: 14px;
    color: rgba(0,0,0,.34);
`