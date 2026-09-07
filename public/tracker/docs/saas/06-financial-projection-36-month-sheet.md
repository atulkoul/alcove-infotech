# AlcoveHire 36-Month Financial Projection Sheet Format

Objective:
- Provide a spreadsheet-ready structure with formulas that can be filled and dragged for 36 months.

How to use:
- Create a workbook with 4 sheets: Assumptions, Monthly_Model, Staffing, Dashboard.
- Enter assumptions once; Monthly_Model formulas auto-calculate once dragged from row 2 to row 37.

## Sheet 1: Assumptions

Use this exact layout:

| Cell | Field | Value (Editable) |
|---|---|---:|
| B2 | Starter Price (INR) | 2999 |
| B3 | Growth Price (INR) | 7999 |
| B4 | Business Price (INR) | 18999 |
| B5 | Payment Gateway % | 2.0% |
| B6 | Starting Customers | 0 |
| B7 | Opening Cash (INR) | 22000000 |
| B8 | Churn Rate % Monthly | 2.5% |
| B9 | Starter Mix % | 60% |
| B10 | Growth Mix % | 30% |
| B11 | Business Mix % | 10% |
| B12 | Team Cost Month 1 | 850000 |
| B13 | Team Cost Month 5+ | 1374700 |
| B14 | Infra Cost Month 1 | 45000 |
| B15 | Infra Cost Month 5+ | 90500 |
| B16 | Sales and Marketing Month 1 | 80000 |
| B17 | Sales and Marketing Month 5+ | 275000 |
| B18 | G and A Monthly | 50000 |
| B19 | Funding Inflow Month 1 | 22000000 |

## Sheet 2: Monthly_Model

Headers in Row 1:
- A1 MonthNo
- B1 MonthLabel
- C1 OpeningCustomers
- D1 NewCustomers
- E1 ChurnRate
- F1 ChurnedCustomers
- G1 EndingCustomers
- H1 StarterCustomers
- I1 GrowthCustomers
- J1 BusinessCustomers
- K1 StarterMRR
- L1 GrowthMRR
- M1 BusinessMRR
- N1 TotalMRR
- O1 ARR
- P1 InfraCost
- Q1 AIandStorageCost
- R1 PaymentGatewayCost
- S1 TotalCOGS
- T1 GrossProfit
- U1 TeamCost
- V1 SalesMarketing
- W1 GAndA
- X1 TotalOpex
- Y1 EBITDA
- Z1 OpeningCash
- AA1 FundingInflow
- AB1 NetCashFlow
- AC1 ClosingCash
- AD1 RunwayMonths

Row 2 formulas (Month 1):
- A2: 1
- B2: "M01"
- C2: =Assumptions!B6
- D2: input manually
- E2: =Assumptions!B8
- F2: =ROUND(C2*E2,0)
- G2: =C2+D2-F2
- H2: =ROUND(G2*Assumptions!B9,0)
- I2: =ROUND(G2*Assumptions!B10,0)
- J2: =G2-H2-I2
- K2: =H2*Assumptions!B2
- L2: =I2*Assumptions!B3
- M2: =J2*Assumptions!B4
- N2: =K2+L2+M2
- O2: =N2*12
- P2: =IF(A2<5,Assumptions!B14,Assumptions!B15)
- Q2: input manually
- R2: =N2*Assumptions!B5
- S2: =P2+Q2+R2
- T2: =N2-S2
- U2: =IF(A2<5,Assumptions!B12,Assumptions!B13)
- V2: =IF(A2<5,Assumptions!B16,Assumptions!B17)
- W2: =Assumptions!B18
- X2: =U2+V2+W2
- Y2: =T2-X2
- Z2: =Assumptions!B7
- AA2: =Assumptions!B19
- AB2: =Y2+AA2
- AC2: =Z2+AB2
- AD2: =IF(Y2<0,AC2/ABS(Y2),999)

Row 3 formulas (copy pattern and drag to row 37):
- A3: =A2+1
- B3: ="M"&TEXT(A3,"00")
- C3: =G2
- D3: input manually
- E3: =Assumptions!B8
- F3: =ROUND(C3*E3,0)
- G3: =C3+D3-F3
- H3: =ROUND(G3*Assumptions!B9,0)
- I3: =ROUND(G3*Assumptions!B10,0)
- J3: =G3-H3-I3
- K3: =H3*Assumptions!B2
- L3: =I3*Assumptions!B3
- M3: =J3*Assumptions!B4
- N3: =K3+L3+M3
- O3: =N3*12
- P3: =IF(A3<5,Assumptions!B14,Assumptions!B15)
- Q3: input manually
- R3: =N3*Assumptions!B5
- S3: =P3+Q3+R3
- T3: =N3-S3
- U3: =IF(A3<5,Assumptions!B12,Assumptions!B13)
- V3: =IF(A3<5,Assumptions!B16,Assumptions!B17)
- W3: =Assumptions!B18
- X3: =U3+V3+W3
- Y3: =T3-X3
- Z3: =AC2
- AA3: =0
- AB3: =Y3+AA3
- AC3: =Z3+AB3
- AD3: =IF(Y3<0,AC3/ABS(Y3),999)

Drag all Row 3 formulas down to Row 37 for full 36-month projection.

## Sheet 3: Staffing

Columns:
- Role
- StartMonth
- Headcount
- CostPerPerson
- MonthlyCost
- AnnualCost

Formulas:
- MonthlyCost: =Headcount*CostPerPerson
- AnnualCost: =MonthlyCost*12

## Sheet 4: Dashboard

Add these KPI cells:
- Current MRR: =INDEX(Monthly_Model!N:N, MATCH(36, Monthly_Model!A:A, 0))
- ARR at Month 36: =INDEX(Monthly_Model!O:O, MATCH(36, Monthly_Model!A:A, 0))
- Total Customers Month 36: =INDEX(Monthly_Model!G:G, MATCH(36, Monthly_Model!A:A, 0))
- Cash Balance Month 36: =INDEX(Monthly_Model!AC:AC, MATCH(36, Monthly_Model!A:A, 0))
- Average EBITDA Margin Last 6 Months: =AVERAGE(Monthly_Model!Y32:Y37)/AVERAGE(Monthly_Model!N32:N37)

Recommended charts:
- MRR growth line chart (MonthNo vs TotalMRR)
- Burn vs Gross Profit dual line chart
- Cash balance runway line chart
- Customer growth area chart

## Quality Checks

- Check that Starter% + Growth% + Business% = 100%.
- Ensure churn rate stays within realistic range (1.5% to 4% monthly).
- Keep payment gateway cost linked to revenue.
- Validate that runway remains positive for planned period.
