# Version v1-4-29-81

**Source Commit:** `5a295e4` (Based on `5a295e47aa4438b250e975158e54ee2809329576` in `ucritair-firmware`)
**Build Date:** 2025-07-02 22:44:46 CDT

## Changes

* 5a295e4 fix typo
* 655c256 timeconstant revert to default
* 3d58068 sensirion cal curve2
* bc4025c sensirion cal curve
* 71a5d0b Revert "fixed the double sensor temp adjustment"
* 5ff7b44 Update README.md
* a086e80 fixed the double sensor temp adjustment
* efb5f22 Modified some ignore settings in various directories
* d0f3f30 1.4.29.81 New save system, new AQ mechanics, new health and lifetime mechanics, new content, new art
* 80d4800 Merge branch 'feature-aq-mode'
* e3bd0aa Merge branch 'main' of github.com:EntropicEngineering/cat_software
* d4a5d2a Fixed price bug
* 083cdc3 Likely last of Mini's fish art is in place
* f72cec6 Merge branch 'mini_assets' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* d9dd273 Did some text tests for long names
* 93af40b Add coelecanth
* ece3767 Deprecated last of legacy care items in prep for reuse elsewhere
* 84d874d Fixed rendering bug with legacy toys
* 630c614 First draft of shop, also another 4square fix
* 2552397 Canonized item IDs to conform to last available web update
* 43bca98 Commit before potentially save-breaking item canonization
* f321c17 Added better check to sparkline init
* 928fac3 Added new fish art and proverbs
* 89d95cd Merge branch 'mini_assets' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* 2475ae6 Integrated new fishing art
* 1ee5bf2 Added death notices
* 0b3b1ff Revised crisis messages to account for dead critter
* 6a075df Fixed Foursquares I-piece spawn issue
* 0074fad QoL improvements to deco
* a4c0eb2 Fixed log timestamp display bug
* e82fc5a Fixed bug that locks in death report
* 0ca6770 Reverted death to be lifetime-based
* 8a36c29 Very broken commit
* 8810d25 Add skipjack tuna
* 07c3de1 Add yellowtail sprite
* 9370f34 Add ruby trout
* 2b091a4 Add gindara for real
* 43b9714 Dashboard now loads last log before AQ init
* 64dac05 Merge remote-tracking branch 'origin/feature-aq-mode' into mini_assets
* e7e7a79 Add gindara sprite
* f45b2f4 Misc. QoL tweaks to minigames
* 629c051 Added a popup banner to guide users in the item grid
* 7aafad1 Fixed DASHBOARD menu item bug
* d897344 Made some cuts to fix OOM, patched up BLE
* 97e956f Merge branch 'mini_assets' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* 7020dd6 Add separate screen sprites
* 19d78aa Disastrous commit -- BROKEN
* e884f33 Cleanup up popup code
* b5fd923 Added reincarnation-by-egg
* 9dca709 Merge branch 'mini_assets' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* 7b9d624 Directory ignore management
* 1d67fd8 Quick hacky fix to shift-drag in mesh2d editor
* 0cf9027 Added item descriptions
* ef40796 Fixed clipboard functions in editor. I should probably contribute this
* ed1728d Moved some stuff from save to persist, a few other updates related to the pet itself
* f3c037b Add unicorn egg placeholder
* d8614c0 Chunk of art integrated
* b6c14ab Commit of art changes before risky mesh editor changes
* b6c17a0 Updates to item GUI
* 236f6a3 BROKEN commit before switch
* 474ddd8 Commit before switch
* b65f872 New Foursquares theme
* 4d0efa0 Merge branch 'mini_assets' into feature-aq-mode
* 7056098 Merge branch 'mini_assets' of github.com:EntropicEngineering/cat_software into mini_assets
* abdeda0 Add fish minigame sprites, release sprites
* fa93efd Merge branch 'feature-aq-mode' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* 97b626e Added lifespan and death, GUI updates
* 139cb31 Fix the wall/floor heights to match previous
* c1d4f58 Add more fish mesh
* ed38a45 Add half of fish meshes
* 3527c91 senseair FAE lied to me - backing out this change
* 2d8eebf Merge branch 'feature-aq-mode' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* bb26ed9 Cleaned up a bit of sparkline timing
* df54770 At a glance, storing state in persist RAM Just Works
* bda17c7 Merge branch 'feature-aq-mode' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* a15b0e6 Commit before attempting to work persist RAM
* 776401a sensor debug
* d4bacfe sensor shutup
* 8f62cef sunrise work
* 40a89df sunrise zero trim
* 3d72cf8 disabled ABC during target cal because senseair says we dont need it, the datasheet was obtuse
* 28958b3 Tested on hardware, janky and doesn't save times but it's what you expect
* b61c59d Added draft of damage reports
* 88f21ff Added pngification of screencap, ignored screencap images
* 6c58c81 Added screen capture support on desktop
* 7d8f80b Merged mini's new art
* dadd698 Commit before switch
* 2cf4122 Merge branch 'feature-aq-mode' of github.com:EntropicEngineering/cat_software into feature-aq-mode
* ceaa1ca Won back some FPS at the cost of higher complexity
* 7616e08 better message and clenaup
* 0a05584 supported the zero cal command
* ed5f186 cleaned up co2 workflow more, added zero n2 cal
* 7e9ffae oops- fixed order
* 587bb61 print both filtered and pressure compensated value
* 460be11 added debug prints on ABC
* 91a40cd gave the hal the sensor define - oops
* c06270c first draft of new sunrise driver
* a5dd44e Commit and push because I'm going crazy
* 583b0d0 Update README.md
* 8d12041 Update README.md
* 3edb9f1 Update README.md
* cbe205a working- now with better filename
* 267638c more perms issues
* 4d050b2 fix user perms on docker / CI
* 7883b4b also the upload artifact
* e67f97e  updated version
* 16a962e first attempt at github workflow
* e34d785 Update README.md
* 16d2ae4 Update README.md
* 1727d20 Update README.md
* 4c24403 Update README.md
* d05c0a7 fixed typo
* 27a6211 added dockerfile
* abc44e9 fixed build instructions
* fe5055d updated build instructions
* 4779f99 added docker compose
* 109eefa Update cat_common.c
* 6a230e9 More item reform
* ce35a59 Turned coins into an item
* 785167a New item selection gui
* 64b9207 0.4.29.81 Added new save system, overhauled some bookkeeping, added lots to AQ dashboard
* bc83719 Fixed some item state issues
* 16c9919 Merge branch 'feature-aq-mode'
* 7246756 Preparing to merge
* 05b20c8 New sparkline code completes first draft of all major dashboard features
* f4e8ef0 Bit of emergency cleanup
* ee4f796 First draft of new log viewer
* 830bbcd First draft of calendar hooked up to graph
* 91a9550 Canonized IDs to pre-mess-up
* de5cc0e Merged save rework and inventory rework
* 1384370 Resolved itemgen conflict
* 320fca1 Fixed relationship between save config flags and temp unit settings
* 29c81b5 First draft of new save system
* 351194d Emergency changes to item IDs before switch
* 86ee269 Commit before switch
* 17df415 Commit before switch
* 850a14d Modified flash script
* dcbe42b Tried to reduce messing with save during runtime
* 7f44f55 Fixed position loading bug
* a1a8b24 Fixed save init bug
* 4298156 More robust checking for missing vs. corrupt sector
* 8e4963e New extensible save system
* be290b5 Trying to reconcile old and new bag format in saving and loading
* 5e786fd Fixed issue with new save flag code
* 1a52e43 Corrected a bit of logic with the save and load flags
* f515f8a First draft of new save structure, not integrated yet
* 44605c8 Nuked item lists
* bb8b7fd Added item reformer in editor
* ac09220 Add more fish mesh
* e2e9ee0 Add half of fish meshes
* 95a8342 Cut out in-progress sparklines
* 378153c Added sliding reticle
* fad40ca Got a bit more of the daily graph working, good lord
* bb7d7dc Merge branch 'main' into feature-aq-mode
* 05573dd 0.3.29.81 fixed item list flags bug and added function for manually resetting menu state
* acc73c4 Commit before switch
* 13fa727 First rework
* 9861438 Merge main for new rendering features
* f9c3526 Commit before switch
* 8b009b5 0.3.28.81 New themes
* b4f4366 Merge branch 'new-themes'
* 9609f93 New themes
* 81489ce Inonsequential one-liner
* 3107d00 0.3.27.81 fixed minor text rendering bug in AQ dashboard
* d79c622 Removed test code
* bf5090b Fixed minor text bug
* c8fceb5 Deleted sound effects
* e07d104 0.3.26.81 Cleaned up foursquare score display
* 6d39460 Merge branch 'feature-foursquares'
* 781a362 Removed score print
* 2ed4433 0.3.25.81 Added rewards screen to feeding minigame
* 28dc41b Updated reward screen colours
* 6bd765f 0.3.24.81 first draft of sparklines
* 7743182 Merge branch 'feature-aq-mode'
* e525cec Changed sparkline update period to 24h
* e4ee913 Recolour, better update logic
* 2e29f00 Moving averages in persist ram, ring buffer holds all scores
* 58bc83c Added first draft of weekly sparkline
* 39b28ea 0.3.23.81 Added first draft of dashboard
* af424e6 Merge branch 'feature-aq-mode'
* 343f35d Hooked dashboard up to menu
* dae8237 New look for 3 main pages
* 7e835ec Restructured and temporarily iced the graph
* 112ae41 Can display real data, but this is rough
* 3635983 Added proper clouds
* 0a38226 Cant focus on meaningless stuff
* fc2f6bf Added basic stuff for markers
* dec8257 More colours and fixed scaling
* e6cda10 Adding clipping, scrolling, and zooming to graph
* 49f6220 Commit before switch
* 033a6f8 First crack at dedicated AQ monitor menu
* 31bba11 Added rewards page

