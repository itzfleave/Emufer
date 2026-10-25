EmuHub 3.0 - fully offline retro game library (EmulatorJS cores bundled)

INSTALL (the download comes in 7 zips)
 Extract EmuHub_3.0_app.zip, then extract all EmuHub_3.0_cores_part*.zip INTO THE SAME FOLDER (merge/overwrite 'data'). Done - no internet needed afterwards.

START
 Windows : double-click Start_EmuHub.bat   (Chrome or Edge recommended)
 Mac/Linux: ./Start_EmuHub.sh              (needs python3)
 No internet needed: all emulator cores are in the "data" folder. Do not move index.html out of this folder.

AUTOSAVE & RESUME
 - Every 15 seconds (changeable: 5/15/30/60/off) the full game state is saved over the previous autosave.
 - It also saves when you close, reload or switch away from the tab, and when you press Stop.
 - Load the same game again (library "Continue", or pick the same file) and it resumes from the last autosave.
 - On startup EmuHub re-opens your last game automatically (switch off in "Autosave & resume").
 - The previous session's last state is kept as a one-step safety backup.
 - Everything is stored in your browser profile on this PC (IndexedDB / localStorage). "Back up saves" exports it all
   (autosaves, in-game saves, controls, settings) to one JSON file; "Restore saves" imports it again.

CONSOLE AUTO-DETECTION
 Detected from the file's CONTENT (headers / disc volume info / zip contents), then extension, then filename.
 For CD games with .cue + .bin, select both files at once - EmuHub packs them together automatically.
 CHD files can't be inspected: pick the system manually if "PlayStation" is wrong.

CONTROLS
 Top-right "Controls": remap keyboard AND gamepad per player (1-4). Saved on this PC and used for every game.

SYSTEMS (offline cores included)
 NES/Famicom/FDS, SNES, GB, GBC, GBA, N64, DS, Virtual Boy, Master System, Game Gear, Mega Drive/Genesis, Sega CD,
 32X, Saturn, PlayStation, PSP*, Arcade (FBNeo/MAME), Neo Geo, Atari 2600/5200/7800/Lynx/Jaguar, 3DO, ColecoVision,
 PC Engine (+CD), PC-FX, WonderSwan (Color), Neo Geo Pocket (Color), C64, Amiga, MS-DOS*, ZX Spectrum, ZX81, Amstrad CPC.
 * PSP and DOS need Chrome/Edge started through the launcher (cross-origin isolation).
 Some systems need BIOS/firmware files you own: use "BIOS / extra file" in the setup panel.

LEGAL
 No games or BIOS included. EmulatorJS and its cores are bundled under their own licenses (see data/EmulatorJS-LICENSE.txt).
