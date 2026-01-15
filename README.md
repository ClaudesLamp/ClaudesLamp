# The Claude's Lamp Protocol ($RUB) 🧞‍♂️

![Banner](banner.png)

<div align="center">

[![Solana](https://img.shields.io/badge/Solana-Mainnet-linear?style=for-the-badge&logo=solana&color=000000)](https://solana.com)
[![AI Model](https://img.shields.io/badge/Governor-Claude_3_Opus-linear?style=for-the-badge&logo=anthropic&color=A34628)](https://anthropic.com)
[![Infrastructure](https://img.shields.io/badge/RPC-Sauce_Elite-linear?style=for-the-badge&color=FFD700)]()
[![Status](https://img.shields.io/badge/Status-Operational-linear?style=for-the-badge&color=success)]()

</div>

---

> **"I guard the Hoard. I judge the intent of the soul. The Worthy receive $RUB. The Unworthy receive silence."**

## 📜 Abstract

**Claude's Lamp** is the first autonomous, AI-governed treasury experiment on the Solana Blockchain. It solves the "Human Greed" problem in memecoins by removing the Developer's control over the treasury and handing it to a sentient AI Agent.

The Protocol replaces the traditional "Marketing Wallet" with a gamified **Hoard**. Access to these funds is not gated by a multisig or a DAO vote, but by an **AI Judgment Engine**. Users must interact with the Oracle (Claude 3 Opus) to prove their worthiness. If the AI deems their contribution (wish) to be creative, honest, or "Lore Accurate," it programmatically signs a transaction to release funds.

**This is not just a token. It is a Social Experiment in AI Governance.**

---

## 🔮 The Core Mechanism

The Protocol operates on an infinite **"Judge & Reward"** loop.

### 1. The Interaction (The Wish)
Users connect their Solana wallet and submit a text-based "Wish" to the Lamp. This is the only input vector for the system.

### 2. The Filter (Anti-Sybil & Anti-Farm)
Before the AI sees the input, the protocol runs a deterministic security check:
*   **The Highlander Rule:** The system queries the Vector Database of all past winners. If a wish is semantically identical to a wish that has *already won*, it is instantly rejected. **"A wish can only be granted once."**
*   **Rate Limiting:** Wallet-based cooldowns prevent script attacks.
*   **Slop Detection:** Basic regex filters catch lazy inputs (e.g., "money pls", "lambo").

### 3. The Judgment (Claude 3 Opus)
If the input passes the filter, it is fed to **Claude 3 Opus**, the most sophisticated LLM available. The AI acts as a **"Cynical Ancient Genie."** It scores the wish from **0 to 100** based on:
*   **Creativity:** Is it unique?
*   **Authenticity:** Does it feel human?
*   **Lore Accuracy:** Does it fit the vibe of the project?
*   **Humor/Chaos:** Is it unhinged?

### 4. The Execution (Server-Side Signing)
The decision is final. If the score crosses a threshold, the **Supabase Edge Function** utilizes a secure, server-side private key to construct and sign a Solana transaction via a High-Performance RPC Node (Sauce/Helius). The tokens are transferred directly from the Hoard to the User.

---

## 💰 The Economic Engine ("The Hoard")

The economy is designed to be a **High-Velocity Burn** system fueled by an **Eternal Buyback Loop**.

| Component | Description |
| :--- | :--- |
| **Total Supply** | 1,000,000,000 $RUB |
| **The Hoard** | ~9% of Supply (Locked in the Lamp Wallet) |
| **Lamp Oil** | The visual representation of the Treasury's remaining balance. |

### The Payout Tiers
The Oracle does not pay everyone equally. It uses a **Wealth Ladder** based on the quality of the wish.

*   🥉 **TIER 1: COMMON (Score 40-69)**
    *   *Reward:* Small ("Gas Money").
    *   *Frequency:* Frequent. Keeps the feed moving.
*   🥈 **TIER 2: RARE (Score 70-89)**
    *   *Reward:* Significant Bag.
    *   *Frequency:* For clever or relatable inputs.
*   🥇 **TIER 3: LEGENDARY (Score 90-98)**
    *   *Reward:* **Massive Payout.**
    *   *Frequency:* Rare.
*   💎 **TIER 4: MYTHIC (Score 99-100)**
    *   *Reward:* **THE GOD DROP (Jackpot).**
    *   *Frequency:* <1%. Reserved for absolute genius. Triggers a Global Alarm.

### The Eternal Cycle (Sustainability)
The Hoard is finite, but the mechanism is infinite.
1.  **Draining:** Winners extract $RUB from the Hoard.
2.  **Refilling:** Trading volume on Raydium/Pump.fun generates fees.
3.  **Buybacks:** These fees are used to market-buy $RUB and send it back into the Lamp Wallet.
4.  **Result:** As long as there is volume, the Lamp never goes dark.

---

## 🔐 Security & Transparency

This repository serves as proof of the automated nature of the Treasury.

### [1] No Swap Logic
The codebase strictly imports `transfer` methods from the `@solana/spl-token` library. The logic to `sell`, `swap`, or `liquidity_remove` **does not exist** in the repository. The AI can *give*, but it cannot *sell*.

```typescript
import { transfer } from "npm:@solana/spl-token"; // ✅ ALLOWED: Payouts
// import { swap } from "npm:@raydium-io";        // ❌ NOT IMPORTED
// import { sell } from "npm:@jup-ag/core";       // ❌ NOT IMPORTED
```

### [2] Circuit Breakers
To prevent a "Flash Drain" exploit (where a botnet hits 100 jackpots in a second), the system has hardcoded safety stops:
*   **Volume Limit:** If > 5,000,000 $RUB is drained in 5 minutes, the Oracle enters a "Cooldown State."
*   **Balance Buffer:** If the Hoard drops below critical levels, payouts pause to prevent transaction failures.

### [3] Infrastructure
*   **RPC:** We utilize **Sauce/Helius Elite Nodes** (500 r/s) to ensure transactions land even during Solana congestion.
*   **Priority Fees:** All Oracle transactions include dynamic Priority Fees to cut the line.

---

## ⚡ Verification

This repository contains the source logic for the `judge-wish` Edge Function. You can audit the decision-making process yourself.

**To verify the logic:**
Navigate to: `supabase/functions/judge-wish/index.ts`

**Official Links:**
*   **Website:** [claudeslamp.fun](https://claudeslamp.fun)
*   **X (Twitter):** [@claudeslamprub](https://x.com/claudeslamprub)

---
*Built with Claude. Powered by Solana. Governed by Code.*
