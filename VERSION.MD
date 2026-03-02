# Version v1-10-49-85

**Source Commit:** `71906fb` (Based on `71906fb921ca803d9e006daef25b4334c7f24091` in `ucritair-firmware`)
**Build Date:** 2026-03-02 17:20:17 CST

## Changes

* 71906fb9 Enable persistent BLE address via FICR vendor HCI
* 56452113 Add USB serial time-set command and device init script
* e4c3295e Remove BLE DFU trigger (security fix), use USB serial only
* 5e1bfa7a Add USB serial DFU trigger, simplify flash script
* a68ee1a6 Add unified flash script for BLE-triggered DFU firmware updates
* 0a8b338b Add BLE address printing, serial-aware DFU script, and timing test
* 0181ae11 Make entrypoint.sh executable for docker-compose override
* 19e14a33 Fix Docker entrypoint: use repo's version instead of baked-in image
* 85e98e9b Use --clean in CI builds, fall back to rm -rf when trash unavailable
* 4c27d718 Overhaul CI: add --aq-first, two-build strategy, fix naming
* a5129e75 Fix CI: update catenv.sh reference to environment.sh
* 73f272f7 Silent timer-wake + docs fixes
* 24559ae7 Fix BTHome ordering, config struct, scan response, and script
* 19b70c06 Update BLE service docs with new characteristics and BTHome v2
* f2c1d661 BLE API for web app/HA + RTC boot calibration
* 7c95c4b5 Speed up boot with immediate audio/visual feedback
* 60670fc0 Fix BLE advertising not restarting after disconnect
* b36ebe89 Bootloader GPREGRET DFU, self-update, BLE trigger, and documentation
* 11f2beca 1.10.49.85 changed debug menu to enable dev mode switch on non-research devices
* a0c15ee1 Cleaned out binary cache
* 2c96309c gitignore
* d69a120f Build script automatically creates version-named binary
* cf44440c 1.10.48.85 Minor GUI patch
* 2d01ba53 WIP
* fb96b0de 1.10.48.84 text and GUI changes
* e4aa1d0d Merge branch 'gui-framework'
* 3702afca Merged new text renderer
* 72494b4b New menu backend seems to work without issue
* b98931d6 All popups replaced
* 09629073 First working replacement
* 0723b346 Better integration with existing code
* e2e0e05d WIP IT LIVES PART 2
* 420c06ec WIP IT LIVES
* b33b9222 Added options to notifs
* 4ee0e445 Better adaptable sizes, simpler API
* d8ef9691 Auto-resize window height
* 5a9ab9e3 Reordered menu
* 9a59ded7 Moved features out of old system menu
* 10195b9e Merge branch 'development' into gui-framework
* 12cf34c8 Replaced old broken stuff in merged code
* 75e9860d ERRORS WIP
* 952a9f07 At long last the old GUI code is dead
* c51beb81 WIP
* e3fd5cce Changed stroop back
* b25af652 Merged in new text renderer
* 76ac4b0a Deprecated old API
* 67e3dc20 Merged vertical text into new backend
* 11d60f77 Converted text rendering to new backend -- frontend still outdated
* f58f68eb Merged power loop fix from main
* 993a1023 Removed docs submodule from main
* 83f3a4d8 Research version
* c6ff7be0 Aseprite cleanup
* f662908d Minor glyph update
* 504a9509 Locked game behind password
* bc39acdf Added an erase logs option and made everything more difficult
* 1cd9a41e Added SD config option
* f19afa92 Added time config screen
* d67733e3 Added battery indicator
* f9175564 Fixed some bugs
* e1aeb895 First research version ready for testing on embedded
* 4eea3200 Added eink display and build flags
* d49673b5 Minor build changes
* ead1982d First-line alignment fixes
* 70efbd60 Line breaks work
* b8d837b4 New e-ink code working on embedded
* 0737d4dd Full eink impl working on desktop
* f80a7938 E-ink sim on desktop
* 0fc87177 Edited python reqs
* f1f71094 Compatibility changes for graphing on desktop
* 7cc7d957 Changes made while working on docs
* 973485ca Moved B64 de/en-code to editor and removed
* d2d5a5a3 Further cleaned up CMAKE
* ddf1354e Cleaned up CMAKE
* a2bd5d6e All asset gen moved to new system
* 92ee2f38 Items done
* 4a6d4312 Only items and sprites remain
* 296dc0dd Reforming asset gen
* 639b3926 Made editor external
* c0c1a88b Editor ensmallification
* 900e2231 Editor tool framework
* 553a2ee6 Requirements file
* 91ccb0a1 Merged main
* e4b46100 Took out useless menus

---
*Based on ucritair-firmware commit: 71906fb921ca803d9e006daef25b4334c7f24091
