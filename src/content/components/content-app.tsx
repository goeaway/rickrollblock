import React, { FC } from "react";
import styled, { css } from "styled-components";
import { browser } from "webextension-polyfill-ts";

const ContentApp : FC = () => {
    const allowOnceHandler = () => {
        browser.runtime.sendMessage({key:"override"});
    }

    const unblockUrlHandler = () => {
        browser.runtime.sendMessage({key:"unblock"});
    }

    return (
        <Container>
            <Hero>
                <TitleContainer>
                    <Name>
                        Rick Roll Blocker
                    </Name>
                    <Title>
                        That was close!
                    </Title>
                </TitleContainer>
                <Explanation>
                    It looks like someone tried to Rick Roll you, luckily we stopped it!
                </Explanation>
                <ButtonRow>
                    <Button onClick={allowOnceHandler}>Rick Roll me just this once</Button>
                    <Button variant="secondary" onClick={unblockUrlHandler}>Unblock this URL</Button>
                </ButtonRow>
            </Hero>
        </Container>
    );
}

export default ContentApp;

const Hero = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
    color: rgba(0,0,0,0.87);
    background: #F9FAFB;
    padding: 2rem;
`

const TitleContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const Title = styled.span`
    font-size: 100px;
    line-height: 100px;
`

const Explanation = styled.span`

`;

interface ButtonProps {
    variant?: "primary" | "secondary";
}

const Button = styled.button`
    border-radius: 4px;
    outline: none;
    padding: .5rem 1rem;
    cursor: pointer;
    font-family: inherit;
    color: #F9FAFB;
    background: #111827;
    border: 1px solid #111827;
    transition: background 300ms ease;

    &:hover {
        background: #374151;
    }

    ${(p: ButtonProps) => p.variant === "secondary" && css`
        border: 1px solid #4B5563;
        color: #111827;
        background: #F9FAFB;

        &:hover {
            background: #E5E7EB;
        }
    
    `}
`

const ButtonRow = styled.div`
    display: flex;
    gap: 1rem;
`

const Name = styled.span`
    font-size: 18px;
    line-height: 22px;
    font-weight: 600;
`

const Container = styled.div`

`