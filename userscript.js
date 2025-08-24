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

let resumeTime = 0, oldDataset = {};

window.addEventListener("message", (ev) => {
    if (!ev.data) {
        return;
    }
    const data = (typeof ev.data === 'string' || ev.data instanceof String) ? JSON.parse(ev.data) : ev.data;
    if (data.event == "infoDelivery") {
        resumeTime = Math.floor(data?.info?.currentTime || resumeTime);
        const playlist = data?.info?.playlist;
        if (playlist && playlist.length > 0) {
            oldDataset.playlist = playlist.join(",");
            const oldVideoId = oldDataset.videoId;
            oldDataset.videoId = playlist[data?.info?.playlistIndex] || globalFrame.dataset.videoId;
            if (oldVideoId && oldVideoId !== oldDataset.videoId) {
                const params = new URLSearchParams(window.location.search);
                params.set("v", oldDataset.videoId);
                params.set("userscript_modified", "1");
                window.history.pushState({}, "", window.location.pathname + "?" + params.toString());
            }
            const title = document.querySelector("h1.ytd-watch-metadata").children[0];
            if (title) {
                title.textContent = data?.info?.videoData?.title || title.textContent;
            }
            const author = document.querySelector("#text.ytd-channel-name").children[0];
            if (author) {
                author.textContent = data?.info?.videoData?.author || author.textContent;
            }
        }
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
            if (!oldDataset) {
                oldDataset = Object.assign({}, frame.dataset);
            }
            frame.remove();
        }
        return;
    }

    function updateSrc() {
        frame.src = frameSrc + encodeURIComponent(embedURL
            .replace("%v", frame.dataset.videoId)
            .replace("%p", frame.dataset.playlist || frame.dataset.videoId)
            .replace("%start", resumeTime)
        );
    }
    function selectList() {
        [...document.querySelector("#items.playlist-items").children].forEach((el) => {
            try {
                if (new URLSearchParams(el.getElementsByTagName("a")[0].search).get("v") === frame.dataset.videoId) {
                    el.setAttribute("selected", "true");
                } else {
                    el.removeAttribute("selected");
                }
            } catch (e) {
                // Error handling if needed
            }
        });
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
        if (oldDataset.videoId) {
            frame.dataset.videoId = oldDataset.videoId;
            frame.dataset.playlist = oldDataset.playlist || oldDataset.videoId;
            if (oldDataset.userscriptModified === "1") {
                const params = new URLSearchParams(window.location.search);
                if (params.get("list") && params.get("list") === oldDataset.listId) {
                    params.set("v", oldDataset.videoId);
                    window.history.pushState({}, "", window.location.pathname + "?" + params.toString());
                    selectList();
                }
            }
            oldDataset = {};
            updateSrc();
        }
    }

    if (!container.classList.contains("ytdMiniplayerPlayerContainerHost")) {
        const params = new URLSearchParams(window.location.search);
        videoId = params.get("v");
        if (!videoId) {
            return;
        } else if (videoId !== frame.dataset.videoId) {
            if (oldDataset.videoId) {
                if (params.get("userscript_modified") === "1" && params.get("list")) {
                    frame.dataset.videoId = oldDataset.videoId;
                    selectList();
                    return;
                } else {
                    window.location.reload();
                }
            }
            resumeTime = 0; // Switching videos, reset resume time
            frame.dataset.videoId = videoId;
            const playlistEl = document.querySelector("#items.playlist-items");
            if (playlistEl && playlistEl.children.length > 0) {
                const playlistIds = [];
                [...playlistEl.children].forEach((el) => {
                    try {
                        playlistIds.push(new URLSearchParams(el.getElementsByTagName("a")[0].search).get("v"));
                    } catch (e) {
                        // Error handling if needed
                    }
                });
                frame.dataset.playlist = playlistIds.join(",");
            } else {
                frame.dataset.playlist = videoId;
            }
            updateSrc();
        }
    } else {
        if (frame.dataset.playlist !== frame.dataset.videoId) {
            oldDataset.userscriptModified = "1";
            const params = new URLSearchParams(window.location.search);
            oldDataset.listId = params.get("list");
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