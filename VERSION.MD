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
