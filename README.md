# Emufer — Cross-device browser controller update

This package is an updated single-file Emufer frontend. It keeps the existing ROM loader and community UI, and adds an on-screen virtual controller that changes when the selected system changes.

## Run
- Open `index.html` in a modern browser. For the smoothest emulator compatibility, host it on HTTPS or use a local web server because browser security rules can restrict emulator assets when opened with `file://`.
- In Game setup, choose a console, select a ROM/disc image that you are legally entitled to use, and click Load game.
- The on-screen controller updates to the selected console and can be used on desktop browsers as well as touch screens.
- A physical gamepad and keyboard input are still supported.

## Important
- EmulatorJS assets are loaded from its public CDN, so an internet connection is required.
- Some systems require BIOS/firmware files and some games need additional input methods. The on-screen controller covers common controls; it cannot replace a DS stylus or every computer-specific keyboard.
- I verified the generated JavaScript syntax and HTML structure, but have not run a real ROM in a live EmulatorJS browser session here. Button behavior should be tested with a legally obtained ROM for each target system before publishing widely.
- The existing Supabase community backend code was preserved. This update is focused on the player controller and does not migrate or repair the backend schema.
