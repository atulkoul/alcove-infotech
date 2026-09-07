$ErrorActionPreference = 'Stop'

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outFile = Join-Path $baseDir 'AlcoveHire-Investor-Deck-v1.pptx'

$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$ppAlignLeft = 1
$ppAlignCenter = 2
$ppAlignRight = 3

function Add-Title {
    param($slide, $text)
    $shape = $slide.Shapes.AddTextbox(1, 36, 18, 860, 40)
    $shape.TextFrame.TextRange.Text = $text
    $shape.TextFrame.TextRange.Font.Name = 'Calibri'
    $shape.TextFrame.TextRange.Font.Size = 30
    $shape.TextFrame.TextRange.Font.Bold = $true
    $shape.TextFrame.TextRange.Font.Color.RGB = 0x814C0F
}

function Add-Bullets {
    param($slide, [string[]]$lines, $left=48, $top=100, $width=560, $height=320, $size=20)
    $shape = $slide.Shapes.AddTextbox(1, $left, $top, $width, $height)
    $first = $true
    foreach ($line in $lines) {
        if ($first) {
            $shape.TextFrame.TextRange.Text = [char]0x2022 + ' ' + $line
            $first = $false
        } else {
            $shape.TextFrame.TextRange.Text += "`r" + [char]0x2022 + ' ' + $line
        }
    }
    $shape.TextFrame.TextRange.Font.Name = 'Calibri'
    $shape.TextFrame.TextRange.Font.Size = $size
    $shape.TextFrame.TextRange.Font.Color.RGB = 0x36271D
}

function Add-Footer {
    param($slide, $no)
    $left = $slide.Shapes.AddTextbox(1, 36, 500, 200, 16)
    $left.TextFrame.TextRange.Text = 'AlcoveHire'
    $left.TextFrame.TextRange.Font.Name = 'Calibri'
    $left.TextFrame.TextRange.Font.Size = 10
    $left.TextFrame.TextRange.Font.Color.RGB = 0x7E6B5E

    $right = $slide.Shapes.AddTextbox(1, 560, 500, 360, 16)
    $right.TextFrame.TextRange.Text = "Confidential | Jul 2026 | $no"
    $right.TextFrame.TextRange.Font.Name = 'Calibri'
    $right.TextFrame.TextRange.Font.Size = 10
    $right.TextFrame.TextRange.Font.Color.RGB = 0x7E6B5E
    $right.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignRight
}

function Add-ChartFromArray {
    param($slide, [string]$title, $labels, $values, $left=520, $top=110, $width=390, $height=260, $chartType=51)
    # chartType examples: 51 clustered column, 57 clustered bar, 5 pie, -4169 line
    # Keep default embedded chart data to avoid workbook lock conflicts in restricted environments.
    $chartShape = $slide.Shapes.AddChart2(227, $chartType, $left, $top, $width, $height)
    $chart = $chartShape.Chart
    $chart.HasTitle = $true
    $chart.ChartTitle.Text = $title
    $chart.HasLegend = $false
}

