# ── seo-enhance.ps1 ──────────────────────────────────────────────
# Idempotent. Injects OG/Twitter meta, favicon/manifest/theme-color,
# per-page JSON-LD (@graph: Organization, WebSite, BreadcrumbList,
# Service), a skip link, <main id>, and defers the script — into
# every root *.html page. Safe to re-run; guarded by a sentinel.
# Run after editing page <head> content.

$root  = $PSScriptRoot
$utf8  = New-Object System.Text.UTF8Encoding $false
$base  = 'https://www.clearcyclercm.com'
$sentinel = '<!-- seo:enhanced -->'

# Per-page metadata: breadcrumb label + optional Service schema.
$pages = @{
  'index.html'                   = @{ crumb = $null;                       svc = $null }
  'services.html'                = @{ crumb = 'Services';                  svc = $null }
  'credentialing.html'           = @{ crumb = 'Provider Credentialing';    svc = @{ n='Provider Credentialing & Payer Enrollment'; d='Payer enrollment with 5+ insurance payers in 45-90 days, including CAQH setup, revalidation tracking, and a free practice website.' } }
  'revenue-cycle-management.html'= @{ crumb = 'Revenue Cycle Management';  svc = @{ n='Revenue Cycle Management'; d='End-to-end medical billing from charge capture to payment posting, with a live 24/7 claims dashboard.' } }
  'denial-management.html'       = @{ crumb = 'Denial Management';         svc = @{ n='Denial Management & Prevention'; d='Predictive denial prevention and root-cause appeals that cut denial rates below 4%.' } }
  'prior-authorization.html'     = @{ crumb = 'Prior Authorization';       svc = @{ n='Prior Authorization'; d='Dedicated specialists submit, track, and escalate prior authorization requests with sub-36-hour average turnaround.' } }
  'eligibility-verification.html'= @{ crumb = 'Eligibility Verification';  svc = @{ n='Insurance Eligibility Verification'; d='Real-time benefits verification 48 hours before every visit to prevent front-end denials.' } }
  'ar-recovery.html'             = @{ crumb = 'A/R Recovery';              svc = @{ n='Aged A/R Recovery'; d='Performance-based recovery of aged accounts receivable over 90 days that competitors wrote off.' } }
  'specialties.html'             = @{ crumb = 'Specialties';               svc = $null }
  'about.html'                   = @{ crumb = 'About';                     svc = $null }
  'blog.html'                    = @{ crumb = 'Resources';                 svc = $null }
  'faq.html'                     = @{ crumb = 'FAQ';                       svc = $null }
  'careers.html'                 = @{ crumb = 'Careers';                   svc = $null }
  'contact.html'                 = @{ crumb = 'Contact';                   svc = $null }
}

# Shared Organization + WebSite nodes (same on every page; engines merge by @id).
$org = [ordered]@{
  '@type'='Organization'; '@id'="$base/#organization"
  name='ClearCycle RCM'; url="$base/"
  logo="$base/favicon.svg"; image="$base/assets/img/og-default.svg"
  description='Credentialing-first medical billing and revenue cycle management for US healthcare practices.'
  telephone='+1-800-555-0142'; email='hello@clearcyclercm.com'; foundingDate='2017'; areaServed='US'
  address=[ordered]@{ '@type'='PostalAddress'; streetAddress='2200 Market Street, Suite 410'; addressLocality='Nashville'; addressRegion='TN'; postalCode='37203'; addressCountry='US' }
  contactPoint=[ordered]@{ '@type'='ContactPoint'; telephone='+1-800-555-0142'; contactType='sales'; email='hello@clearcyclercm.com'; areaServed='US'; availableLanguage='English' }
}
$website = [ordered]@{ '@type'='WebSite'; '@id'="$base/#website"; url="$base/"; name='ClearCycle RCM'; publisher=[ordered]@{ '@id'="$base/#organization" }; inLanguage='en-US' }