---
*Based on ucritair-firmware commit: 5a295e47aa4438b250e975158e54ee2809329576

---


# Version v0-2-23-81

**Source Commit:** `261aa58` (Based on `261aa58e3b33d7f73d39d8a8016c27285c35f5f5` in `ucritair-firmware`)
**Build Date:** 2025-06-02 09:01:17 CDT

## Changes

* 261aa58 0.2.23.81 Emergency deslimification, turnkey laser
* 48170cf Turnkey comes with laser
* cb7dbd6 Emergency deslimification
* afdf0fe Added game-over screen with score
* 489bb17 0.2.23.80 First draft of new study mechanic, disabled sound due to reappearing issue
* 656262c Disabled sound due to reappearing crash
* fb324d4 Cleaned nonsense out of the fish data
* a3b5fe5 Bit of rebalancing and UI improvement
* 8d4dbb4 Better summary gui
* 74f0783 Added quit popup to fishing
* 42aaf7c Un-screwed the fish mesh editor, dramatically reduced space used by fish meshes
* 9184302 Starting some space-saving modifications
* 4029fb9 Added rewards
* 97a16dd Added difficulty levels
* 81e316e Another long day making everything more complicated so that one tiny detail becomes simpler
* cef93ed Added deleting to the fish editor. The logic is even nastier
* 0d85ee2 Good god the logic for this needs to be cleaned up
* a34bc1b Bit of rebalancing and new fish behaviour
* f97dc89 Properly ordered catching after biting
* 3aec026 Tuned the rises and falls
* 9e7cde2 Added sway
* 0126292 Fish editor
* 9eb63de Basic catching
* fa48e35 Added casting stage
* 9a4f2f2 Merged rendering changes from main seemingly with no disasters
* e87b757 Commit before switch
* f35a4d3 First draft of fish behaviour

