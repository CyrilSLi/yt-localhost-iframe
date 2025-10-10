# yt-localhost-iframe

Play YouTube videos ad-free using an iframe embed served from localhost

[Greasy&nbsp;Fork](https://greasyfork.org/en/scripts/547141-youtube-localhost-ad-free-player)&nbsp;&nbsp;&nbsp;[GitHub](https://github.com/CyrilSLi/yt-localhost-iframe)

## Installation

1. Install [script.user.js](https://github.com/CyrilSLi/yt-localhost-iframe/blob/main/script.user.js) with a userscript manager or from Greasy Fork.
2. Serve [index.html](https://github.com/CyrilSLi/yt-localhost-iframe/blob/main/index.html) on `localhost:8823` using a local web server, e.g. run `python -m http.server 8823` in the project directory after cloning the repository.

**Note**: The server must be running whenever you use YouTube with this script enabled.

For Chromium-based browsers, set the flag `local-network-access-check` to Disabled as otherwise the browser will not allow a local iframe inside public sites including YouTube.

## Usage

This script is designed to be minimally invasive, overlaying the localhost iframe on top of the original player.

Use YouTube as normal with the exception of playlists. Switch videos by clicking the playlist icon **inside** the player instead of the YouTube playlist sidebar to avoid reloading the page.

## Known Issues

- Playlists:
  - Not all videos in a playlist may load into the embed player. If this happens, try refreshing the page.
  - The playlist may reset to the first video when entering and exiting miniplayer mode.
    - This issue may be partially mitigated by entering and exiting miniplayer mode on the first video before you start watching the playlist.

- Video Info:
  - The video title may be empty when switching videos with the miniplayer active. Refresh the page to fix.
