import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

export interface UrlInputProps {
    value?: string;
    onUpdate: (newValue: string) => void;
    onRemove?: () => void;
    resetAfterUpdate?: boolean;
    placeholder?: string;
}

const UrlInput : React.FC<UrlInputProps> = ({value, onUpdate, onRemove, resetAfterUpdate, placeholder}) => {
    const [editValue, setEditValue] = useState(value || "");
    const [valueHasBeenEdited, setValueHasBeenEdited] = useState(false);

    useEffect(() => {
        setEditValue(value);
        setValueHasBeenEdited(false);
    }, [value]);

    useEffect(() => {
        setValueHasBeenEdited(editValue !== value);
    }, [editValue]);

    const updateClickHandler = () => {
        const finished = 
            !editValue.startsWith("https://") && 
            !editValue.startsWith("http://") ? `https://${editValue}` : editValue;
        onUpdate(finished);
        if(resetAfterUpdate) {
            setEditValue("");
        }
    }

    return (
        <Container>
            <Input placeholder={placeholder} type="text" value={editValue} onChange={e => setEditValue(e.target.value)} />
            {(!onRemove || valueHasBeenEdited) && (
                <Button 
                    color="white"
                    background="#10B981"
                    type="button" 
                    onClick={updateClickHandler}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            )}
            {onRemove && (
                <Button 
                    color="white"
                    background="#EF4444"
                    type="button" 
                    onClick={onRemove}
                >
                    <FontAwesomeIcon icon={faMinus} />
                </Button>
            )}
        </Container>
    )
}

export default UrlInput;

const Container = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: .2rem;
`

const Input = styled.input`
    width: 100%;
    padding: .5rem;
    outline: none;
    border: 1px solid rgba(0,0,0,.5);
    border-radius: 4px 0 0 4px;
    background: #F3F4F6;
`

interface ButtonProps {
    background: string;
    color: string;
}

const Button = styled.button`
    height: 34px;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    border: none;
    border: 1px solid rgba(0,0,0,.5);
    border-left: none;
    cursor: pointer;
    transition: filter 300ms;

    color: ${(p: ButtonProps) => p.color};
    background: ${(p: ButtonProps) => p.background};
    
    &:hover {
        filter: brightness(.8);
    }

    &:last-child {
        border-radius: 0 4px 4px 0; 
    }
`