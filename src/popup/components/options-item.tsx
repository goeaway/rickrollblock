import React from "react";
import styled from "styled-components";

export interface OptionsItemProps {
    name: string;
    desc?: string;
    reverse?: boolean;
}

const OptionsItem: React.FC<OptionsItemProps> = ({name, desc, reverse, children}) => {
    return (
        <Container reverse={reverse}>
            <Name>
                {name}
                <Desc>{desc}</Desc>
            </Name>
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
    display: flex;
    justify-content: space-between;
    align-items: center;

    flex-direction: ${(p: ContainerProps) => p.reverse ? "row-reverse": "row"};
`

const Name = styled.div`
    display: flex;
    flex-direction: column;
`

const Desc = styled.span`
    font-size: 11px;
    color: rgba(0,0,0,.54);
`

const Action = styled.span`

`