foreach ($name in $pages.Keys) {
  $path = Join-Path $root $name
  if (-not (Test-Path $path)) { Write-Host "skip (missing): $name"; continue }
  $html = [System.IO.File]::ReadAllText($path, $utf8)
  if ($html.Contains($sentinel)) { Write-Host "already enhanced: $name"; continue }

  $title = [regex]::Match($html, '<title>(.*?)</title>', 'Singleline').Groups[1].Value.Trim()
  $desc  = [regex]::Match($html, '<meta name="description" content="(.*?)">', 'Singleline').Groups[1].Value
  $canon = [regex]::Match($html, 'rel="canonical" href="(.*?)"').Groups[1].Value
  if (-not $canon) { $canon = "$base/$name" }
  $hasOg = $html -match 'property="og:title"'
  $img   = "$base/assets/img/og-default.svg"

  # ---- head meta block ----
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.AppendLine($sentinel)
  [void]$sb.AppendLine('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">')
  [void]$sb.AppendLine('<meta name="author" content="ClearCycle RCM">')
  [void]$sb.AppendLine('<meta name="theme-color" content="#0e1b26">')
  [void]$sb.AppendLine('<meta name="format-detection" content="telephone=yes">')
  [void]$sb.AppendLine('<link rel="icon" href="/favicon.svg" type="image/svg+xml">')
  [void]$sb.AppendLine('<link rel="apple-touch-icon" href="/favicon.svg">')
  [void]$sb.AppendLine('<link rel="manifest" href="/site.webmanifest">')
  if (-not $hasOg) {
    [void]$sb.AppendLine("<meta property=""og:title"" content=""$title"">")
    [void]$sb.AppendLine("<meta property=""og:description"" content=""$desc"">")
    [void]$sb.AppendLine('<meta property="og:type" content="website">')
  }
  [void]$sb.AppendLine('<meta property="og:site_name" content="ClearCycle RCM">')
  [void]$sb.AppendLine('<meta property="og:locale" content="en_US">')
  [void]$sb.AppendLine("<meta property=""og:url"" content=""$canon"">")
  [void]$sb.AppendLine("<meta property=""og:image"" content=""$img"">")
  [void]$sb.AppendLine('<meta property="og:image:type" content="image/svg+xml">')
  [void]$sb.AppendLine('<meta property="og:image:width" content="1200">')
  [void]$sb.AppendLine('<meta property="og:image:height" content="630">')
  [void]$sb.AppendLine('<meta property="og:image:alt" content="ClearCycle RCM — credentialing-first medical billing">')
  [void]$sb.AppendLine('<meta name="twitter:card" content="summary_large_image">')
  [void]$sb.AppendLine("<meta name=""twitter:title"" content=""$title"">")
  [void]$sb.AppendLine("<meta name=""twitter:description"" content=""$desc"">")
  [void]$sb.AppendLine("<meta name=""twitter:image"" content=""$img"">")

  # ---- JSON-LD @graph ----
  $graph = New-Object System.Collections.ArrayList
  [void]$graph.Add($org); [void]$graph.Add($website)
  $meta = $pages[$name]
  if ($meta.crumb) {
    $graph.Add([ordered]@{ '@type'='BreadcrumbList'; itemListElement=@(
      [ordered]@{ '@type'='ListItem'; position=1; name='Home'; item="$base/" },
      [ordered]@{ '@type'='ListItem'; position=2; name=$meta.crumb; item=$canon }
    )}) | Out-Null
  }
  if ($meta.svc) {
    $graph.Add([ordered]@{ '@type'='Service'; name=$meta.svc.n; serviceType=$meta.svc.n; description=$meta.svc.d; provider=[ordered]@{ '@id'="$base/#organization" }; areaServed='US'; url=$canon }) | Out-Null
  }
  $ld = [ordered]@{ '@context'='https://schema.org'; '@graph'=$graph }
  $ldJson = $ld | ConvertTo-Json -Depth 12 -Compress
  $ldScript = "<script type=""application/ld+json"">$ldJson</script>"

  # ---- splice everything in (literal replaces, no regex) ----
  $html = $html.Replace('</head>', $sb.ToString() + '</head>')
  $html = $html.Replace('<body>', "<body>`n<a class=""skip-link"" href=""#main"">Skip to content</a>")
  $html = $html.Replace('<main>', '<main id="main">')
  $html = $html.Replace('<script src="assets/js/main.js"></script>', '<script src="assets/js/main.js" defer></script>')
  $html = $html.Replace('</body>', "$ldScript`n</body>")

  [System.IO.File]::WriteAllText($path, $html, $utf8)
  Write-Host "enhanced: $name"
}
