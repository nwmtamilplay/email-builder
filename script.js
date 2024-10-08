// Directly import Sortable from the CDN using an ES module URL
import { blocks } from '/htmlblocks.js'
import { uploadImgToForeStorage, isProgrammaticClick, setIsProgrammaticClick, saveAsHtml, calculateHtmlSizeInKB, fetchHtml, createBlock, currentBlockName, setCurrentBlockName, checkBlockExits, changeBlocksSettings, history, setHistoryPos, historyControls, historyUndo, historyRedo } from '/functions.js'

const blockList = async () => {
    await fetch('/block-list.json')
        .then(res => res.json())
        .then(data => {
            createBlockList(data)
            startEmailBuilding();
            // Instantiate PreLoader with custom range values
            const myPreLoader = new PreLoader({
                rangeTop: 150,// set Top Viewport for Pre Loader
                rangeBottom: 50, // set Bottom Viewport for Pre Loader
                setImgLoaderBottomRange: 0,// set Bottom Viewport for Img Loader
            });
            myPreLoader.initImgLoader();
        })
}
blockList();

function createBlockList(data) {
    data.forEach(cat => {
        let addBlocks = document.createElement("div");
        addBlocks.className = 'add-blocks';
        addBlocks.dataset.blockName = cat.category;

        let h3 = document.createElement('h3');
        h3.textContent = cat.title;
        h3.className = 'title';

        let blockOptions = document.createElement('div');
        blockOptions.className = 'block-options';
        cat.blocks.forEach(block => {
            let blockDiv = document.createElement("div");
            blockDiv.className = 'addThis';
            blockDiv.dataset.blockAction = block.action;

            let img = document.createElement("img");
            img.setAttribute('img-loader', block.img)

            blockDiv.append(img)
            blockOptions.append(blockDiv);
        });
        addBlocks.append(h3, blockOptions)
        document.querySelector("#builder").append(addBlocks)
    });
}

window.addEventListener("load", () => {

})

