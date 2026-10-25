#!/usr/bin/env python3
"""Emufer local server (cross-platform). Run: python3 serve.py   (Windows: py serve.py)"""
import http.server, socketserver, os, sys, webbrowser, mimetypes
from urllib.parse import urlparse, parse_qs
PORT = int(os.environ.get("EMUFER_PORT", "8765"))
ROOT = os.path.dirname(os.path.abspath(__file__))
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/octet-stream", ".data")

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        # cross-origin isolation: required by PSP / DOS (SharedArrayBuffer)
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "credentialless")
        super().end_headers()
    def log_message(self, *a): pass

class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    try:
        srv = S(("127.0.0.1", PORT), H)
    except OSError:
        print(f"Port {PORT} is busy. Close the other Emufer window or set EMUFER_PORT."); sys.exit(1)
    url = f"http://127.0.0.1:{PORT}/index.html"
    print("Emufer running at", url, "- press Ctrl+C to stop")
    if "--no-browser" not in sys.argv: webbrowser.open(url)
    try: srv.serve_forever()
    except KeyboardInterrupt: pass
