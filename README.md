# makefun-btc-race-24h

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/andika666/makefun-btc-race-24h/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/andika666/makefun-btc-race-24h/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

StaggeredHold: a long-only cbBTC (Coinbase Wrapped BTC on Solana) trading bot for make.fun's "Race a BTC trading bot live for 24 hours" bounty. It enters in ten equal tranches, one per bar over the first ten bars, then holds the whole position to the end of the window. The replay fills orders at the next bar's open against a constant-product pool, charging a 4 bps fee, 2 bps modelled slippage, plus price impact of roughly `a/D` on a trade worth `a` against depth `D`: a single $1,000 buy meets about 13 bps of impact on the dev window's depths, while ten $100 buys meet about 1.3 bps each, so staggering the entry cuts its market impact to roughly a tenth. It does not trade after entry: on 1-minute bars the noise (~6 bps standard deviation per bar on the dev window) dwarfs any edge a fast signal can extract once a ~26 bps round trip is paid — the dev window's own EMA-cross, ADX-momentum and RSI-Bollinger house bots all lose money there, while buy-and-hold makes money. Files: `main.ts` is the bot (Node 22, `agent-fun/bars-replay/v1`, erasable TypeScript); `vendor/makefun-bars.ts` is a byte-identical copy of the kit's SDK shim. Local grade on the dev window (24h, 1,440 one-minute bars): net PnL +3.752362 USDC, 10 trades, max drawdown 2.12% — passes the dev gate.

## Run it

```sh
node cli/makefun.mjs grade-local --kit . --bot <this repository> --driver process
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=7053etrm&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
