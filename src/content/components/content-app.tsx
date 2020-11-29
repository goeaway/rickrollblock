import React, { FC } from "react";
import styled from "styled-components";
import { browser } from "webextension-polyfill-ts";

const ContentApp : FC = () => {
    const clickHandler = () => {
        
        browser.runtime.sendMessage({override: true});
    }

    return (
        <Container>
            <Title>
                That was close!
            </Title>
            <Explanation>
                It looks like someone tried to Rick Roll you. Luckily we stopped it.
            </Explanation>
            <Button onClick={clickHandler}>Let me see Rick!</Button>
        </Container>
    );
}

export default ContentApp;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`

const Title = styled.span`
    font-size: 100px;
    line-height: 120px;
`

const Explanation = styled.span`

`;

const Button = styled.button`

`