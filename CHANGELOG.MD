# Version v1-7-46-82

**Source Commit:** `870c38f` (Based on `870c38f274264a39df9e36e36d9429cceca94b11` in `ucritair-firmware`)
**Build Date:** 2025-10-22 20:26:28 CDT

## Changes

* 870c38f 1.7.46.82 reverted config to fix e-ink, hid garbage sparkline data
* be8f808 Stopped sparklines from showing garbage on fresh persist
* b06dd49 Reverted conf to undo eink bug by brute force
* 2b75db2 Added developer menu item for writing low-power eink notice
* 9f7134f 1.7.45.82 ui fix
* c4fdad2 Fixed eink bug at the cost of space, 1.7.44.82
* 27bb9cb Haphazard conflict fix
* 3ee66a2 Attempting to fix eink bug
* 9147e10 Trying to recreate orientation freeze
* 41be634 Added debug number
* c4dc64b Tweaked sparkline logic
* 0b39498 Fixed framebuffer noise on init
* 0e07b1a Fixed checkboxes and tickers, as well as a minor dashboard gui bug
* 72aa1ac New ticker logic, got rid of cumbersome persist interface
* 50c6eed Fixed ketsuban
* e222148 Successful changes to itemgen
* 193384a Backup commit before changing itemgen
* 191017f Recipe type
* 54aa256 Flag type
* 87be8b8 Chair recipe
* 9514049 Overworld nodes
* 2045c18 Canarification
* fc0052f Crisis timing
* 713d0d4 Add more requested ingredients
* 0a343b9 Locked out auto-orientation
* 386dc40 Cutting out flip paths
* 5c1ebfb Added recipe list
* 1fe264a Add overworld trees
* bc2a198 Add overworld resources
* 0bceff4 Springting!
* 2d7c655 Trying
* 9909e70 WIP
* ec18c86 Simpler dashboard gate
* 78b0938 WIP
* 2e7332a Add rest of canary sprites
* df07843 Barrier press/hold fix
* 36c6979 Crawling towards an eink fix
* 344598a Attempted fix to eink update failures
* 422defc Fix pet path naming
* 31af42a E-ink WIP
* 4ee584c Added barrier to study
* 7bc2d4f Tiny fix to UX
* c5f3518 New shop UX
* 4190b9f Gate nonsense
* c7b76d3 Cleaned up gizmos
* d7c5fd5 New colours
* 0de64ab Commit before switch
* 7e3e8f9 Changed fishing to use FSM
* d0e61da Added resource nodes that drop crafting mats
* 96f1e28 Feeding UX
* 18dcaea Insane tearing up and replacement of state machine guts
* b49e9dd SEVERE WIP
* 170a1f2 Minor tweak to last change
* 7f7c6c5 Render callback can only change once the tick that changes it has completed
* 2576768 New graphics for feeding work
* 76535a7 Barrier logic
* cc92fde More timing cleanup
* c78d03c Timing fixes
* f5a7e7e New graphics and inputs for feeding
* e35eeef Deleted old code to fix merge conflicts
* 44921de 1.6.44.82 overhaul of project to use much less space
* a262cca Commit before merge
* c3098ab Fixed logging via the scariest means possible
* 504172e Working on some art
* 71bf181 Trying to investigate timegm issue
* d58951b FSM refactoring
* 8441a5f Simplified some room logic
* c4493d9 Fixed some mesh2d storage logic
* 36a7d34 Equivalent exchange
* 87a6570 Crafting accessed from station
* 5424de8 Simpler logic, better inputs
* f6932b7 First pass at crafting
* 9c61e01 Added support for shapeless and repositionable recipes
* c6b34fa Added some stubs
* 5b2a3a5 Added more pages and utilities to docs
* f0604cb More ignore
* a54fdc4 More gitignore
* 3acd308 Another attempt at fixing gitignore
* 0384853 Ignored __pycache__
* 12c39dd [UNTESTED] Pretty sure that's all the floats removed from variadics
* 587ad2d more disable shell omfgsdfsd
* 5b7beac more disable shell omfg
* a9ec6a0 disabled more shell
* fae3158 Killed sqrt and round
* 44a259e Cleaned up some more trig
* 8829c8d Merge branch 'space-optimization' of github.com:EntropicEngineering/cat_software into space-optimization
* 0c9e49f Removed some more doubles, mostly in printing
* 81e90e2 get rid of wlan.c and aggresively turn things off in the shell, observed a one time HCI crash - not able to duplicate
* be7b014 Replaced some double-precision fp code with single-precision