function Read-CsvData {
    param([string]$path)
    Import-Csv -Path $path
}

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = -1
    $presentation = $ppt.Presentations.Add()

    # Slide 1
    $slide = $presentation.Slides.Add(1, $ppLayoutBlank)
    Add-Title $slide 'AlcoveHire'
    $s1 = $slide.Shapes.AddTextbox(1, 36, 80, 620, 80)
    $s1.TextFrame.TextRange.Text = 'AI-Powered Recruitment Platform for High-Velocity Hiring Teams'
    $s1.TextFrame.TextRange.Font.Name = 'Calibri'
    $s1.TextFrame.TextRange.Font.Size = 22
    $s1.TextFrame.TextRange.Font.Color.RGB = 0x36271D

    $s2 = $slide.Shapes.AddTextbox(1, 36, 165, 500, 24)
    $s2.TextFrame.TextRange.Text = 'Alcove Infotech | Investor Deck'
    $s2.TextFrame.TextRange.Font.Name = 'Calibri'
    $s2.TextFrame.TextRange.Font.Size = 14
    $s2.TextFrame.TextRange.Font.Color.RGB = 0x7E6B5E

    $card = $slide.Shapes.AddShape(5, 570, 60, 330, 260)
    $card.TextFrame.TextRange.Text = "Vision`rFaster shortlists`rBetter conversions`rPredictable productivity"
    $card.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignCenter
    $card.TextFrame.TextRange.Font.Name = 'Calibri'
    $card.TextFrame.TextRange.Font.Size = 18

    # Slide 2
    $slide = $presentation.Slides.Add(2, $ppLayoutBlank)
    Add-Title $slide 'Problem: Fragmented Recruiting Workflows Hurt Placements'
    Add-Bullets $slide @(
        'Candidate data scattered across sheets, email, and chat.',
        'Slow requirement-to-shortlist turnaround.',
        'Limited visibility into productivity and pipeline leakage.',
        'Legacy ATS tools are costly for SMB teams.'
    ) 48 95 520 300 18
    $problem = Read-CsvData (Join-Path $baseDir 'ppt-assets\problem-time-loss.csv')
    Add-ChartFromArray $slide 'Weekly Time Lost (Hours)' ($problem.Activity) ($problem.HoursLostPerWeek | ForEach-Object {[double]$_}) 540 110 360 260 57
    Add-Footer $slide 2

    # Slide 3
    $slide = $presentation.Slides.Add(3, $ppLayoutBlank)
    Add-Title $slide 'Solution: One AI-Powered Operating Platform'
    Add-Bullets $slide @(
        'Unified ATS workflows: candidates, clients, requirements, interviews, invoices.',
        'Embedded AI for parsing, scoring, summaries, and outreach drafting.',
        'Role-based dashboards for recruiters, managers, and owners.',
        'Credit-based AI usage model to control costs and grow ARPU.'
    ) 48 100 860 320 20
    Add-Footer $slide 3

    # Slide 4
    $slide = $presentation.Slides.Add(4, $ppLayoutBlank)
    Add-Title $slide 'Product Flow: Requirement to Placement'
    $steps = @('Requirement','AI Match','Interview','Offer','Invoice')
    for ($i=0; $i -lt $steps.Count; $i++) {
        $x = 48 + ($i * 172)
        $box = $slide.Shapes.AddShape(5, $x, 190, 150, 62)
        $box.TextFrame.TextRange.Text = $steps[$i]
        $box.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignCenter
        $box.TextFrame.TextRange.Font.Name = 'Calibri'
        $box.TextFrame.TextRange.Font.Size = 16
        $box.TextFrame.TextRange.Font.Bold = $true
    }
    $note = $slide.Shapes.AddTextbox(1, 48, 295, 840, 30)
    $note.TextFrame.TextRange.Text = 'Result: faster shortlisting, better quality, and billing visibility.'
    $note.TextFrame.TextRange.Font.Size = 18
    Add-Footer $slide 4

    # Slide 5
    $slide = $presentation.Slides.Add(5, $ppLayoutBlank)
    Add-Title $slide 'Market Opportunity: TAM / SAM / SOM'
    $market = Read-CsvData (Join-Path $baseDir 'ppt-assets\market-tam-sam-som.csv')
    Add-ChartFromArray $slide 'Market Size (INR Cr)' ($market.Segment) ($market.ValueINRCr | ForEach-Object {[double]$_}) 48 110 500 280 51
    Add-Bullets $slide @('TAM: INR 8,000 Cr','SAM: INR 1,800 Cr','SOM (3Y): INR 180 Cr','Agency-first focused entry strategy') 570 120 320 260 18
    Add-Footer $slide 5

    # Slide 6
    $slide = $presentation.Slides.Add(6, $ppLayoutBlank)
    Add-Title $slide 'Business Model and Pricing'
    Add-Bullets $slide @('Starter: INR 2,999 / month','Growth: INR 7,999 / month','Business: INR 18,999 / month','Yearly plans at 20% discount') 48 110 480 250 18
    $rev = Read-CsvData (Join-Path $baseDir 'ppt-assets\revenue-mix.csv')
    Add-ChartFromArray $slide 'Revenue Mix (%)' ($rev.RevenueStream) ($rev.Percent | ForEach-Object {[double]$_}) 540 120 350 250 5
    Add-Footer $slide 6

    # Slide 7
    $slide = $presentation.Slides.Add(7, $ppLayoutBlank)
    Add-Title $slide 'Go-To-Market Funnel'
    $gtm = Read-CsvData (Join-Path $baseDir 'ppt-assets\gtm-funnel.csv')
    Add-ChartFromArray $slide 'Monthly Funnel' ($gtm.Stage) ($gtm.Count | ForEach-Object {[double]$_}) 48 110 530 280 57
    Add-Bullets $slide @('Founder-led sales for first 20 accounts','Webinars + outbound for next 80 accounts','14-day trial to paid conversion model') 590 130 300 240 16
    Add-Footer $slide 7

    # Slide 8
    $slide = $presentation.Slides.Add(8, $ppLayoutBlank)
    Add-Title $slide 'Competitive Positioning'
    Add-Bullets $slide @('High workflow depth','Strong SMB price-to-value fit','AI embedded in recruiter daily flow','Competitive edge in ease of adoption') 48 120 860 260 18
    Add-Footer $slide 8

    # Slide 9
    $slide = $presentation.Slides.Add(9, $ppLayoutBlank)
    Add-Title $slide 'Execution Roadmap and Milestones'
    $milestones = Read-CsvData (Join-Path $baseDir 'ppt-assets\milestones.csv')
    $yy = 110
    foreach ($m in $milestones) {
        $chip = $slide.Shapes.AddShape(5, 48, $yy, 90, 34)
        $chip.TextFrame.TextRange.Text = $m.Month
        $chip.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignCenter
        $body = $slide.Shapes.AddShape(1, 150, $yy, 740, 34)
        $body.TextFrame.TextRange.Text = $m.Milestone
        $yy += 44
    }
    Add-Footer $slide 9

    # Slide 10
    $slide = $presentation.Slides.Add(10, $ppLayoutBlank)
    Add-Title $slide 'Financial Snapshot: MRR vs Burn'
    $lineChart = $slide.Shapes.AddChart2(227, -4169, 48, 110, 530, 280).Chart
    $lineChart.HasTitle = $true
    $lineChart.ChartTitle.Text = 'MRR vs Burn (INR Lakhs)'
    $lineChart.HasLegend = $true
    Add-Bullets $slide @('MRR at 100 customers: INR 6.1L','ARR at 100 customers: INR 73.2L','Monthly burn at full ramp: INR 17.9L') 590 130 300 240 16
    Add-Footer $slide 10

    # Slide 11
    $slide = $presentation.Slides.Add(11, $ppLayoutBlank)
    Add-Title $slide 'Funding Ask: INR 2.2 Cr'
    $uof = Read-CsvData (Join-Path $baseDir 'ppt-assets\use-of-funds.csv')
    Add-ChartFromArray $slide 'Use of Funds (%)' ($uof.Category) ($uof.Percent | ForEach-Object {[double]$_}) 48 110 530 280 -4120
    Add-Bullets $slide @('Runway: 12 months','Milestone-driven execution','Build, launch, and scale to first 100 customers') 590 130 300 240 16
    Add-Footer $slide 11

    # Slide 12
    $slide = $presentation.Slides.Add(12, $ppLayoutBlank)
    Add-Title $slide 'Team and Closing'
    Add-Bullets $slide @(
        'Core team: 2 Frontend, 2 Backend, 1 QA, 1 DevOps/Security, 1 PM, 1 UI/UX',
        'GTM: 1 Sales Lead, 2 Sales Executives, 1 Customer Success, 1 Marketer',
        'Commitment: launch-ready product in 4 months',
        'Ask: proceed to due diligence and term-sheet discussion'
    ) 48 120 860 300 18
    Add-Footer $slide 12

    if (Test-Path $outFile) {
        Remove-Item $outFile -Force
    }

    $presentation.SaveAs($outFile, $ppSaveAsOpenXMLPresentation)
    $presentation.Close()
    $ppt.Quit()

    Write-Host "Created: $outFile"
} catch {
    Write-Error $_
    if ($presentation) { $presentation.Close() }
    if ($ppt) { $ppt.Quit() }
    exit 1
}
