$lines = Get-Content 'e:\WEB TECH ESP\CardioSentinel-MERN\frontend\src\pages\Admin.jsx'
$line = $lines[164]
Write-Host "Line 165: $line"
$chars = $line.ToCharArray()
for($i=0; $i -lt $chars.Length; $i++){
    $c = [int]$chars[$i]
    if($c -gt 127){
        Write-Host ("  Position {0}: U+{1:X4} char=[{2}]" -f $i, $c, $chars[$i])
    }
}
Write-Host "`n--- Checking ALL lines for smart quotes ---"
for($ln=0; $ln -lt $lines.Length; $ln++){
    $chars = $lines[$ln].ToCharArray()
    for($i=0; $i -lt $chars.Length; $i++){
        $c = [int]$chars[$i]
        if($c -eq 0x2018 -or $c -eq 0x2019 -or $c -eq 0x201C -or $c -eq 0x201D){
            Write-Host ("  Line {0}, Col {1}: U+{2:X4} char=[{3}]" -f ($ln+1), ($i+1), $c, $chars[$i])
        }
    }
}