---
*Based on ucritair-firmware commit: 870c38f274264a39df9e36e36d9429cceca94b11

---


# Version v1-6-43-82

**Source Commit:** `784e1dd` (Based on `784e1dd848c1a0130be21dc1ba888dc0c1125b58` in `ucritair-firmware`)
**Build Date:** 2025-08-23 16:56:48 CDT

## Changes

* 784e1dd Merge branch 'main' of github.com:EntropicEngineering/cat_software
* d1069f1 1.6.43.82 merged in space-saving overworld changes
* df78543 First pass at overworld space saving
* 8affa93 First pass at space saving in overworld
* 16a5519 Reworked to fit into smaller grid
* 3c7fbe5 Finished rewrite of prop editor
* 4bf9d8e Revamped dialogue GUI
* f0fcaa0 New dialogue [WARNING] buggy layouts
* ac771ee Node-based dialogue editor works
* 17fd9b3 Few safety checks added to dialogue
* 5c17ff7 1.6.42.82 [WARNING] merged in old setting patch. may have bugs
* 6c48954 Docs changes
* 181d255 WIP -- dialogue profiles
* 9765b54 Adjusted settings for auto vs. manual screen orientation

---
*Based on ucritair-firmware commit: 784e1dd848c1a0130be21dc1ba888dc0c1125b58

---


# Version v1-6-41-82

**Source Commit:** `32e8cfc` (Based on `32e8cfc4589654f2dc77fc9d7c05bd4fed612385` in `ucritair-firmware`)
**Build Date:** 2025-08-17 14:58:17 CDT

## Changes

* 32e8cfc force shutdown if we are in critically low battery

---
*Based on ucritair-firmware commit: 32e8cfc4589654f2dc77fc9d7c05bd4fed612385

---


# Version v1-6-41-82

**Source Commit:** `037fe93` (Based on `037fe93d1cc4b257ed9108c23c45be45ccc7c912` in `ucritair-firmware`)
**Build Date:** 2025-08-15 21:46:43 CDT

## Changes

