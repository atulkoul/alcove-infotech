$ErrorActionPreference = 'Stop'

$outFile = "E:\Alcove Infotech\Candidate Tracker\ARMS\docs\funding\AlcoveHire-Investor-Deck-v1.pptx"
$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$ppAlignCenter = 2
$ppAlignRight = 3

function Add-Title {
    param($slide, $text)
    $t = $slide.Shapes.AddTextbox(1, 36, 20, 860, 40)
    $t.TextFrame.TextRange.Text = $text
    $t.TextFrame.TextRange.Font.Name = 'Calibri'
    $t.TextFrame.TextRange.Font.Size = 30
    $t.TextFrame.TextRange.Font.Bold = $true
}

function Add-Body {
    param($slide, [string[]]$lines, $left=48, $top=100, $width=840, $height=320, $size=20)
    $b = $slide.Shapes.AddTextbox(1, $left, $top, $width, $height)
    $b.TextFrame.TextRange.Text = ($lines -join "`r")
    $b.TextFrame.TextRange.Font.Name = 'Calibri'
    $b.TextFrame.TextRange.Font.Size = $size
}

function Add-Footer {
    param($slide, $no)
    $left = $slide.Shapes.AddTextbox(1, 36, 500, 250, 16)
    $left.TextFrame.TextRange.Text = 'AlcoveHire'
    $left.TextFrame.TextRange.Font.Size = 10

    $right = $slide.Shapes.AddTextbox(1, 560, 500, 360, 16)
    $right.TextFrame.TextRange.Text = "Confidential | Jul 2026 | $no"
    $right.TextFrame.TextRange.Font.Size = 10
    $right.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignRight
}

$ppt = $null
$presentation = $null

try {
    Get-Process POWERPNT -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = -1
    $presentation = $ppt.Presentations.Add()

    $slides = @(
        @{ Title = 'AlcoveHire'; Body = @('AI-Powered Recruitment Platform for High-Velocity Hiring Teams','Alcove Infotech | Investor Deck') },
        @{ Title = 'Problem'; Body = @('• Candidate data scattered across sheets, email, and chat.','• Slow requirement-to-shortlist turnaround.','• Limited visibility into pipeline and productivity.','• Legacy ATS tools are costly for SMB teams.') },
        @{ Title = 'Solution'; Body = @('• Unified ATS workflows in one platform.','• Embedded AI for parsing, scoring, and summaries.','• Role-based dashboards for recruiters and managers.','• Credit-based AI model for monetization.') },
        @{ Title = 'Product Flow'; Body = @('Requirement -> AI Match -> Interview -> Offer -> Invoice','Outcome: faster shortlisting, better conversion, better revenue visibility.') },
        @{ Title = 'Market Opportunity'; Body = @('TAM: INR 8,000 Cr','SAM: INR 1,800 Cr','SOM (3Y): INR 180 Cr','Focused agency-first GTM motion.') },
        @{ Title = 'Business Model and Pricing'; Body = @('Starter: INR 2,999/month','Growth: INR 7,999/month','Business: INR 18,999/month','Yearly plans: 20% discount','Add-ons: extra seats + AI credits') },
        @{ Title = 'Go-To-Market'; Body = @('Outbound: 1000 contacts/month','Discovery: 150 calls/month','Demos: 60/month','Trials: 20/month','Paid conversions: 8-12/month') },
        @{ Title = 'Competitive Positioning'; Body = @('• Better workflow depth for SMB recruiters','• Strong price-to-value compared to legacy ATS','• AI embedded into daily recruiter actions') },
        @{ Title = 'Roadmap and Milestones'; Body = @('M1: Local app ready','M2: Core SaaS complete','M3: Pilot-ready build','M4: Launch-ready build','M12: 100 paying customers') },
        @{ Title = 'Financial Snapshot'; Body = @('Target MRR at 100 customers: INR 6.1L','Target ARR at 100 customers: INR 73.2L','Monthly burn at full ramp: INR 17.9L') },
        @{ Title = 'Funding Ask'; Body = @('Raising INR 2.2 Cr for 12-month runway','Use of funds: 52% product, 28% GTM, 8% cloud/ops, 2% legal, 10% reserve') },
        @{ Title = 'Team and Closing'; Body = @('Core: 2 Frontend, 2 Backend, 1 QA, 1 DevOps/Sec, 1 PM, 1 UI/UX','GTM: 1 Sales Lead, 2 Sales Exec, 1 Customer Success, 1 Marketer','Commitment: launch-ready in 4 months','Request: proceed to due diligence') }
    )

    for ($i = 0; $i -lt $slides.Count; $i++) {
        $slide = $presentation.Slides.Add($i + 1, $ppLayoutBlank)
        Add-Title $slide $slides[$i].Title
        if ($i -eq 0) {
            Add-Body $slide $slides[$i].Body 36 95 850 120 22
            $card = $slide.Shapes.AddShape(5, 560, 95, 320, 220)
            $card.TextFrame.TextRange.Text = "Vision`rFaster shortlists`rBetter conversions`rPredictable productivity"
            $card.TextFrame.TextRange.ParagraphFormat.Alignment = $ppAlignCenter
            $card.TextFrame.TextRange.Font.Size = 18
        } else {
            Add-Body $slide $slides[$i].Body
            Add-Footer $slide ($i + 1)
        }
    }

    if (Test-Path $outFile) { Remove-Item $outFile -Force }
    $presentation.SaveAs($outFile, $ppSaveAsOpenXMLPresentation)
    $presentation.Close()
    $ppt.Quit()

    Write-Output "CREATED:$outFile"
} catch {
    Write-Error $_
    if ($presentation) { $presentation.Close() }
    if ($ppt) { $ppt.Quit() }
    exit 1
}
