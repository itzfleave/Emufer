# Emufer — Cross-device browser retro emulator

Emufer is a browser-based retro game library powered by EmulatorJS.  
It works on **phone, tablet, laptop and desktop**.

## Features
- Automatic console detection from ROM / disc contents
- Local game library with autosave & resume
- Physical keyboard + gamepad support
- **On-screen virtual controller** that appears on touch devices and narrow screens
  - Button labels match the real hardware (NES A/B, SNES A/B/X/Y, PlayStation ✕/○/□/△, N64, arcade, etc.)
  - Layout changes automatically when you switch systems
  - Toggle with the **Pad** button in the player toolbar

## Run
1. Put the `data/` folder (EmulatorJS cores) next to `index.html`, **or** choose the online CDN in the Display settings.
2. Start a local server (required for best compatibility):

```bash
python3 serve.py
# or on Windows PowerShell:
./server.ps1
```

3. Open the URL shown (usually http://127.0.0.1:8765/index.html).

Opening the HTML file directly with `file://` works for some systems but is limited by browser security rules.

## Controls
| Input              | Notes                                      |
|--------------------|--------------------------------------------|
| Keyboard / Gamepad | Fully remappable via the Controls dialog   |
| On-screen Pad      | Appears automatically on touch / mobile    |
| Fullscreen         | `F` key or toolbar button                  |

## Legal
Emufer contains no games or BIOS files. Only use files you are legally entitled to use.