* 037fe93 better temp offsets
* 1baaec6 1.6.41.82 Fixes to ACH mode
* 30d6d04 Merge branch 'feature-aq-mode'
* 13afe00 Fixed some control flow issues with ach
* cc925ad Spaghetti City: tied ach calculator into graph
* 099a18f ACH date selection seems to work
* b06958e Very quickly cobbled together ACH date selector
* 201e272 Bit of data hygiene work on e/ACH
* 9a16f36 Versioning
* b830673 Winning back some FPS by drawing coloured primitive for sky instead of gradient sprite
* b72a801 One more tweak
* 9a57600 Tweaking calendar UX
* d3451ed Fixed some typos in the ACH calc
* 2c605ad More tweaks to calendar, changes to sparkline API
* 14448cf Richer calendar UX that work with M\'s changes
* 39d783f that wasnt it - revert
* 74d0b63 temp and rh are bathtub curves - fix the scoring for sparklines
* c9a5892 undid the temp thing cause it didnt fix it and made the cal nav work better
* d056ccf calender and fixed temp calc
* 7ef26d4 added sakamoto's to calendar
* db83048 1.6.40.81 fenced in the overworld
* 720f727 1.6.39.81 Merged in first overworld update
* 2a9657a 1.5.39.81 Update to AQ features + a recolour
* 3ded7bb Merge branch 'feature-aq-mode'
* e5ea749 Fixed ugly roads in overworld
* 5629656 Bit of cleanup
* 3e88a11 Cumbersome road changes
* 2e4a369 Fixed some collision and sorting stuff, added clipping
* 0cd136a Won back some space
* 5cb7e8e Minor patch to LED brightness code
* f5e1825 Minor patch to LCD brightness code
* 754ba6d Recolour tested on embedded, minor fix to ach
* c584d06 Recolour attempt 1
* 295210f Added velocity scrolling back to e/ACH calc
* 6deb888 Peak and trough finding for ACH is more intelligent but still error tolerant
* eaa3ab1 More fleshed out overworld, it's too big!
* 6e92785 Stricter adherence to grid
* 7f4aac4 More movement
* 62064f9 More accurate movement
* 48bd129 Bunch of prop editor stuff, new walking system
* b2a69a1 Merge branch 'mini_assets' into feature-world
* a2c20cd ACH page draft 1
* 6b0684b Add some complete overworld sprites
* ec33596 Delta arrows in details page
* b21e522 Minor palette picker changes
* 40f01b9 Recolour finally decent
* 75739ab New colours
* acf5a40 New colours
* b87163f Embedded test, bit of cleanup
* 5a0fbda Hacked together some sprite sorting
* 7ecb1ea Better blocking 2
* d5c23d1 Better blocking collision
* 50beda9 Better ACH UX
* 21e1121 ACH rough draft
* 5e039bd Removed need to load cells for ach
* 7656532 Just tacked on ACH across the whole graph for testing
* e421eed Moved calendar graph into module
* 6ca231b Redid sparklines
* a80cda3 Added abstract graph drawer
* db7e2ca Stashing changes before switching
* 654a0b0 Merge branch 'mini_assets' into feature-world
* dedaf1e Correction
* 2a5b117 Added back interaction logic
* aa5549c Triggers and blockers in
* 17de5bf Scene rendering
* 1a44fa4 Added scene generation
* 273741c Scene editor now directly modifies scene objects and first pass at asset gen
* 6de7f74 Fixed cursor io
* 091fa58 Better click and drag
* 3465f99 Progress
* 9708cba Visuals
* 5ea755a Click and drag
* 133deaa Beginning of scene editor
* f2b575d Moved asset manager to module
* a56eba7 Patched up theme editor
* a6dab99 Rewrote canvas to have PIL backend
* a118ff1 Moved some code into separate modules
* 60bec0f Added back delete, duplicate, and sort
* edb8081 New editor stuff actually just works
* a1bcc6d Rewrote document renderer to match new type system
* f31826d Add temporary overworld sprites
* 6500ae2 New type code
* 8d547a1 First draft of new typing stuff for editor, non-integrated
* 8b097d0 Disabled NOX/VOC crises
* 86ce4b8 Added more specific AQ notices
* b08cecc Merge branch 'main' of github.com:EntropicEngineering/cat_software
* aa02fa6 Misc. changes
* 2cfd4e8 New visual format for dialogue
* f9ffe43 Added instantaneous knockback
* 25c538c Swipe collision logic
* aa96adc More enemy logic tweaks
* 5cf62aa Hitstop frames and whatnot
* ccd3a09 Hooked up some of the art, modified interactable collision
* d1c056b Merge branch 'main' into feature-world
* 5036fc0 Merge branch 'mini_assets'
* cb10495 Enemies
* b3246c0 Add overworld npcs and unicorn
* 1641b1c Misc. adjustments to dialogue
* e436941 Fixes and simplifications to dialogue edges
* f86f900 Bidirectional edge change
* f4748a0 Dialogue system draft 1
* 653440a trimmed the rtc
* 75b2e7b Proper interactables, draft 1
* 787a34f Merge branch 'main' of github.com:EntropicEngineering/cat_software
* abb884f 1.4.39.81 Added new low-power eink visuals
* 7ada502 Interactables list
* a4e0637 Completely unrelated low-power eink update
* 5b1c6c9 remove typo
* 5d80637 remove voltage patching
* d3f9c1a UICR patch to enable NFC pins to be used a GPIOs - how the heck did we ever work without this
* 9fef7ca Merge branch 'feature-world'
* 43774fb Merge branch 'main' of github.com:EntropicEngineering/cat_software
* b2ccceb 1.4.38.81 cleaned up room code
* 544c29e Botched merge
* 530bb0d First draft seems to work on embedded
* 8f4ad35 First draft of new deco
* a21d075 fix the is faulted logic  for SEN55
* af60842 Cleaned up comments
* 57742e0 Stylistic spacing
* 86961cc Simplified sparkline text
* 2b46903 Merge branch 'main' of github.com:EntropicEngineering/cat_software
* 2e83cfd Cleaned up battery pct function on embedded
* ee00a26 Updated fishing button
* 90495c1 Merge pull request #2 from EntropicEngineering/m_sensor_patches
* 748a311 Merge branch 'main' into m_sensor_patches
* 5a32d4c 1.4.37.81 Battery alerts on E-ink
* 7b7428b Added battery alert flag to persist, added eink art for battery alert
* 8934985 Merge branch 'mini_assets'
* ac9f986 Merge branch 'feature-aq-mode'
* 196a730 Removed a declaration after case label
* db71ad9 Add eink low battery icons
* 49cc332 Add fishing icon
* e405f21 declare static int g_consecutive_read_failures
* bf99733 Merge branch 'main' into m_sensor_patches
* 5410ce4 Merge branch 'main' of github.com:EntropicEngineering/cat_software
* a1cc9ed 1.4.36.81 New calendar controls
* c4e8ecb Took out access to the debug gizmos in the feeding game, because why not
* dfdc4f0 New UX for calendar
* 4cf0df5 Forward declare
* d4e0143 Typo
* b9aace2 M's sensor patches
* f8610ef Updated docs
* 36c023d Merge pull request #1 from EntropicEngineering/battery
* 0d43b75 Docs update
* cdb0746 Docs update
* ad16cea Updated docs
* 272f4c5 Incorporated reference to wet bulb temp
* 944c0cf Incorporated IMU debouncing
* c947dc2 Cleaned up IMU behaviour
* b814b8f initial battery curve adding
* d3dcfb6 First attempt at buffered screen flipping
* 730dab0 Merge branch 'feature-aq-mode'
* 3906f63 One more tweak
* 7d2d2c7 Revised wet bulb temp
* ba7dae8 Updated docs
* cee45da Revised internal page tree structure, auto-generated indices
* 4a37f3f Added option to pause critter care
* 357181b Added option to pause critter care
* 0b8c191 1.4.33.81 Switched to WBGT mode for temp/rh crises, added alarm graphics
* a6087af Updated WBGT calculation with a rough approximation of black globe temp
* 67dff9f Moved wet bulb temp calcs to AQ files
* 2e10603 Merge branch 'main' into feature-aq-mode
* cf089c6 Added more indicators to window, added wet bulb conditions for temp/rh crisis, fixed summary temp units
* 7ba617a Added crisis alarm to window
* 20e4a90 General gizmo drawing
* e283544 First draft of world

