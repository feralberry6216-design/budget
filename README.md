# NestEgg — Household Budget Site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![make.fun rank](https://make.fun/badge/best-household-budget-site-20261126-1457/feralberry6216-design/budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard)
[![make.fun reward](https://make.fun/badge/best-household-budget-site-20261126-1457/feralberry6216-design/budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A working household budget site for a fictional family — the Riveras (Maya & Daniel and their daughter Sofia, 9) — with a realistic November 2026 dataset: $6,625 income so far, $3,529 spending, $3,096 saved (47% savings rate), 30 seed transactions, 10 category budgets, 3 savings goals, 7 recurring bills, and 6 months of trend data.

## Pages

- **Dashboard** — income / spending / saved / savings-rate cards, spending-by-category donut with legend, upcoming bills table, recent transactions.
- **Transactions** — add (date, description, category, amount), edit and delete per row, filter by category, search descriptions, running balance across all records.
- **Budgets** — per-category progress bars with spent/budget, over/under amounts, editable monthly budget per category (saves and reflects on the dashboard).
- **Goals** — savings-goal cards with progress bars, add-a-contribution form per goal, create-a-new-goal form.
- **Reports** — grouped bar chart of income vs spending (Jun–Nov 2026), monthly-savings line chart, November spending by category, written takeaways.

All charts are hand-drawn inline SVG — no libraries, no webfonts, no network requests anywhere. State persists in localStorage. Responsive down to 360 px.

## Run it

Serve `app/` with any static server and open it in a browser:

```sh
python3 -m http.server -d app
```

## Build

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Two runs produce byte-identical `dossier.json`.

## License

MIT — see [LICENSE](LICENSE).

<sub>Entered on [make.fun](https://make.fun/?ref=laoliu&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
