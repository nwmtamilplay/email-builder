import { captureDiv } from '/script.js'
export let isProgrammaticClick = false;
export let currentBlockName;
export const setCurrentBlockName = (name) => {
    currentBlockName = name;
}
export const setIsProgrammaticClick = (name) => {
    currentBlockName = name;
}

export const fetchHtml = async (get) => {
    try {
        const response = await fetch(get.url);
        const data = await response.text();
        return { success: true, html: data };
    } catch (error) {
        return { success: false, error };
    }
};
export const createBlock = (get) => {
    historyPos = Number(history[`${get.blockName}_historyPos`]);
    let currentHistoryPos = historyPos
    document.querySelector('#blockControls').classList.add('goTop', 'mobClose');
    document.querySelector('#builder').classList.remove('goTop');
    // console.log(currentBlockName)
    if (document.querySelector('.email-blocks')) {
        document.querySelectorAll('.email-blocks').forEach(email_blocks => {
            email_blocks.classList.remove("selected_block");
        })
    }
    if (document.querySelector('.blockOptions_section')) {
        document.querySelectorAll('.blockOptions_section').forEach(email_blocks => {
            email_blocks.classList.remove("active");
        })
        document.querySelector(`.blockOptions_section_${get.uniqueId}`).classList.add("active");
    }

    let block = document.createElement("div");
    block.className = `${get.uniqueId} email-blocks selected_block`;
    block.dataset.blockName = get.blockName;
    if (isProgrammaticClick) {
        // console.log(`.email-blocks.block_${currentBlockName.split("_").slice(-1)[0]}`)
        block.innerHTML = document.querySelector(`.email-blocks.block_${currentBlockName.split("_").slice(-1)[0]}`).innerHTML;
        // isProgrammaticClick = false;
    } else {
        block.innerHTML = get.html;
    }
    setCurrentBlockName(`${get.blockName}`);
    checkUndoRedo(get.blockName)
    if (isProgrammaticClick) {
        for (let index = 0; index <= history[get.blockName].length; index++) {
            historyUndo();
        }
        for (let index = 0; index <= currentHistoryPos; index++) {
            historyRedo();
        }
        isProgrammaticClick = false;
    }
    block.addEventListener("click", () => {
        document.querySelector('#addNewBlock').classList.remove('hide');
        document.querySelector('#blockControls').classList.add('goTop', 'mobClose');
        document.querySelector('#builder').classList.remove('goTop');
        historyPos = Number(history[`${get.blockName}_historyPos`]);
        setCurrentBlockName(`${get.blockName}`);
        checkUndoRedo(get.blockName)
        document.querySelectorAll('.email-blocks').forEach(email_blocks => {
            email_blocks.classList.remove("selected_block");
        })
        block.classList.add("selected_block");
        document.querySelectorAll('.blockOptions_section').forEach(email_blocks => {
            email_blocks.classList.remove("active");
        })
        document.querySelector(`.blockOptions_section_${get.uniqueId}`).classList.add("active");
    })
    let clone = document.createElement("div");
    clone.className = "cloneThis";
    clone.title = "Clone This Block";
    clone.addEventListener("click", () => {
        setTimeout(() => {
            deleteDiv.remove();
            clone.remove();
        }, 0);
        let copyHistory = history[get.blockName];
        let copyHistoryPos = history[`${get.blockName}_historyPos`];
        isProgrammaticClick = true;
        get.blockBtn.click();
        history[currentBlockName] = copyHistory.map(item => {
            return {
                ...item,
                uniqueId: `.block_${currentBlockName.split("_").slice(-1)[0]}`  // Update the uniqueId value
            }
        });
        history[`${currentBlockName}_historyPos`] = copyHistoryPos;
        // console.log(history)
    })

    let deleteDiv = document.createElement("div");
    deleteDiv.className = "deleteThis";
    deleteDiv.title = "Delete This Block";
    deleteDiv.addEventListener("click", () => {
        let trashBlock = document.createElement("div");
        trashBlock.className = 'trashItems';
        trashBlock.title = 'Restore';
        trashBlock.innerHTML = `<div>${get.blockName.split("_").slice(0, -1).join(" ").toUpperCase()} ID : <span>${get.blockName.split("_").slice(-1)}</span></div>`;
        captureDiv(`.email-blocks.block_${get.blockName.split("_").slice(-1)[0]}`, trashBlock);
        trashBlock.addEventListener("click", () => {
            document.querySelector(get.append).append(block);
            trashBlock.remove();
            if (history[`${get.blockName}_historyPos`]) {
                historyPos = Number(history[`${get.blockName}_historyPos`]);
            } else {
                historyPos = history[get.blockName].length;
            }
            setCurrentBlockName(`${get.blockName}`);
            checkUndoRedo(get.blockName)
            document.querySelectorAll('.email-blocks').forEach(email_blocks => {
                email_blocks.classList.remove("selected_block");
            })
            block.classList.add("selected_block");
            document.querySelectorAll('.blockOptions_section').forEach(email_blocks => {
                email_blocks.classList.remove("active");
            })
            document.querySelector(`.blockOptions_section_${get.uniqueId}`).classList.add("active");
        })
        document.querySelector(".trashBlocks").prepend(trashBlock);
        setTimeout(() => {
            deleteDiv.remove();
            clone.remove();
            block.remove();
            checkUndoRedo(get.blockName, true)
            document.querySelector(`.blockOptions_section_${get.uniqueId}`).classList.remove("active");
        }, 0);
    })
    block.addEventListener("mouseenter", () => {
        block.append(deleteDiv, clone);
    })
    block.addEventListener("mouseleave", () => {
        deleteDiv.remove();
        clone.remove();
    })
    document.querySelector(get.append).append(block);
    return block;
};