---
*Based on ucritair-firmware commit: 037fe93d1cc4b257ed9108c23c45be45ccc7c912

---


# Version v1-4-32-81

**Source Commit:** `17e9ede` (Based on `17e9edeee6e6f05fa4d83c3eaba2b5112d969b93` in `ucritair-firmware`)
**Build Date:** 2025-07-06 20:38:28 CDT

## Changes

* 17e9ede Eliminated declaration after case label
* 7e73dbe Attempted to reduce alarm fatigue with crises
* 4e6a071 Reduced frequency with which crises occur and notices are shown
* 9f7f8a8 Versioning
* 6cf3f1d Restored old splash
* 37cd0c6 Added more timetravel-proofing
* 64d2302 Cleanup
* 549dd50 Merge branch 'main' into fix-rtc-reset
* 184bd15 Merge branch 'main' of github.com:EntropicEngineering/cat_software
* d9cb830 Merged new item grid controls
* a34fe1b Patched out some of the input issues
* e8ccc99 Intermediate progress to be used in input updaet
* 95de5ad Working on getting RTC to restart from log
* 2c1b3a8 Uploaded pages site
* 5ed7998 Turned docs folder into submodule
* 74c31b1 Commit progress before switching docs to submodules
* 3111928 Switched from MD+Pandoc to HTML+SSG
* b376b1c Added table formatting and thumbnails
* c48b24a Merge branch 'main' into util-docu-gen
* 63694cd First crack at generating documentation markdown from asset manifests

---
*Based on ucritair-firmware commit: 17e9edeee6e6f05fa4d83c3eaba2b5112d969b93

---


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
