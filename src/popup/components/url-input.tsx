import React, { useEffect, useState } from "react";
import styled from "styled-components";

export interface UrlInputProps {
    value?: string;
    onUpdate: (newValue: string) => void;
    onRemove?: () => void;
    resetAfterUpdate?: boolean;
}

const UrlInput : React.FC<UrlInputProps> = ({value, onUpdate, onRemove, resetAfterUpdate}) => {
    const [editValue, setEditValue] = useState(value || "");

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const updateClickHandler = () => {
        onUpdate(editValue);
        if(resetAfterUpdate) {
            setEditValue("");
        }
    }

    return (
        <Container>
            <Input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} />
            <button type="button" onClick={updateClickHandler}>+</button>
            {onRemove && (
                <button type="button" onClick={onRemove}>-</button>
            )}
        </Container>
    )
}

export default UrlInput;

const Container = styled.div`
    display: flex;
`

const Input = styled.input`
    width: 100%;
`