// @ts-check

/** 
 * @param {Window} context
 * @returns {Window[]}
 */
function getFramePath(context) {
    if(!context.frameElement) return []; 
    return [...getFramePath(context.parent), context];
}

/** @param {Window} context  */
function getFrameIndex(context) {
    return Array.from(context.parent.frames).indexOf(context);
}
/** @param {HTMLIFrameElement} iframe  */
function getFrameDomPosition(iframe) {
    return [...iframe.ownerDocument.querySelectorAll("iframe")].indexOf(iframe);
}

/**
 * @param {MouseEvent} ev 
 */
const logAction = (ev) => {
    const framePath = getFramePath(window);
    const frameElementsPath = framePath.map(win => /** @type {HTMLIFrameElement} */ (win.frameElement)).filter(el => !!el);
    if(!frameElementsPath.every(el => (el.tagName === "IFRAME"))) console.error("Not all elements are iframes", frameElementsPath);
     
    console.log(ev.type, ev.target);
    console.log("framePath", framePath);
    console.log("frameElementsPath", frameElementsPath);
    console.log("frameIndex", framePath.map(getFrameIndex));
    console.log("frameDomPosition", frameElementsPath.map(getFrameDomPosition));
    console.log("")
}

window.addEventListener("click", logAction);