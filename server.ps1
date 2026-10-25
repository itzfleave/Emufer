# Emufer local server (Windows PowerShell 5+). Serves this folder on http://127.0.0.1:8765/
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8765
$prefix = "http://127.0.0.1:$port/"
$mimes = @{
  '.html'='text/html; charset=utf-8'; '.js'='application/javascript'; '.css'='text/css'; '.json'='application/json'
  '.wasm'='application/wasm'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.txt'='text/plain'; '.ico'='image/x-icon'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
  Write-Host "Could not start the server on port $port. Is another Emufer window already open?" -ForegroundColor Red
  exit 1
}
Start-Process "${prefix}index.html"
Write-Host "Emufer is running at ${prefix}index.html"
Write-Host "Close this window to stop the server."
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $req = $ctx.Request; $res = $ctx.Response
      $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ($rel -eq '') { $rel = 'index.html' }
      $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
      $res.Headers.Add('Cache-Control', 'no-store')
      $res.Headers.Add('Cross-Origin-Opener-Policy', 'same-origin')
      $res.Headers.Add('Cross-Origin-Embedder-Policy', 'credentialless')
      if ($full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
        $res.ContentType = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { 'application/octet-stream' }
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $b = [Text.Encoding]::UTF8.GetBytes('Not found')
        $res.OutputStream.Write($b, 0, $b.Length)
      }
    } catch { } finally { try { $ctx.Response.Close() } catch { } }
  }
} finally { $listener.Stop() }
