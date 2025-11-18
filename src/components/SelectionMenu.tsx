import React, { memo } from 'react'

interface SelectionMenuProps {
    text: string;
    position: { top: number; left: number };
    onClose: () => void
}

const SelectionMenu: React.FC<SelectionMenuProps> = memo(({ text, position, onClose }) => {
    if (!text) return null;

    return (
        <div
            id='selection-menu'
            className='absolute bg-blue-500 text-white px-3 py-1 rounded shadow-md z-50 flex gap-2'
            style={{ top: position.top, left: position.left, whiteSpace: "nowrap" }}
        >
            <button
                className='hover:bg-blue-600 px-2 py-1 rounded'
                onClick={() => {
                    navigator.clipboard.writeText(text);
                    onClose();
                }}>Copy</button>
            <button
                className='hover:bg-blue-600 px-2 py-1 rounded'
                onClick={() => alert("Hello")}>Dịch</button>


        </div>
    )
});

export default SelectionMenu
