# Version v1-9-48-84

**Source Commit:** `b121124` (Based on `b121124a56651c831105bfbca1c0e33d9e4a6356` in `ucritair-firmware`)
**Build Date:** 2025-12-26 13:06:30 CST

## Changes

* b121124a Add docs submodule
* f70adaae push binary cleanup
* 7c69446e push only the binaries we need up
* c5d8189d also find the binaries properly
* 7058520c recover disk space on the container
* fb983e18 1.9.48.84 incorporated radio and wifi code
* df562ce4 Merge branch 'wifi-development'
* 23de7d1a Build modifications
* 2b572122 Merged in docs deletion
* bd9575ed Tore out docs
* 1d237313 WIP
* 5a1a24af Merge branch 'wifi-development' of github.com:EntropicEngineering/cat_software into wifi-development
* 907d416e Pre-flash commit
* efd816bc added helper meshtastic PSK conversion scripts
* 1b233e53 Cleanup
* 0be89bd6 New build utils
* 63adb05d WIP
* a6f0a480 WIP
* a42ea792 Hex shortnames
* b88865bb Usernames not showing up
* d6d82f78 Merged in radio channel stuff
* a0cc8009 editor changes
* 0b6d4a15 Improved prop editor
* b0cde175 Removed dev skip from stroop
* 66858846 Assets
* 1ec79156 Merge branch 'mini_assets' into wifi-development
* 19575407 Merge branch 'editor-improvements' into wifi-development
* 0ad80644 Debug output
* 856c810f Inverted survey scores
* 87c6de73 Fix to AQ related bytes -- not sure if survey is fixed
* 47815496 More robust sprite previewing
* d6dd631b QR encoder works
* 2eab4220 Removing legacy preview code
* b60ded47 Cleanup
* 28b11b7c Better scoring
* f25c5ecb More stable menu text
* 0e76bc59 Better survey graphics
* b8751b84 Automatic auth in stroop
* 4c5e8736 added channel configuration, nodeinfo, channel index tx,rx
* fbbad72e Survey WIP
* 07fd2220 Survey WIP
* 51020ca3 Add guanaco and theme (devconnect 2/3)
* 73597820 Add more crafting ingredients (devconnect 1/3)
* 0b154ad9 Added timer to stroop
* 7cd32ae9 Amended NRF to RP values again
* 3776b02d Adjusted values sent to RP
* 3d512027 Patch to credits, more sensible combined stroop
* 90b37aa1 Always-awake option, data upload
* 32136f86 Merge branch 'wifi-development' of github.com:EntropicEngineering/cat_software into wifi-development
* 9e7175f3 WIP
* 9c076089 WIPgit add -A
* 6a99430f DM fixes
* 30accfaf More chat GUI
* a7fd1bff More chat graphics
* 2e853eb3 Start of public/private message distinction -- weak polling for node info. Keyboard UX
* 7b0b2b0a Chat MVP
* 58e304d0 Added build flags for radio/wifi, added radio api
* d2fc9cf1 sensor readings
* a048fc04 fixed RNG for packet id issue
* 67fadb45 WIPgit add -A
* 53878cd8 WIPgit add -A
* 3b8dd37c added test text decode callback
* 27b6bf5d Edited out LoRa stuff and popped RP back in
* 419fea71 Commit before taking out LoRa prior to flash
* 3085ec2a WIPgit add -A
* a84e0d80 increased the ring buffer size, added timeout to msht_process(), decreased startup wait, etc
* 5f66a48c Added in auth button
* 1ad9a93a Merge branch 'e2e-comms-wip-nrf' into wifi-development
* 29256040 WIP
* 7daa7ac8 Authenticate with cloud
* c6bcea99 WIPgit add -A
* 48362405 WIPgit add -A
* a5a12987 Merge remote-tracking branch 'origin/meshtastic-development' into wifi-development
* fd558107 Laying groundwork for radio chat
* 4d784c52 this is truly awful but got TX tested working, needs to be cleaned up heavily, and RX added
* edd8fcc5 rebased meshtastic code to wifi-development (via patch) as it already has protobufs
* b6cabba9 Autoconnect
* 0c79c323 Developer-only draft of persistent wifi
* 509e081c Fixed some stupid bugs
* 2f1afb90 There is a weird freeze bug while messing with wifi connection after connecting
* 72f0c72d First working WiFi connection. Minor UX improvements starting
* db722eaa Merged with conflicts
* a223ec4c Fixed a menu bug
* 6c6f6f1b Still working on wifi gui
* 11bde64f More GUI replacement, starting on WIFI gui
* a8bcee87 Undid a debug change to stroop
* 5f35fac2 Legacy GUI taken out of all but the system menu
* a1bb98c6 Slightly simplified menu API
* 09066527 Awkward fixes to embedded arcade menu
* 4b59bea4 Extended menu functionality so it's easier to embed menus
* 0fece2f7 e2e comms with RP
* 687fe25d e2e comms with RP
* 072b1373 Some fixes to stuff broken by cleanup
* 78c471b7 More cleanup
* 2d518591 First steps of somewhat invasive code cleanup as I prepare for one million pounds of protobuf code
* a86a2d11 Sendmessage api
* bcee8a17 Ringbuf chat app spoof
* 1e698e7d Merge remote-tracking branch 'origin/e2e-comms-wip-nrf' into development
* 1eb932f7 Commit before pulling comms work
* 61eb5a26 iWIP
* 6718b9a8 New keyboard
* 08b2130b Better disc drawing code
* 1dd60cfa More type
* 2d1eade9 More updates to type
* 8a22c5a5 Updating tiny text
* 2987a58e Fix wood ingredient to be balanced
* c2be645d Added some images to docs
* 0fbfb7a1 Merge branch 'aq-restyle' into docs-update
* 082dadae Docs content
* 9fb9666c Docs content
* 19671ede Docs content
* 80c1e4a7 Docs content
* bacf0823 More content

---
*Based on ucritair-firmware commit: b121124a56651c831105bfbca1c0e33d9e4a6356
