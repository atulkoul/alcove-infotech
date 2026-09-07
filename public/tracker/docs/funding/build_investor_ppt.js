const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const baseDir = __dirname;
const assetsDir = path.join(baseDir, 'ppt-assets');
const outFile = path.join(baseDir, 'AlcoveHire-Investor-Deck-v1.pptx');

const colors = {
  bg: 'F4F7FB',
  primary: '0F4C81',
  accent: '1E7A73',
  text: '1D2736',
  muted: '5E6B7E',
  white: 'FFFFFF',
  border: 'D8E0EA'
};

function readCsv(fileName) {
  const file = fs.readFileSync(path.join(assetsDir, fileName), 'utf8').trim();
  const lines = file.split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const vals = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      row[h] = vals[i];
    });
    return row;
  });
}

function addCommon(slide, title, pageNo) {
  slide.background = { color: colors.bg };
  slide.addText(title, {
    x: 0.6,
    y: 0.2,
    w: 12.0,
    h: 0.7,
    fontFace: 'Manrope',
    fontSize: 28,
    bold: true,
    color: colors.primary
  });

  if (pageNo > 1) {
    slide.addText('AlcoveHire', {
      x: 0.6,
      y: 7.05,
      w: 3.0,
      h: 0.2,
      fontFace: 'Source Sans 3',
      fontSize: 10,
      color: colors.muted
    });
    slide.addText(`Confidential | Jul 2026 | ${pageNo}`, {
      x: 9.5,
      y: 7.05,
      w: 3.2,
      h: 0.2,
      align: 'right',
      fontFace: 'Source Sans 3',
      fontSize: 10,
      color: colors.muted
    });
  }
}

function bullets(slide, lines, opts = {}) {
  const runs = lines.map((line) => ({ text: line, options: { bullet: { indent: 18 } } }));
  slide.addText(runs, {
    x: opts.x ?? 0.8,
    y: opts.y ?? 1.4,
    w: opts.w ?? 6.2,
    h: opts.h ?? 4.5,
    fontFace: 'Source Sans 3',
    fontSize: opts.fontSize ?? 18,
    color: colors.text,
    breakLine: true,
    paraSpaceAfterPt: 8
  });
}

