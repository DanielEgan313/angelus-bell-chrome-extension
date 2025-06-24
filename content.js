// content.js – injects iframe to play bell sound
console.log("Angelus Bell: injecting iframe");

const angelusIframe = document.createElement("iframe");
angelusIframe.src = chrome.runtime.getURL("bell.html");
angelusIframe.style.display = "none";
document.body.appendChild(angelusIframe);