---
*Based on ucritair-firmware commit: 261aa58e3b33d7f73d39d8a8016c27285c35f5f5

---


# Version v0-1-23-80

**Source Commit:** `2009f02` (Based on `2009f02b92025f61055017a7316f44315cdeb21b` in `ucritair-firmware`)
**Build Date:** 2025-05-26 00:31:00 CDT

## Changes

* 2009f02 0.1.23.80 I promise the rendering is actually fixed this time
* 237b1ca Merge branch 'rework-sprite-drawing'
* dd20d83 Really fixed it this time
* 2ccc4cc 0.1.23.79 merged drawing bug fix
* cfa4a76 Merge branch 'rework-sprite-drawing'
* be459f5 Fixed rendering bug at FB segment boundary
* 4ad6017 0.1.22.79 reset desktop framebuffer segments to 2
* a60df83 0.1.22.78 won back a few FPS with cleaner spriting
* 42d8e20 Eventually won back a few FPS

---
*Based on ucritair-firmware commit: 2009f02b92025f61055017a7316f44315cdeb21b

---


# Version v0-1-21-78

**Source Commit:** `4583361` (Based on `4583361f25cfa4a3cad2cd5951c44d34e52401e8` in `ucritair-firmware`)
**Build Date:** 2025-05-22 21:19:54 CDT

