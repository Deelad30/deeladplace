$filePath = "c:\Users\HP\Desktop\deeladplace\frontend\src\pages\ProductsDashboard.js"
$content = [System.IO.File]::ReadAllText($filePath)

# Fix 1: Add vendor_price to the inline reset (the only remaining occurrence without vendor_price)
$old1 = 'commission: "", vendor_id: "" });'
$new1 = 'commission: "", vendor_id: "", vendor_price: "" });'
$content = $content.Replace($old1, $new1)

# Fix 2: Add Vendor Price input field before Commission in the form grid
$old2 = @'
                        <div className="form-group">
                              <label className="premium-label-2">Commission</label>
                              <input
                                className="premium-input"
                                type="number"
                                value={formData.commission}
                                onChange={e => setFormData({ ...formData, commission: e.target.value })}
                                placeholder="0.00"
                              />
                        </div>
                    </div>
'@

$new2 = @'
                        <div className="form-group">
                              <label className="premium-label-2">Vendor Price</label>
                              <input
                                className="premium-input"
                                type="number"
                                value={formData.vendor_price}
                                onChange={e => setFormData({ ...formData, vendor_price: e.target.value })}
                                placeholder="0.00"
                              />
                        </div>
                        <div className="form-group">
                              <label className="premium-label-2">Commission</label>
                              <input
                                className="premium-input"
                                type="number"
                                value={formData.commission}
                                onChange={e => setFormData({ ...formData, commission: e.target.value })}
                                placeholder="0.00"
                              />
                        </div>
                    </div>
'@

$content = $content.Replace($old2, $new2)

[System.IO.File]::WriteAllText($filePath, $content)
Write-Host "Done - fixes applied"