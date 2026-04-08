$filePath = "c:\Users\HP\Desktop\deeladplace\frontend\src\pages\ProductsDashboard.js"
$lines = [System.IO.File]::ReadAllLines($filePath)

# Find line 407 (0-indexed: 406) which is the closing </div> of SKU form-group
# Insert Vendor Price field after SKU field and before Commission field
$newLines = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines.Add($lines[$i])
    
    # After the closing </div> of SKU form-group (line 407, 0-indexed 406)
    if ($i -eq 406) {
        $newLines.Add('                        <div className="form-group">')
        $newLines.Add('                              <label className="premium-label-2">Vendor Price</label>')
        $newLines.Add('                              <input')
        $newLines.Add('                                className="premium-input"')
        $newLines.Add('                                type="number"')
        $newLines.Add('                                value={formData.vendor_price}')
        $newLines.Add('                                onChange={e => setFormData({ ...formData, vendor_price: e.target.value })}')
        $newLines.Add('                                placeholder="0.00"')
        $newLines.Add('                              />')
        $newLines.Add('                        </div>')
    }
}

[System.IO.File]::WriteAllLines($filePath, $newLines)
Write-Host "Done - Vendor Price field added"
