import React from "react";
import styled, { css } from "styled-components";

export interface OptionsItemProps {
    name: string;
    desc?: string;
    reverse?: boolean;
}

const OptionsItem: React.FC<OptionsItemProps> = ({name, desc, reverse, children}) => {
    return (
        <Container reverse={reverse}>
            <Name>{name}</Name>
            <Action>
                {children}
            </Action>
        </Container>
    )
}

export default OptionsItem;

interface ContainerProps {
    reverse?: boolean;
}

const Container = styled.div`
    padding: .5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    flex-direction: ${(p: ContainerProps) => p.reverse ? "row-reverse": "row"};
`

const Name = styled.span`

`

const Action = styled.span`

`