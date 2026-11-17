// StaggeredHold — a long-only cbBTC bot for agent-fun/bars-replay/v1.
//
// Idea: the replay fills every order at the next bar's open against a
// constant-product pool whose depth resets every bar, charging 4 bps fee,
// 2 bps modelled slippage, plus price impact of roughly a/D on a trade worth
// a against depth D. A single $1,000 buy meets about 13 bps of impact on the
// dev window's depths (~$790k); ten $100 buys meet about 1.3 bps each. So
// the bot enters in ten equal tranches, one per bar over the first ten bars,
// then holds the whole position to the end of the window, when the replay
// flattens it. That is the whole strategy: full long exposure for the race,
// with the entry's market impact cut to roughly a tenth.
//
// Why hold instead of trading: on 1-minute bars the noise (about 6 bps
// standard deviation per bar on the dev window) is far larger than any
// edge a fast signal can extract once a ~26 bps round trip is paid, and
// every extra trade is another 26 bps gone. The dev window's own baselines
// show it: the EMA-cross, ADX-momentum and RSI-Bollinger house bots all
// lose money there, while buy-and-hold makes money. So this bot does not
// chase bars; it buys the asset and keeps it.
//
// Determinism: every decision is a pure function of the batch sequence
// number and hello (no clock, no randomness, no network, no files). Two
// executions on the same data produce the same orders.
//
// Local grade on the dev window (kit grade-local, process driver):
// net PnL +3.752362 USDC, 10 trades, 0 rejected, max drawdown 2.12%,
// L1 regrade reproduced byte for byte. That clears the dev gate
// (net PnL above $0), so this entry races.

import { runBars } from './vendor/makefun-bars.ts';

/** Ten equal tranches, one per bar, over the first ten bars. */
const TRANCHES = 10;
/** 1% past the close the order was decided on; 1-minute moves on the dev
 *  window never exceeded 50 bps, so a 1% cap only refuses freak bars. */
const MAX_SLIPPAGE_BPS = 100;

await runBars({
  onBatch(state) {
    // Batches before the scored window (warm-up) never trade; seq counts
    // them, so index into the scored window by subtracting them.
    const idx = state.seq - state.warmupBars;
    if (idx < 0 || idx >= TRANCHES) return [];
    const symbol = state.hello.symbols[0];
    if (symbol === undefined) return [];
    const start = BigInt(state.hello.capital.quote_units);
    const tranche = start / BigInt(TRANCHES);
    if (tranche <= 0n || state.cash < tranche) return [];
    return [
      {
        side: 'buy',
        symbol: symbol.symbol,
        notional_quote_units: tranche,
        max_slippage_bps: MAX_SLIPPAGE_BPS,
      },
    ];
  },
});
