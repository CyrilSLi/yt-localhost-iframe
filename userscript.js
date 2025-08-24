// ==UserScript==
// @name        YouTube Localhost Ad Blocker
// @namespace   Violentmonkey Scripts
// @match       *://www.youtube.com/*
// @version     1.0
// @author      CyrilSLi
// @description Remove YouTube ads by using a localhost embed player
// @license     MIT
// ==/UserScript==

const frameId = "userscriptLocalhostFrame";
const embedURL = "https://www.youtube-nocookie.com/embed/%v?playlist=%p&autoplay=1&start=%start&enablejsapi=1";
const frameSrc = "http://localhost:8001?url=";
const runFreq = 200;

let resumeTime = 0, datasetVideoId;

window.addEventListener("message", (ev) => {
    if (!ev.data) {
        return;
    }
    const data = (typeof ev.data === 'string' || ev.data instanceof String) ? JSON.parse(ev.data) : ev.data;
    if (data.type === "currentTime") {
        resumeTime = Math.floor(data.content);
    }
});

function run(container) {
    const visible = container.offsetHeight > 0;
    let frame;

    [...container.children].forEach((el) => {
        if (el.className === frameId) {
            frame = el;
        } else {
            el.style.visibility = "hidden";
        }
    });
    if (!visible) {
        if (frame) {
            datasetVideoId = frame.dataset.videoId;
            frame.remove();
        }
        return;
    }

    function updateSrc() {
        frame.src = frameSrc + encodeURIComponent(embedURL
            .replace("%v", frame.dataset.videoId)
            .replace("%p", frame.dataset.videoId)
            .replace("%start", resumeTime)
        );
    }
    if (!frame) {
        frame = document.createElement("iframe");
        container.appendChild(frame);
        frame.className = frameId;
        frame.style.position = "absolute";
        frame.style.inset = "0";
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.allow = "autoplay; fullscreen";
        frame.allowFullscreen = true;
        if (datasetVideoId) {
            frame.dataset.videoId = datasetVideoId;
            updateSrc();
        }
    }

    if (!container.classList.contains("ytdMiniplayerPlayerContainerHost")) {
        videoId = new URLSearchParams(window.location.search).get("v");
        if (videoId !== frame.dataset.videoId) {
            resumeTime = 0; // Switching videos, reset resume time
            frame.dataset.videoId = videoId;
            updateSrc();
        }
    }
}

var lastRan = 0;
const observer = new MutationObserver(() => {
    document.getElementsByClassName("html5-main-video")[0]?.pause();
    if (Date.now() - lastRan < runFreq) {
        return;
    }
    lastRan = Date.now();
    ["#player-container-inner", "#full-bleed-container", ".ytdMiniplayerPlayerContainerHost"].forEach((id) => {
        const container = document.querySelector(id);
        if (container) {
            run(container);
        }
    });
});

if (!window.location.pathname.includes("embed")) {
    observer.observe(document.body, {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
    });
}