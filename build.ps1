# Injects partials/header.html and partials/footer.html into every page
# containing <!--@HEADER--> / <!--@FOOTER--> markers. Run after editing partials.
$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$header = [System.IO.File]::ReadAllText("$root\partials\header.html", $utf8)
$footer = [System.IO.File]::ReadAllText("$root\partials\footer.html", $utf8)

Get-ChildItem "$root\*.html" | ForEach-Object {
  $html = [System.IO.File]::ReadAllText($_.FullName, $utf8)
  if ($html.Contains('<!--@HEADER-->') -or $html.Contains('<!--@FOOTER-->')) {
    $html = $html.Replace('<!--@HEADER-->', $header).Replace('<!--@FOOTER-->', $footer)
    [System.IO.File]::WriteAllText($_.FullName, $html, $utf8)
    Write-Host "Built: $($_.Name)"
  }
}
