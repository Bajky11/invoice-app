// pages/templates/editor.js

import React, {useState, useRef, useCallback} from 'react';
import {Button, Stack, TextField} from '@mui/material';
import {useDrag, useDrop} from 'react-dnd';
import {sendError} from "next/dist/server/api-utils";

const ItemTypes = {
    TOOLBAR_ITEM: 'toolbar_item',
    CANVAS_ITEM: 'canvas_item',
};

const gridSize = 10; // Velikost mřížky pro zarovnání

const ToolbarItem = ({itemType, label}) => {
    const [, drag] = useDrag(() => ({
        type: ItemTypes.TOOLBAR_ITEM,
        item: {itemType},
    }));

    return (
        <div ref={drag} className="draggable">
            {label}
        </div>
    );
};

const CanvasItem = ({
                        id,
                        type,
                        left,
                        top,
                        content,
                        styles,
                        onSelect,
                        isSelected,
                        updateItem,
                        deleteItem,
                        isEditing,
                        setEditing,
                    }) => {
    const ref = useRef(null);

    const [{isDragging}, drag] = useDrag({
        type: ItemTypes.CANVAS_ITEM,
        item: {id},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            if (delta) {
                let x = left + delta.x;
                let y = top + delta.y;

                // Zarovnání na mřížku
                x = Math.round(x / gridSize) * gridSize;
                y = Math.round(y / gridSize) * gridSize;

                updateItem(id, {left: x, top: y});
            }
        },
    });

    drag(ref);

    const handleClick = (e) => {
        e.stopPropagation();
        onSelect(id);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setEditing(id, true);
    };

    const handleBlur = () => {
        setEditing(id, false);
    };

    function handleReturn() {
        switch (type) {
            case 'input': {
                return (
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateItem(id, {content: e.target.value})}

                        style={{
                            ...styles,
                        }}
                    />
                )
            }
            case 'rect': {
                return (
                    <div
                        style={{
                        ...styles
                    }}>

                    </div>
                )
            }
            default: {
                return (
                    <div
                        className="resizing-text"
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={handleBlur}
                        onInput={(e) =>
                            updateItem(id, {content: e.currentTarget.textContent})
                        }
                        style={{
                            ...styles
                        }}
                    >
                        {content}
                    </div>
                )
            }
        }
    }

    return (
        <div
            ref={ref}
            className={`canvas-item ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left,
                top,
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            {handleReturn(type)}
        </div>
    );
};

const TemplateEditor = () => {
    const [canvasItems, setCanvasItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [editingItems, setEditingItems] = useState({});

    const invoiceRef = useRef(null);
    const generatedInvoiceRef = useRef(null);
    const previewInvoiceRef = useRef(null);

    const [, drop] = useDrop({
        accept: [ItemTypes.TOOLBAR_ITEM],
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const invoiceRect = invoiceRef.current.getBoundingClientRect();
            let x = offset.x - invoiceRect.left;
            let y = offset.y - invoiceRect.top;

            // Zarovnání na mřížku
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;

            if (item.itemType) {
                // Přidání nového prvku z toolbaru
                addItem(item.itemType, x, y);
            }
        },
    });

    function createRectItem(id, left, top) {
        return {
            id,
            type: "rect",
            left,
            top,
            content: "",
            styles: {width: 100, height: 100, border: "1px solid black"},
        }
    }

    function createTextItem(id, left, top) {
        return {
            id: id,
            type: "text",
            left,
            top,
            content: "text",
            styles: {fontSize: 16, fontWeight: 'normal'},
        }
    }

    function createInputItem(id, left, top) {
        return {
            id,
            type: "input",
            left,
            top,
            content: "input",
            styles: {fontSize: 16, fontWeight: 'normal'},
        }
    }

    const addItem = (type, left, top) => {
        const id = Date.now();
        let newItem = null;

        switch (type) {
            case "div": {
                newItem = createTextItem(id, left, top);
                break;
            }
            case "rect": {
                newItem = createRectItem(id, left, top);
                break;
            }
            case "input": {
                newItem = createInputItem(id, left, top);
                break;
            }
        }
        setCanvasItems((items) => [...items, newItem]);
    };

    const updateItem = (id, changes) => {
        setCanvasItems((items) =>
            items.map((item) => (item.id === id ? {...item, ...changes} : item)),
        );
    };

    const deleteItem = (id) => {
        setCanvasItems((items) => items.filter((item) => item.id !== id));
        setSelectedItemId(null);
    };

    const selectItem = (id) => {
        setSelectedItemId(id);
    };

    const setEditing = (id, isEditing) => {
        setEditingItems((prev) => ({...prev, [id]: isEditing}));
    };

    const isEditing = (id) => {
        return editingItems[id] || false;
    };

    function isNumber(str) {
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    function stringToNumber(str) {
        if (isNumber(str)) {
            return Number(str);
        } else {
            throw new Error("The provided string is not a valid number");
        }
    }

    const handlePropertyChange = (e) => {
        const {name, value} = e.target;
        const convertedValue = isNumber(value) ? stringToNumber(value) : value;
        const selectedItem = getSelectedItem();
        if (selectedItem) {
            updateItem(selectedItemId, {
                styles: {...selectedItem.styles, [name]: convertedValue},
            });
        }
    };

    const getSelectedItem = () => {
        return canvasItems.find((item) => item.id === selectedItemId);
    };

    function resolveUnits(attributeName) {
        switch (attributeName) {
            case 'fontSize':
            case 'width':
            case "height":
                return "px";
            default:
                return "";
        }
    }

    function resolveName(attributeName) {
        switch (attributeName) {
            case 'fontSize':
                return "font-size";
            case 'fontWeight':
                return "font-weight"
            default:
                return attributeName;
        }
    }

    const generateHTMLFromElements = () => {
        const invoice = invoiceRef.current;

        let htmlContent = `<div style="position: relative; width: ${invoice.offsetWidth}px; height: ${invoice.offsetHeight}px; background-color: white; box-sizing: border-box;">\n`;

        canvasItems.forEach((item) => {
            const {type, left, top, content, styles} = item;
            const stylesString = Object.entries(styles).map(style => {
                return `${resolveName(style[0])}:${style[1]}${resolveUnits(style[0])}`
            }).join(';')

            const style = `position:absolute; left:${left}px; top:${top}px; ${stylesString};`

            switch (type) {
                case "input": {
                    const value = content || '';
                    htmlContent += `<input type="text" value="${value}" style="${style}" />\n`;
                    break;
                }
                case "rect": {
                    htmlContent += `<div style="${style}">${content}</div>\n`;
                    break;
                }
                default: {
                    htmlContent += `<div style="${style}">${content}</div>\n`;
                }
            }
        });

        htmlContent += '</div>';
        return htmlContent;
    };

    const generateHTML = () => {
        const htmlContent = generateHTMLFromElements();
        generatedInvoiceRef.current.innerHTML = htmlContent;
    };

    const downloadHTML = () => {
        const htmlContent = generateHTMLFromElements();
        const blob = new Blob([htmlContent], {type: 'text/html'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'generated-invoice.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePreview = () => {
        const generatedInvoice = generatedInvoiceRef.current;
        const clone = generatedInvoice.cloneNode(true);
        const inputs = clone.getElementsByTagName('input');

        // Nahradit všechny inputy s jejich hodnotami
        Array.from(inputs).forEach((input) => {
            const p = document.createElement('p');
            p.style.cssText = input.style.cssText;
            p.textContent = input.value;
            input.parentNode.replaceChild(p, input);
        });

        previewInvoiceRef.current.innerHTML = clone.innerHTML;
    };

    const printInvoice = () => {
        const printContents = previewInvoiceRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        const originalTitle = document.title;

        document.body.innerHTML = `<div id="printArea">${printContents}</div>`;
        document.title = 'Invoice';

        window.print();

        document.body.innerHTML = originalContents;
        document.title = originalTitle;
    };

    const clearAll = () => {
        setCanvasItems([]);
        setSelectedItemId(null);
        generatedInvoiceRef.current.innerHTML = '';
        previewInvoiceRef.current.innerHTML = '';
    };

    const handleCanvasClick = () => {
        setSelectedItemId(null);
    };

    // Kombinace refů pro invoice a drop
    const combinedRef = useCallback(
        (node) => {
            invoiceRef.current = node;
            if (node !== null) {
                drop(node);
            }
        },
        [drop],
    );


    return (
        <>
            <Stack direction="row" gap={1}>
                <Stack width={200} gap={1}> // Right bar

                    <ToolbarItem itemType="div" label="Text"/>
                    <ToolbarItem itemType="input" label="Input"/>
                    <ToolbarItem itemType="rect" label="Rectangle"/>

                    <Button variant="contained" color="primary" onClick={generateHTML}>
                        Generovat VZOR
                    </Button>
                    <Button variant="contained" color="primary" onClick={downloadHTML}>
                        Stáhnout Vzor
                    </Button>
                    <Button variant="contained" color="primary" onClick={generatePreview}>
                        Generovat náhled
                    </Button>
                    <Button variant="contained" color="primary" onClick={printInvoice}>
                        Tisk
                    </Button>
                    <Button variant="contained" color="secondary" onClick={clearAll}>
                        Vyčistit
                    </Button>

                    {/* Panel nástrojů pro úpravu vlastností */}
                    {selectedItemId !== null && getSelectedItem() && (
                        <PropertiesPanel selectedItem={getSelectedItem()} handlePropertyChange={handlePropertyChange}/>
                    )}
                </Stack>

                <Stack> // invoices


                    {/* Kontejner pro plochy faktury */}
                    <div className="container">
                        {/* První A4: Editor faktury */}
                        <div className="invoice" onClick={handleCanvasClick} ref={combinedRef}>
                            {canvasItems.map((item) => (
                                <CanvasItem
                                    key={item.id}
                                    {...item}
                                    isSelected={item.id === selectedItemId}
                                    onSelect={selectItem}
                                    updateItem={updateItem}
                                    deleteItem={deleteItem}
                                    isEditing={isEditing(item.id)}
                                    setEditing={setEditing}
                                />
                            ))}
                        </div>

                        {/* Druhá A4: Vygenerované HTML */}
                        <div className="invoice" ref={generatedInvoiceRef}>
                            {/* Vygenerované HTML se zobrazí zde */}
                        </div>

                        {/* Třetí A4: Náhled pro tisk */}
                        <div className="invoice" ref={previewInvoiceRef}>
                            {/* Náhled se zobrazí zde */}
                        </div>
                    </div>
                </Stack>
            </Stack>
        </>
    );
};

function PropertiesPanel({selectedItem, handlePropertyChange}) {

    console.log(selectedItem)

    function getCorrectPanel(type) {
        switch (type) {
            case "rect": {
                return (
                    <Stack>
                        <TextField
                            label={"width"}
                            type={"number"}
                            name={"width"}
                            value={selectedItem.styles.width}
                            onChange={handlePropertyChange}
                        />
                        <TextField
                            label={"height"}
                            type={"number"}
                            name={"height"}
                            value={selectedItem.styles.height}
                            onChange={handlePropertyChange}
                        />
                        {/*Border width*/}

                    </Stack>
                )
            }
            default:
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <label>
                            Velikost písma:
                            <input
                                type="number"
                                name="fontSize"
                                min="8"
                                max="72"
                                value={selectedItem.styles.fontSize}
                                onChange={handlePropertyChange}
                            />{' '}
                            px
                        </label>
                        <label>
                            Tučnost písma:
                            <select
                                name="fontWeight"
                                value={selectedItem.styles.fontWeight}
                                onChange={handlePropertyChange}
                            >
                                <option value="normal">Normální</option>
                                <option value="bold">Tučné</option>
                            </select>
                        </label>
                        <button onClick={() => deleteItem(selectedItem.id)}>Smazat prvek</button>
                    </div>

                )
        }
    }

    return (
        getCorrectPanel(selectedItem.type)
    )


}

export default TemplateEditor;
