$filePath = 'e:\WEB TECH ESP\CardioSentinel-MERN\frontend\src\pages\Admin.jsx'
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# Find line 165 area - search for the pattern around column 42
# The error says line 165 col 42, look for corrupted smart quotes
# Let's find line boundaries first
$lineStarts = @(0)
for ($i = 0; $i -lt $bytes.Length; $i++) {
    if ($bytes[$i] -eq 0x0A) { $lineStarts += ($i + 1) }
}

# Show bytes around lines 119, 165, 200, 262 (0-indexed: 118, 164, 199, 261)
foreach ($lineNum in @(119, 165, 200, 262)) {
    $idx = $lineNum - 1
    if ($idx -lt $lineStarts.Length - 1) {
        $start = $lineStarts[$idx]
        $end = $lineStarts[$idx + 1] - 1
        Write-Host "`n=== Line $lineNum (bytes $start to $end) ==="
        $lineBytes = $bytes[$start..$end]
        $hex = ($lineBytes | ForEach-Object { '{0:X2}' -f $_ }) -join ' '
        Write-Host $hex
        # Show non-ASCII bytes
        for ($j = 0; $j -lt $lineBytes.Length; $j++) {
            if ($lineBytes[$j] -gt 0x7F) {
                Write-Host ("  byte offset {0}: 0x{1:X2}" -f $j, $lineBytes[$j])
            }
        }
    }
}
