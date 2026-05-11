# Fix encoding issues in Admin.jsx
$filePath = 'e:\WEB TECH ESP\CardioSentinel-MERN\frontend\src\pages\Admin.jsx'

# Read as raw bytes to handle encoding properly
$bytes = [System.IO.File]::ReadAllBytes($filePath)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Line 119: emoji 🔭 got corrupted - fix the div with telescope emoji
$content = $content -replace '(?<=fontSize: .2\.5rem., marginBottom: .0\.75rem. }}>)[^\x00-\x7F]+(?=</div>)', '🔭'

# Line 165: curly quotes around CSS values - replace with straight quotes  
# The pattern is: â€˜ (U+00E2 U+20AC U+02DC) should be ' and â€™ (U+00E2 U+20AC U+2122) should be '
$content = $content -replace '\xE2\u20AC\u02DC', "'"
$content = $content -replace '\xE2\u20AC\u2122', "'"

# Line 200: em-dash â€" got corrupted - should be just a dash —
$content = $content -replace '\xE2\u20AC\u201D', "`u{2014}"

# Write back as UTF-8 with BOM-free encoding
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)

Write-Host "Done fixing encoding."
