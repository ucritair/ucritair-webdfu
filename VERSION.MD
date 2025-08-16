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