function generate() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Alcove Infotech';
  pptx.company = 'Alcove Infotech';
  pptx.subject = 'AlcoveHire Investor Deck';
  pptx.title = 'AlcoveHire Investor Deck';

  // Slide 1
  let slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  slide.addText('AlcoveHire', {
    x: 0.8, y: 1.2, w: 6.5, h: 0.9,
    fontFace: 'Manrope', fontSize: 50, bold: true, color: colors.primary
  });
  slide.addText('AI-Powered Recruitment Platform for High-Velocity Hiring Teams', {
    x: 0.8, y: 2.2, w: 7.0, h: 1.2,
    fontFace: 'Source Sans 3', fontSize: 22, color: colors.text
  });
  slide.addText('Alcove Infotech | Investor Deck', {
    x: 0.8, y: 3.6, w: 6.0, h: 0.5,
    fontFace: 'Source Sans 3', fontSize: 15, color: colors.muted
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.0, y: 1.1, w: 4.6, h: 4.9,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white, transparency: 0 },
    radius: 0.1
  });
  slide.addText('Vision', {
    x: 8.3, y: 1.5, w: 4.0, h: 0.4,
    fontFace: 'Manrope', fontSize: 20, bold: true, color: colors.primary, align: 'center'
  });
  slide.addText('Faster shortlists\nBetter conversions\nPredictable productivity', {
    x: 8.3, y: 2.2, w: 4.0, h: 2.0,
    fontFace: 'Source Sans 3', fontSize: 16, color: colors.text, align: 'center'
  });

  // Slide 2: Problem chart
  slide = pptx.addSlide();
  addCommon(slide, 'Problem: Fragmented Recruiting Workflows Hurt Placements', 2);
  bullets(slide, [
    'Candidate data scattered across sheets, email, and chat.',
    'Slow requirement-to-shortlist turnaround.',
    'Limited visibility into productivity and pipeline leakage.',
    'Legacy ATS tools are costly for SMB teams.'
  ], { x: 0.8, y: 1.3, w: 6.0, h: 4.6, fontSize: 18 });
  const problemRows = readCsv('problem-time-loss.csv');
  slide.addChart(pptx.ChartType.bar, [
    {
      name: 'Hours',
      labels: problemRows.map(r => r.Activity.replace(/_/g, ' ')),
      values: problemRows.map(r => Number(r.HoursLostPerWeek))
    }
  ], {
    x: 7.0, y: 1.4, w: 5.4, h: 4.5,
    barDir: 'bar',
    catAxisLabelRotate: -25,
    showLegend: false,
    showValue: true,
    valAxisMinVal: 0
  });

  // Slide 3
  slide = pptx.addSlide();
  addCommon(slide, 'Solution: One AI-Powered Operating Platform', 3);
  bullets(slide, [
    'Unified ATS workflows: candidates, clients, requirements, interviews, invoices.',
    'Embedded AI for parsing, scoring, summaries, and outreach drafting.',
    'Role-based dashboards for recruiters, managers, and owners.',
    'Credit-based AI usage model to control costs and grow ARPU.'
  ], { x: 0.8, y: 1.4, w: 11.8, h: 4.8, fontSize: 20 });

  // Slide 4 Flow
  slide = pptx.addSlide();
  addCommon(slide, 'Product Flow: Requirement to Placement', 4);
  const steps = ['Requirement', 'AI Match', 'Interview', 'Offer', 'Invoice'];
  steps.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8 + i * 2.35, y: 2.6, w: 2.0, h: 1.1,
      line: { color: colors.primary, pt: 1.5 },
      fill: { color: colors.white },
      radius: 0.08
    });
    slide.addText(s, {
      x: 0.8 + i * 2.35, y: 2.95, w: 2.0, h: 0.35,
      align: 'center',
      fontFace: 'Manrope', fontSize: 16, bold: true, color: colors.primary
    });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: 2.8 + i * 2.35, y: 2.95, w: 0.25, h: 0.35,
        line: { color: colors.accent, pt: 1 },
        fill: { color: colors.accent }
      });
    }
  });
  slide.addText('Result: faster shortlisting, better quality, and billing visibility.', {
    x: 1.2, y: 4.5, w: 11.0, h: 0.7,
    fontFace: 'Source Sans 3', fontSize: 19, color: colors.text
  });

  // Slide 5 Market
  slide = pptx.addSlide();
  addCommon(slide, 'Market Opportunity: TAM / SAM / SOM', 5);
  const market = readCsv('market-tam-sam-som.csv');
  slide.addChart(pptx.ChartType.bar, [{
    name: 'INR Cr',
    labels: market.map(r => r.Segment),
    values: market.map(r => Number(r.ValueINRCr))
  }], {
    x: 0.9, y: 1.5, w: 7.0, h: 4.8,
    barDir: 'col',
    showLegend: false,
    showValue: true,
    valAxisMinVal: 0
  });
  bullets(slide, [
    'TAM: INR 8,000 Cr',
    'SAM: INR 1,800 Cr',
    'SOM (3Y): INR 180 Cr',
    'Agency-first focused entry strategy'
  ], { x: 8.1, y: 1.8, w: 4.2, h: 4.6, fontSize: 18 });

  // Slide 6 Pricing + pie
  slide = pptx.addSlide();
  addCommon(slide, 'Business Model and Pricing', 6);
  bullets(slide, [
    'Starter: INR 2,999 / month',
    'Growth: INR 7,999 / month',
    'Business: INR 18,999 / month',
    'Yearly plans at 20% discount'
  ], { x: 0.8, y: 1.5, w: 6.2, h: 3.0, fontSize: 18 });
  const rev = readCsv('revenue-mix.csv');
  slide.addChart(pptx.ChartType.pie, [{
    labels: rev.map(r => r.RevenueStream.replace(/_/g, ' ')),
    values: rev.map(r => Number(r.Percent))
  }], {
    x: 7.1, y: 1.5, w: 5.2, h: 4.8,
    showLegend: true,
    legendPos: 'b',
    showPercent: true
  });

  // Slide 7 GTM
  slide = pptx.addSlide();
  addCommon(slide, 'Go-To-Market Funnel', 7);
  const gtm = readCsv('gtm-funnel.csv');
  slide.addChart(pptx.ChartType.bar, [{
    name: 'Count',
    labels: gtm.map(r => r.Stage.replace(/_/g, ' ')),
    values: gtm.map(r => Number(r.Count))
  }], {
    x: 0.9, y: 1.5, w: 7.7, h: 4.9,
    barDir: 'bar',
    showValue: true,
    showLegend: false,
    catAxisLabelRotate: -20
  });
  bullets(slide, [
    'Founder-led sales for first 20 accounts',
    'Webinars + outbound for next 80 accounts',
    '14-day trial to paid conversion model'
  ], { x: 8.8, y: 1.8, w: 3.6, h: 4.6, fontSize: 16 });

  // Slide 8 Competition scatter approximation via line chart points
  slide = pptx.addSlide();
  addCommon(slide, 'Competitive Positioning', 8);
  const cmp = readCsv('competitive-quadrant.csv');
  slide.addChart(pptx.ChartType.scatter, cmp.map((r) => ({
    name: r.Company.replace(/_/g, ' '),
    labels: [Number(r.WorkflowDepth)],
    values: [Number(r.PriceToValue)]
  })), {
    x: 0.9, y: 1.5, w: 7.8, h: 4.9,
    showLegend: true,
    legendPos: 'r',
    valAxisMinVal: 0,
    valAxisMaxVal: 100,
    catAxisMinVal: 0,
    catAxisMaxVal: 100
  });
  bullets(slide, [
    'High workflow depth',
    'Strong SMB price-to-value fit',
    'AI embedded in recruiter daily flow'
  ], { x: 8.9, y: 1.8, w: 3.5, h: 4.6, fontSize: 16 });

  // Slide 9 Milestones
  slide = pptx.addSlide();
  addCommon(slide, 'Execution Roadmap and Milestones', 9);
  const milestones = readCsv('milestones.csv');
  milestones.forEach((m, i) => {
    const y = 1.6 + i * 0.9;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.9, y, w: 1.8, h: 0.6,
      line: { color: colors.accent, pt: 1 },
      fill: { color: colors.accent },
      radius: 0.08
    });
    slide.addText(m.Month, {
      x: 0.9, y: y + 0.15, w: 1.8, h: 0.3,
      align: 'center',
      fontFace: 'Manrope', fontSize: 14, bold: true, color: colors.white
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 3.0, y, w: 9.2, h: 0.6,
      line: { color: colors.border, pt: 1 },
      fill: { color: colors.white },
      radius: 0.04
    });
    slide.addText(m.Milestone, {
      x: 3.2, y: y + 0.14, w: 8.8, h: 0.3,
      fontFace: 'Source Sans 3', fontSize: 14, color: colors.text
    });
  });

  // Slide 10 Financial
  slide = pptx.addSlide();
  addCommon(slide, 'Financial Snapshot: MRR vs Burn', 10);
  const fin = readCsv('mrr-vs-burn.csv');
  slide.addChart(pptx.ChartType.line, [
    {
      name: 'MRR (INR Lakhs)',
      labels: fin.map(r => r.Month),
      values: fin.map(r => Number(r.MRR_Lakhs))
    },
    {
      name: 'Burn (INR Lakhs)',
      labels: fin.map(r => r.Month),
      values: fin.map(r => Number(r.Burn_Lakhs))
    }
  ], {
    x: 0.9, y: 1.5, w: 7.8, h: 4.9,
    showLegend: true,
    legendPos: 'b',
    showValue: true
  });
  bullets(slide, [
    'MRR at 100 customers: INR 6.1L',
    'ARR at 100 customers: INR 73.2L',
    'Monthly burn at full ramp: INR 17.9L'
  ], { x: 8.9, y: 1.8, w: 3.5, h: 4.6, fontSize: 16 });

  // Slide 11 Use of funds
  slide = pptx.addSlide();
  addCommon(slide, 'Funding Ask: INR 2.2 Cr', 11);
  const uof = readCsv('use-of-funds.csv');
  slide.addChart(pptx.ChartType.doughnut, [{
    labels: uof.map(r => r.Category.replace(/_/g, ' ')),
    values: uof.map(r => Number(r.Percent))
  }], {
    x: 0.9, y: 1.5, w: 7.4, h: 4.9,
    showLegend: true,
    legendPos: 'r',
    showPercent: true
  });
  bullets(slide, [
    'Runway: 12 months',
    'Milestone-driven execution',
    'Build, launch, and scale to first 100 customers'
  ], { x: 8.6, y: 1.9, w: 3.9, h: 4.4, fontSize: 16 });

  // Slide 12 close
  slide = pptx.addSlide();
  addCommon(slide, 'Team and Closing', 12);
  bullets(slide, [
    'Core team: 2 Frontend, 2 Backend, 1 QA, 1 DevOps/Security, 1 PM, 1 UI/UX',
    'GTM: 1 Sales Lead, 2 Sales Executives, 1 Customer Success, 1 Marketer',
    'Commitment: launch-ready product in 4 months',
    'Ask: proceed to due diligence and term-sheet discussion'
  ], { x: 0.9, y: 1.8, w: 11.8, h: 4.8, fontSize: 18 });

  pptx.writeFile({ fileName: outFile }).then(() => {
    console.log(`Created: ${outFile}`);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

generate();