## Changes

* 4583361 0.1.21.78 major code restructure of feeding mechanic, rendering and collision fixes
* 639cba7 Merge branch 'feature-feed-game'
* c81cac2 Fixed one more little rendering bug
* 49b4029 Fixed some minor bugs with rendering and collision
* d561aaf Minor tweaks
* 3578253 Huge overhaul of code structure for feeding mechanic

---
*Based on ucritair-firmware commit: 4583361f25cfa4a3cad2cd5951c44d34e52401e8

---


# Version v0-1-20-78

**Source Commit:** `dbec6c9` (Based on `dbec6c9a182d0cc575fb1e573d027e23021dc8fa` in `ucritair-firmware`)
**Build Date:** 2025-05-21 13:10:25 CDT

## Changes

* dbec6c9 0.1.20.78 patches to item prices and feeding mechanic UI
* fbb2719 Merge branch 'feature-feed-game'
* 092965d Fixed summary wraparound bug
* 6733223 Fixed a select grid bug
* 756cfd7 Fixed scroll range bug
* 74468fb Fixed zero-price items
* 1c60ee0 Added inspector notes
* 846c339 Bit of sprite cleanup

---
*Based on ucritair-firmware commit: dbec6c9a182d0cc575fb1e573d027e23021dc8fa

---


# Version v0-1-19-78

**Source Commit:** `df460e7` (Based on `df460e7631a40553cd45dd5bcecfeca9b63351c9` in `ucritair-firmware`)
**Build Date:** 2025-05-19 13:35:51 CDT

## Changes

* df460e7 0.1.19.78 first draft of feeding mechanic -- more to come soon
* 6945766 First draft ready
* 0a18120 Merge branch 'main' into feature-feed-game
* a990637 Commit before switch and art pull
* eca944b Add many trays
* 15e545a Add munch minigame sprites
* e156ee0 Collision update
* c3cb95a Collision update
* 2b11f63 Scoring update
* 9c73d77 Collision update
* 9e1dea1 Some graphical updates
* 433c58b Fixed inspector range bug
* ea431fd Beginning of performance summery
* 7ccbbc0 Added feedback art
* 1b0eed4 A inter-item spacing stuff based on counterclockwise ordering
* a034993 Added some space-based metrics
* dced0c8 Merge branch 'main' into feature-feed-game
* aa5f29c Commit before potentially disastrous merge
* 32c2778 Commit before switch
* 9d279fb Working out what text to use for item inspector
* 647efec Made the logic I pushed last time not suck
* 8313b09 Added logic to separate scrolling touches from selecting touches
* 5744391 Cleaned up some of the selection grid logic
* 4b68ef4 Added touch scroll to feeding and imported new art as test
* 5591294 New items
* 46980bf Cleaned up some art but also destroyed the universe by accident
* ccf4dee Nuked manual to save space
* f04c29b Cleaned up some of the menu spawn logic
* c899e18 Stopped empty meal from having effect
* 3bc96d2 Whoops, added background back
* cdbbafe Food now consumable in feed minigame
* 0f49e48 New rendering features, new scoring, editor changes
* a5f1f22 Fixed big bug with nested asset data in editor
* b2f1f79 Better spawn rules

---
*Based on ucritair-firmware commit: df460e7631a40553cd45dd5bcecfeca9b63351c9

---


# Version v0-0-19-78

