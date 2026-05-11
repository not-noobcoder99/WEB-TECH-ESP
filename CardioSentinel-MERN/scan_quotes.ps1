$dir = 'e:\WEB TECH ESP\CardioSentinel-MERN\frontend\src'
$files = Get-ChildItem -Path $dir -Include *.jsx,*.js -Recurse
$found = $false
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    for ($i = 0; $i -lt $bytes.Length - 2; $i++) {
        # Check for smart quotes: E2 80 98 (') and E2 80 99 (')
        if ($bytes[$i] -eq 0xE2 -and $bytes[$i+1] -eq 0x80 -and ($bytes[$i+2] -eq 0x98 -or $bytes[$i+2] -eq 0x99)) {
            # Count line number
            $lineNum = 1
            for ($j = 0; $j -lt $i; $j++) { if ($bytes[$j] -eq 0x0A) { $lineNum++ } }
            $quote = if ($bytes[$i+2] -eq 0x98) { "left '" } else { "right '" }
            Write-Host "$($f.Name):$lineNum - $quote smart quote found"
            $found = $true
        }
    }
}
if (-not $found) { Write-Host "No smart quotes found - all clean!" }
