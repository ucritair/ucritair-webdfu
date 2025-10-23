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
