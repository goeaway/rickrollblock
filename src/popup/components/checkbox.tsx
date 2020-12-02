import React, { FC } from "react";
import styled, { css } from "styled-components";

export interface CheckboxProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const Checkbox : FC<CheckboxProps> = ({checked, onChange}) => {
    return (
        <Container>
            <Input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
            <Checkmark checked={checked} onClick={() => onChange(!checked)} />
        </Container>
    );
}

export default Checkbox;

const Container = styled.div`
    position: relative;
`

const Input = styled.input`
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    visibility: hidden;
`

interface CheckmarkProps {
    checked: boolean;
}

const Checkmark = styled.div`
    height: 20px;
    width: 20px;
    border: 1px solid rgba(0,0,0,0.5);
    background: #F3F4F6;
    border-radius: 4px;
    cursor: pointer;
    transition: all 300ms ease;

    &:hover {
        background: #E5E7EB;
    }

    &:after {
        content: "";
        position: absolute;
        display: none;
    }

    ${(p: CheckmarkProps) => p.checked && css`
        background: #10B981;

        &:hover {
            background: #10B981;
        }

        &:after {
            display: block;
            width: 5px;
            height: 12px;
            top: 1px;
            right: 6px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    `}
`

