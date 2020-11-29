import React from "react";
import styled from "styled-components";

export interface OptionsItemProps {
    name: string;
    desc?: string;
}

const OptionsItem: React.FC<OptionsItemProps> = ({name, desc, children}) => {
    return (
        <Container>
            <Name>{name}</Name>
            <Action>
                {children}
            </Action>
        </Container>
    )
}

export default OptionsItem;

const Container = styled.div`
    padding: .5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Name = styled.span`

`

const Action = styled.span`

`