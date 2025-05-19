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
