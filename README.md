# Emufer — Browser retro emulator

Emufer is a browser-based retro game library powered by EmulatorJS.
It works on **phone, tablet, laptop and desktop**.

## Features
- Automatic console detection from ROM / disc contents
- Local game library with autosave & resume
- Keyboard + gamepad support
- Optional bundled EmulatorJS cores (offline) or online CDN

## Run
1. Put the `data/` folder (EmulatorJS cores) next to `index.html`, **or** choose the online CDN in Display settings.
2. Start a local server:

```bash
python3 serve.py
# Windows PowerShell:
./server.ps1
```

3. Open the URL shown (usually http://127.0.0.1:8765/index.html).

## Controls
| Input | Notes |
|-------|--------|
| Keyboard / Gamepad | Remappable via the Controls dialog |
| Fullscreen | `F` key or toolbar button |

## Legal
Emufer contains no games or BIOS files. Only use files you are legally entitled to use.