function startEmailBuilding() {
    const defaultBlock = ["header", "footer"];
    const addBlocks = document.querySelectorAll('.add-blocks');
    const createBlockControls = (blockName, uniqueId, myOptions) => {
        // create block controls
        const blockControls = document.querySelector("#blockControls");
        // whenever create new controls clear previews one
        // blockControls.innerHTML = '';
        const blockOptions = document.createElement('div');
        blockOptions.className = `blockOptions_section_block_${uniqueId} blockOptions_section active`;
        myOptions.forEach((option, optionIndex) => {
            const field = document.createElement('div');
            field.className = `blockOptions block_${uniqueId}`;
            if (option.dividerID) field.classList.add(option.dividerID, 'divider_controls');
            field.classList.add(`input_field_${optionIndex}`);
            field.style.gridColumn = option.gridColumn
            field.style.gridRow = option.gridRow;
            field.innerHTML = (option.info) ? `<h5>${option.name}<div data-info="${option.info}"></div></h5>` : `<h5>${option.name}</h5>`;

            const finalValue = (str, value) => {
                if (str == null) return value;
                return str.replaceAll("$", value);
            }
            switch (option.field) {
                case 'divider':
                    {
                        const id = option.name.replaceAll(' ', "_").toLowerCase();
                        // console.log(id)
                        const input = document.createElement("input");
                        input.type = "checkbox";
                        input.value = false;
                        input.id = `${option.id}_${uniqueId}`;
                        input.style.display = "none";
                        const label = document.createElement("label");
                        label.setAttribute("for", `${option.id}_${uniqueId}`);
                        field.classList.add('divider')
                        input.addEventListener('change', (e) => {
                            // console.log(`.blockOptions_section_block_${uniqueId} .blockOptions.${option.id}`);
                            document.querySelectorAll(`.blockOptions_section_block_${uniqueId} .blockOptions.${option.id}`).forEach(controls => {
                                controls.classList.toggle('show')
                            })
                        })
                        input.addEventListener('focusout', (e) => {

                        })
                        field.append(label);
                        blockOptions.append(input, field);
                    }
                    break;
                case 'input_color':
                    {
                        let enter = false;
                        const color = document.createElement("div");
                        color.className = "color";
                        color.dataset.name = option.name;
                        color.style.color = option.inputFault;
                        color.style.background = option.inputFault;
                        const input = document.createElement("input");
                        input.type = "color";
                        input.setAttribute("list", 'top_color');
                        input.value = option.inputFault;
                        let inputPreviewVal = option.inputFault;
                        let previewVal = option.default;
                        let isCloneClick = false;
                        history[blockName].forEach(items => {
                            if (isProgrammaticClick && items.elem.split(" ")[0].replace(".", "") == `input_field_${optionIndex}`) {
                                isCloneClick = true;
                            }
                        });
                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }
                        function hexToRgba(hex, alpha = 1) {
                            // Remove the hash symbol if present
                            hex = hex.replace('#', '');

                            // Expand shorthand hex (e.g., #fff to #ffffff)
                            if (hex.length === 3) {
                                hex = hex.split('').map(char => char + char).join('');
                            }

                            // Parse the hex values
                            const r = parseInt(hex.slice(0, 2), 16);
                            const g = parseInt(hex.slice(2, 4), 16);
                            const b = parseInt(hex.slice(4, 6), 16);

                            // Return the RGBA string
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        }
                        input.addEventListener('change', (e) => {
                            let value = hexToRgba(e.target.value, 1);
                            // console.log(document.querySelector(`.block_${uniqueId} ${option.for}`))
                            if (option.doThis) value = option.doThis(`.block_${uniqueId} ${option.for}`, value)
                            console.log(value)
                            color.style.color = value;
                            color.style.background = value;
                            // console.log(document.querySelector(`.input_field_${optionIndex} .color`))
                            changeBlocksSettings(option, value, value, `.block_${uniqueId}.input_field_${optionIndex} .color`, option.colorPath, uniqueFor, `.block_${uniqueId}`)
                            if (isCloneClick) {
                                isCloneClick = false;
                            } else {
                                historyControls(blockName, `.input_field_${optionIndex} .color`, option.colorPath, option, previewVal, inputPreviewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                            }
                            previewVal = value;
                            inputPreviewVal = value;
                            enter = true;
                        })
                        input.addEventListener('input', (e) => {
                            let value = hexToRgba(e.target.value, 1);
                            // console.log(document.querySelector(`.block_${uniqueId} ${option.for}`))
                            if (option.doThis) value = option.doThis(`.block_${uniqueId} ${option.for}`, value)
                            // console.log(value)

                            color.style.color = value;
                            color.style.background = value;
                        })
                        // Close the div when clicking outside
                        window.addEventListener('click', function (event) {
                            if (!color.contains(event.target)) {
                                if (enter) {
                                    // console.log(event.target.value)
                                    historyControls(blockName, `.input_field_${optionIndex} .color`, option.colorPath, option, previewVal, inputPreviewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                                    enter = false;
                                }
                            }
                        });
                        color.addEventListener("click", () => {
                            input.click();
                        })

                        field.append(input, color);
                        blockOptions.append(field);
                    }
                    break;
                case 'input_select':
                    {
                        const input = document.createElement("select");
                        option.options.forEach((opt, optIndex) => {
                            const optTag = document.createElement("option");
                            optTag.value = opt;
                            optTag.innerHTML = option.htmlOptions ? option.htmlOptions[optIndex] : opt;
                            input.append(optTag)
                        })
                        input.value = option.inputFault;
                        let inputPreviewVal = option.inputFault;
                        let previewVal = option.default;
                        let isCloneClick = false;
                        history[blockName].forEach(items => {
                            if (isProgrammaticClick && items.elem.split(" ")[0].replace(".", "") == `input_field_${optionIndex}`) {
                                isCloneClick = true;
                            }
                        });

                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }

                        input.addEventListener('change', (e) => {
                            let value = e.target.value;
                            // console.log(document.querySelector(`.block_${uniqueId} ${option.for}`))
                            if (option.doThis) value = option.doThis(document.querySelectorAll(`.block_${uniqueId} ${option.for}`), e.target.value)
                            // console.log(value)
                            changeBlocksSettings(option, value, value, `.block_${uniqueId}.input_field_${optionIndex} select`, ['value'], uniqueFor, `.block_${uniqueId}`)
                            if (isCloneClick) {
                                isCloneClick = false;
                            } else {
                                historyControls(blockName, `.input_field_${optionIndex} select`, ["value"], option, previewVal, inputPreviewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                            }
                            previewVal = value;
                            inputPreviewVal = value;
                        })
                        input.addEventListener('focusout', () => {
                            historyControls(blockName, `.input_field_${optionIndex} select`, ["value"], option, previewVal, inputPreviewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                        })
                        field.append(input);
                        blockOptions.append(field);
                    }
                    break;
                case 'input_file':
                    {
                        const input = document.createElement("input");
                        input.type = 'file'
                        input.value = null;
                        input.name = 'Logo Upload';
                        let replace = option.replace ? option.replace : null;
                        let sizeLimit = (option.sizeLimit) ? Number(option.sizeLimit) : 150;
                        let inputPreviewVal = option.inputFault;
                        let previewVal = option.default;
                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }
                        field.addEventListener("click", () => {
                            input.click();
                        })
                        input.addEventListener('change', async (e) => {
                            const selectedFile = e.target.files[0];
                            const maxSize = Number(sizeLimit) * 1024; // 300 KB in bytes
                            if (selectedFile && selectedFile.size > maxSize) {
                                alert(`File size exceeds ${sizeLimit} KB. Please select a smaller file.`);
                                e.target.value = ''; // Clear the input
                            } else {
                                if (selectedFile) {
                                    const img = document.querySelectorAll(`.block_${uniqueId} ${uniqueFor}`);
                                    uploadImgToForeStorage(selectedFile, img, input, replace, option);
                                }
                            }
                        });
                        field.append(input);
                        blockOptions.append(field);
                    }
                    break;
                case 'input_range':
                    {
                        const input = document.createElement("input");
                        input.type = 'range'
                        input.min = option.min;
                        input.max = option.max;
                        input.value = option.default;
                        let replace = option.replace ? option.replace : null;
                        field.dataset.value = finalValue(replace, option.default);
                        let inputPreviewVal = option.inputFault;
                        let previewVal = finalValue(replace, option.default);
                        let isCloneClick = false;
                        history[blockName].forEach(items => {
                            if (isProgrammaticClick && items.elem.split(" ")[0].replace(".", "") == `input_field_${optionIndex}`) {
                                isCloneClick = true;
                            }
                        });

                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }
                        input.addEventListener('input', (e) => {
                            field.dataset.value = finalValue(replace, e.target.value);
                        })
                        input.addEventListener('change', (e) => {
                            let value = e.target.value;
                            // console.log(document.querySelector(`.block_${uniqueId} ${option.for}`))
                            if (option.doThis) value = option.doThis(`.block_${uniqueId} ${option.for}`, value)
                            field.dataset.value = finalValue(replace, e.target.value);
                            changeBlocksSettings(option, value, finalValue(replace, value), `.block_${uniqueId}.input_field_${optionIndex} input`, ['value'], uniqueFor, `.block_${uniqueId}`)
                            if (isCloneClick) {
                                isCloneClick = false;
                            } else {
                                historyControls(blockName, `.input_field_${optionIndex} input`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, finalValue(replace, option.default), uniqueFor, `.block_${uniqueId}`);
                            }
                            previewVal = finalValue(replace, value);
                            inputPreviewVal = value;
                        })
                        input.addEventListener('focusout', (e) => {
                            let value = e.target.value;
                            // console.log(document.querySelector(`.block_${uniqueId} ${option.for}`))
                            if (option.doThis) value = option.doThis(`.block_${uniqueId} ${option.for}`, value)
                            field.dataset.value = finalValue(replace, e.target.value);
                            historyControls(blockName, `.input_field_${optionIndex} input`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, finalValue(replace, option.default), uniqueFor, `.block_${uniqueId}`);
                        })
                        field.append(input);
                        blockOptions.append(field);
                    }
                    break;
                case 'input':
                    {
                        const input = document.createElement("input");
                        input.value = option.inputFault;
                        let inputPreviewVal = option.inputFault;
                        let replace = option.replace ? option.replace : null;
                        let previewVal = finalValue(replace, option.default);
                        let isCloneClick = false;
                        history[blockName].forEach(items => {
                            if (isProgrammaticClick && items.elem.split(" ")[0].replace(".", "") == `input_field_${optionIndex}`) {
                                isCloneClick = true;
                            }
                        });

                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }
                        input.addEventListener('change', (e) => {
                            let value = e.target.value;
                            if (option.doThis) value = option.doThis(document.querySelector(`.block_${uniqueId} ${option.for}`), e.target.value)
                            console.log(value)
                            changeBlocksSettings(option, value, finalValue(replace, value), `.block_${uniqueId}.input_field_${optionIndex} input`, ['value'], uniqueFor, `.block_${uniqueId}`)
                            if (isCloneClick) {
                                isCloneClick = false;
                            } else {
                                historyControls(blockName, `.input_field_${optionIndex} input`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, finalValue(replace, option.default), uniqueFor, `.block_${uniqueId}`);
                            }
                            previewVal = finalValue(replace, value);
                            inputPreviewVal = value;
                        })
                        input.addEventListener('focusout', (e) => {
                            historyControls(blockName, `.input_field_${optionIndex} input`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, finalValue(replace, option.default), uniqueFor, `.block_${uniqueId}`);
                        })
                        field.append(input);
                        blockOptions.append(field);
                    }
                    break;
                case 'textarea':
                    {
                        const input = document.createElement("textarea");
                        input.textContent = option.inputFault;
                        let inputPreviewVal = option.inputFault;
                        let previewVal = option.default;
                        let isCloneClick = false;
                        history[blockName].forEach(items => {
                            if (isProgrammaticClick && items.elem.split(" ")[0].replace(".", "") == `input_field_${optionIndex}`) {
                                isCloneClick = true;
                            }
                        });

                        let uniqueFor;
                        if (option.for == 'parentBlock') {
                            uniqueFor = `.block_${uniqueId}`;
                        } else {
                            uniqueFor = `${option.for}`;
                        }
                        input.addEventListener('change', (e) => {
                            if (option.doThis) option.doThis()
                            let keepValues = [];
                            let listDiv = document.querySelectorAll(`.container .block_${uniqueId} ${option.for} > *`);
                            let outputDiv = document.createElement("div");
                            listDiv.forEach(list => {
                                let eachAttributes = [];
                                option.keepValues.forEach(paths => {
                                    paths.forEach((path, index) => {
                                        if (paths[0] == "style") {
                                            if (option.changeOnly) {
                                                eachAttributes.push(list.querySelector(option.changeOnly).getAttribute("style"))
                                            } else {
                                                eachAttributes.push(list.getAttribute("style"))
                                            }
                                        } else {
                                            let changeTargetInput = list;
                                            if (option.changeOnly) {
                                                let value = changeTargetInput.querySelector(option.changeOnly)[path];
                                                eachAttributes.push(value)
                                            } else {
                                                let value = changeTargetInput[path];
                                                eachAttributes.push(value)
                                            }

                                        }
                                    });
                                });
                                keepValues.push(eachAttributes)
                            })
                            outputDiv.innerHTML = "";
                            e.target.value.split("\n").forEach((item, indexDiv) => {
                                if (item.trim() == '') item = option.emptyText ? option.emptyText : "Blank"
                                option.inputChange.forEach((path, index) => {
                                    let changeTargetInput
                                    if (listDiv[indexDiv]) {
                                        changeTargetInput = listDiv[indexDiv].cloneNode(true);
                                    } else {
                                        changeTargetInput = listDiv[0].cloneNode(true);
                                        console.log(changeTargetInput)
                                    }
                                    if (changeTargetInput && typeof changeTargetInput === 'object') {
                                        if (index === option.change.length - 1) {
                                            if (option.changeOnly) {
                                                changeTargetInput.querySelectorAll(option.changeOnly).forEach(element => {
                                                    element[path] = item;
                                                });
                                            } else {
                                                changeTargetInput[path] = item;
                                            }
                                            option.keepValues.forEach((paths, indexKeep) => {
                                                paths.forEach((path, index) => {
                                                    let keepChangeTargetInput = changeTargetInput;
                                                    if (keepChangeTargetInput && typeof keepChangeTargetInput === 'object') {
                                                        if (index === option.change.length - 1) {
                                                            let keepItem;
                                                            if (keepValues[indexDiv]) {
                                                                keepItem = keepValues[indexDiv][indexKeep]
                                                            } else {
                                                                keepItem = keepValues[0][indexKeep]
                                                            }
                                                            keepChangeTargetInput[path] = keepItem;
                                                            outputDiv.append(keepChangeTargetInput);
                                                        } else {
                                                            keepChangeTargetInput = keepChangeTargetInput[path];
                                                        }
                                                    } else {
                                                        console.error(`Invalid path or changeTarget at ${path}`);
                                                    }
                                                    // console.log(item, changeTargetInput)
                                                });
                                            });
                                            outputDiv.append(changeTargetInput);
                                        } else {
                                            changeTargetInput = changeTargetInput[path];
                                        }
                                    } else {
                                        console.error(`Invalid path or changeTarget at ${path}`);
                                    }
                                });
                            })
                            // console.log(outputDiv.innerHTML)
                            changeBlocksSettings(option, e.target.value, outputDiv.innerHTML, `.block_${uniqueId}.input_field_${optionIndex} textarea`, ['value'], uniqueFor, `.block_${uniqueId}`)
                            if (isCloneClick) {
                                isCloneClick = false;
                            } else {
                                historyControls(blockName, `.input_field_${optionIndex} textarea`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                            }
                            inputPreviewVal = e.target.value;
                            previewVal = outputDiv.innerHTML;
                            // document.querySelector(`.container .block_${uniqueId} ${option.for}`).innerHTML = outputDiv.innerHTML;
                        })
                        input.addEventListener('focusout', (e) => {
                            historyControls(blockName, `.input_field_${optionIndex} textarea`, ["value"], option, inputPreviewVal, previewVal, option.inputFault, option.default, uniqueFor, `.block_${uniqueId}`);
                        })
                        input.addEventListener('input', (e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = (e.target.scrollHeight) + 'px';
                        })
                        field.append(input);
                        blockOptions.append(field);
                    }
                    break;
                default:
                    break;

            }

        })
        blockControls.append(blockOptions);
    }
    addBlocks.forEach(block => {
        const blockName = block.dataset.blockName;
        const title = block.querySelector(".title");
        const blockOptions = block.querySelector(".block-options");
        const blockBtns = block.querySelectorAll(".block-options .addThis");
        // toggle block option section show and hide
        title.addEventListener("click", () => {
            title.classList.toggle("active");
            blockOptions.classList.toggle('active');
        })
        blockBtns.forEach((blockBtn, index) => {

            // get each button action
            const action = blockBtn.dataset.blockAction;

            blockBtn.addEventListener('click', () => {
                const uniqueId = Math.floor(Math.random() * 100000000);
                setCurrentBlockName(`${blockName}_${blockBtn.dataset.blockAction}_${uniqueId}`);
                // console.log(uniqueId)
                // reset create history with block and historyPos values
                history[`${blockName}_${action}_${uniqueId}`] = [];
                history[`${blockName}_${action}_${uniqueId}_historyPos`] = 0;
                setHistoryPos(history[`${blockName}_${action}_${uniqueId}`].length);
                // toggle block options button active and inactive
                (block.querySelector(".block-options button.active")) && block.querySelector(".block-options button.active").classList.remove("active")
                blockBtn.classList.add("active");
                // fetch related html block
                const fetchData = async () => {
                    return await fetchHtml({ url: blocks[blockName][action].html });
                };
                fetchData().then(result => {
                    if (result.success) {// create block for email template
                        createBlockControls(`${blockName}_${action}_${uniqueId}`, uniqueId, blocks[blockName][action].options);
                        const createdBlock = createBlock({ html: result.html, action: (checkBlockExits(`${blockName}_${action}_${uniqueId}`)) ? 'replace' : 'append', append: '.container', blockName: `${blockName}_${action}_${uniqueId}`, uniqueId: `block_${uniqueId}`, action: action, blockBtn: blockBtn });
                        createdBlock.addEventListener("click", () => {
                            document.querySelectorAll('.email-blocks').forEach(email_blocks => {
                                email_blocks.classList.remove("selected_block");
                            });
                            createdBlock.classList.add("selected_block");
                            document.querySelectorAll('.blockOptions_section').forEach(email_blocks => {
                                email_blocks.classList.remove("active");
                            });
                            document.querySelector(`.blockOptions_section_block_${uniqueId}`).classList.add("active");
                        });
                        let preview = document.querySelector('#preview');
                        preview.scrollTop = preview.scrollHeight;
                    }
                });
            });
            // trigger defaultBlock 
            if (defaultBlock.includes(blockName)) {
                if (index == 0) {
                    blockBtn.dispatchEvent(new Event('click'));
                }
            }
        })
    });
    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault();
            historyUndo();
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
            event.preventDefault();
            historyRedo();
        }
    });
    document.querySelector('#undo').addEventListener("click", () => {
        // console.log(currentBlockName)
        historyUndo();
    });
    document.querySelector('#redo').addEventListener("click", () => {
        // console.log(currentBlockName)
        historyRedo();
    });
    document.querySelector('#saveButton').addEventListener('click', function () {
        saveAsHtml(`${document.querySelector("#emailTitle").value}`);
    });

    // setInterval(() => {
    //     calculateHtmlSizeInKB()
    // }, 1000);

    // Select the target node (the element you want to observe for changes)
    const targetNode = document.querySelector('.saveThisEmail');

    // Options for the observer (which mutations to observe)
    const config = {
        childList: true,        // Observe direct children changes (adding/removing elements)
        attributes: true,       // Observe attribute changes (e.g., class, style changes)
        subtree: true,          // Observe all descendants as well
        characterData: true     // Observe text content changes inside elements
    };

    // Callback function to execute when mutations are observed
    const callback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            calculateHtmlSizeInKB();
            // if (mutation.type === 'childList') {
            //     console.log('Child node has been added or removed.');
            // } else if (mutation.type === 'attributes') {
            //     console.log(`Attribute '${mutation.attributeName}' was modified.`);
            // } else if (mutation.type === 'characterData') {
            //     console.log('Text content changed.');
            // }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for the configured mutations
    observer.observe(targetNode, config);

    // To stop observing, you can call observer.disconnect() when necessary

    document.querySelector(".closeThis").addEventListener("click", (e) => {
        e.target.classList.toggle("active");
        document.querySelector("#trashBlocks").classList.toggle("active");
    })

    document.querySelector("#addNewBlock").addEventListener("click", () => {
        document.querySelector('#builder').classList.add('goTop', 'mobClose');
        document.querySelector('#blockControls').classList.remove('goTop');
    })

}


export function captureDiv(cls, trashBlock) {
    const divElement = document.querySelector(cls);

    html2canvas(divElement).then((canvas) => {
        // Append the canvas (screenshot) to the body or anywhere you want
        trashBlock.appendChild(canvas);
        // // Optionally, you can save it as an image file
        // const image = canvas.toDataURL("image/png");
        // const link = document.createElement("a");
        // link.href = image;
        // link.download = "screenshot.png";
        // link.click();
    });
}

// for Mobile
document.querySelector("#closeOnMob").addEventListener("click", () => {
    if (document.querySelector('#builder').classList.contains("mobClose")) document.querySelector('#builder').classList.remove("mobClose");
    if (document.querySelector('#blockControls').classList.contains("mobClose")) document.querySelector('#blockControls').classList.remove("mobClose");
})