export const checkBlockExits = (blockName) => {
    if (document.querySelector(`.email-blocks[data-block-name="${blockName}"]`)) {
        return true
    } else {
        return false
    }
}

export const changeBlocksSettings = (option, inputChangeVal, changeVal, input, elamPath, uniqueFor, uniqueId, history = false) => {
    // console.log(uniqueId);
    // document.querySelector(uniqueId).dataset.history = historyPos;
    if (history) {
        let changeTargetInput = document.querySelector(input);
        elamPath.forEach((path, index) => {
            if (changeTargetInput && typeof changeTargetInput === 'object') {
                if (index === elamPath.length - 1) {
                    changeTargetInput[path] = inputChangeVal;
                } else {
                    changeTargetInput = changeTargetInput[path];
                }
            } else {
                console.error(`Invalid path or changeTarget at ${path}`);
            }
        });
    }
    // Function to apply changes
    document.querySelectorAll(`${uniqueId} ${uniqueFor}`).forEach(elem => {
        let changeTargetElem = elem;
        option.change.forEach((path, index) => {
            if (changeTargetElem && typeof changeTargetElem === 'object') {
                if (index === option.change.length - 1) {
                    changeTargetElem[path] = changeVal;
                } else {
                    changeTargetElem = changeTargetElem[path];
                }
            } else {
                console.error(`Invalid path or changeTarget at ${path}`);
            }
        });
    });
    checkUndoRedo(currentBlockName)
}

export let history = {};
export let historyPos = 0;

export const setHistoryPos = (newPos) => {
    historyPos = newPos;
    checkUndoRedo(currentBlockName)
}
export const setFieldCount = (count) => {
    fieldCount = count;
    checkUndoRedo(currentBlockName)
}

const checkUndoRedo = (blockName, disable = false) => {
    if (disable) {
        document.querySelector("#undo").classList.add("inactive");
        document.querySelector("#redo").classList.add("inactive");
    } else {
        if (historyPos <= 0) {
            document.querySelector("#undo").classList.add("inactive");
        } else {
            document.querySelector("#undo").classList.remove("inactive");
        }
        if (historyPos == history[blockName].length) {
            document.querySelector("#redo").classList.add("inactive");
        } else {
            document.querySelector("#redo").classList.remove("inactive");
        }
    }
}

export const historyControls = (blockName, elem, elamPath, option, inputChangeTo, changeTo, inputLastVal, lastVal, uniqueFor, uniqueId) => {
    // document.querySelector(uniqueFor.split(" ")[0]).dataset.history = historyPos;
    if (!history[blockName]) {
        history[blockName] = [];
    }
    if (historyPos < history[blockName].length) {
        history[blockName] = history[blockName].slice(0, historyPos);
    }
    // console.log(changeTo, lastVal)
    history[blockName].push({ elem, elamPath, option, inputChangeTo: inputChangeTo, changeTo: changeTo, uniqueFor, uniqueId });
    history[`${blockName}_historyPos`] = historyPos;

    historyPos = history[blockName].length;

    checkUndoRedo(blockName)
}
export const historyUndo = () => {

    if (!history[currentBlockName] || historyPos <= 0) {
        console.log('No more undo available', historyPos);
    } else {
        historyPos--;
        const lastAction = history[currentBlockName][historyPos];
        // console.log('Undo:', lastAction, historyPos);
        changeBlocksSettings(lastAction.option, lastAction.inputChangeTo, lastAction.changeTo, `${lastAction.uniqueId}${lastAction.elem}`, lastAction.elamPath, lastAction.uniqueFor, lastAction.uniqueId, true);
    }
    history[`${currentBlockName}_historyPos`] = historyPos;
}
export const historyRedo = () => {

    if (!history[currentBlockName] || historyPos >= history[currentBlockName].length) {
        // console.log('No more redo available', historyPos, history[currentBlockName].length);
    } else {
        const nextAction = history[currentBlockName][historyPos];
        // console.log('Redo:', nextAction, historyPos);
        changeBlocksSettings(nextAction.option, nextAction.inputChangeTo, nextAction.changeTo, `${nextAction.uniqueId}${nextAction.elem}`, nextAction.elamPath, nextAction.uniqueFor, nextAction.uniqueId, true);
        historyPos++;
    }
    checkUndoRedo(currentBlockName)
    history[`${currentBlockName}_historyPos`] = historyPos;
}
export const saveAsHtml = (fileName) => {
    // Create a Blob with the HTML content
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${fileName}</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="background: lightblue;">
${document.querySelector(".saveThisEmail").innerHTML}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".html"; // Name of the file to be saved
    // Programmatically click the link to trigger the download
    link.click();
    // Clean up the URL object
    URL.revokeObjectURL(link.href);

}
export function calculateHtmlSizeInKB() {
    // Select the div element
    const div = document.querySelector('.saveThisEmail');

    // Get the HTML content as a string
    const htmlContent = `<!DOCTYPE html>
    <html>
    <head>
    <title>Test Email</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="background: lightblue;">
    ${div.innerHTML}
    </body>
    </html>`;

    // Calculate the size in bytes
    const sizeInBytes = new TextEncoder().encode(htmlContent).length;

    // Convert bytes to kilobytes
    const sizeInKB = sizeInBytes / 1024;

    document.querySelector('#email-size').textContent = `${sizeInKB.toFixed(2)} KB`
    // console.log(`Size of the div content: ${sizeInKB.toFixed(2)} KB`);
}