**Source Commit:** `3c2a9de` (Based on `3c2a9de1a35b798bef1a5773f983be049dee56c3` in `ucritair-firmware`)
**Build Date:** 2025-05-16 20:26:03 CDT

## Changes

* 3c2a9de Add minigame munch unicorn sprites
* 20d8df3 0.0.19.78 added new protected-off eink screen
* 58acb00 Added new e-ink protected off art and repositioned text
* 078782d Add alt protected screen (no text)
* 4a9801a Fix protected eink screen to be more obvious
* b8b76cc Change protected.png to binary colors
* 469a9a6 Add new protected off screen art
* 78239a0 0.0.18.78 added pouncing to laser pointer mechanic
* ca5379e Merge branch 'feature-laser-pointer'
* 84408f4 Removed gizmos
* 7d77428 First decent progress at incorporating pounce anim
* 082176a Another context switch commit
* 14f5a22 Emergency commit before task switch
* 9a08196 Commit progress before task switch

---
*Based on ucritair-firmware commit: 3c2a9de1a35b798bef1a5773f983be049dee56c3

---


# Version v0-0-17-78

**Source Commit:** `2f10e21` (Based on `2f10e217dc685cceecded83490a673c8ceeb15f9` in `ucritair-firmware`)
**Build Date:** 2025-05-03 20:54:37 CDT

## Changes

* 2f10e21 0.0.17.78 fixed menu index wrap bug
* 7a1a814 Merge branch 'fix-menu-inputs'
* 7234acd Okay really fixed the menu wraparound thing this time. I think

---
*Based on ucritair-firmware commit: 2f10e217dc685cceecded83490a673c8ceeb15f9

---


# Version v0-0-16-78

**Source Commit:** `1718527` (Based on `1718527e929b80b6db1faa104a82d5268d947c6d` in `ucritair-firmware`)
**Build Date:** 2025-05-03 20:25:10 CDT

## Changes

* 1718527 0.0.16.78 minor update to conditions for first eink refresh
* ec4daab Merge branch 'tweak-eink-refresh-on-wake'
* 6bf06f0 Updated e-ink first update conditions
* b3dd7ba Resolved merge conflict by taking new eink update behaviour
* 77ce189 0.0.16.77 first e-ink update happens after first co2 read is available
* dda0d6e Merge branch 'tweak-eink-refresh-on-wake'
* 5bf3d82 Hack that will do for now: device now forces eink update as soon as a valid co2 reading is available
* 95bacd6 Commit partial progress before task switch

---
*Based on ucritair-firmware commit: 1718527e929b80b6db1faa104a82d5268d947c6d

---


# Version v0-0-15-77

**Source Commit:** `1e5055c` (Based on `1e5055cb1e1a54e314bc67c0893563f8cc24ace2` in `ucritair-firmware`)
**Build Date:** 2025-04-30 14:22:34 CDT

## Changes

* 1e5055c revert so we do not update the eink when we come back from sleep - we likely do not have sensor data yet. This is a hack to fix an issue. In the future we shoudl sense if we came back from power off or sleep and update appropriately

---
*Based on ucritair-firmware commit: 1e5055cb1e1a54e314bc67c0893563f8cc24ace2

---


# Version v0-0-15-77

**Source Commit:** `260d4b5` (Based on `260d4b5cd503b34e42bd0a75e6e138535659b24e` in `ucritair-firmware`)
**Build Date:** 2025-04-29 11:32:16 CDT

## Changes

* 260d4b5 fixed the name of the PN10 on graph screen

---
*Based on ucritair-firmware commit: 260d4b5cd503b34e42bd0a75e6e138535659b24e

---


# Changelog

All previous version details are recorded below, newest first.

# Version v0-0-15-77

**Source Commit:** `79bb6b3` (Based on `79bb6b345b3ee79ea8aa27cfb4dc328352ce7bf9` in `ucritair-firmware`)
**Build Date:** 2025-04-29 10:53:54 CDT

## Changes

* 79bb6b3 0.0.15.77 Emergency patch to kick the menu cursor index bug

---
*Based on ucritair-firmware commit: 79bb6b345b3ee79ea8aa27cfb4dc328352ce7bf9
