# Thrivefold — Rewards and Wallet Implementation

> **Authoritative Wallet Ledger Model**  
> **Source:** `Apps/thrivefold/src/stores/slices/questSlice.ts`

---

## 1. Wallet Balance & Transactional Ledger

Thrivefold uses an immutable append-only ledger (`rewardLedger: LedgerEntry[]`) stored in Zustand and persisted via MMKV with non-destructive nullish coalescing.

### Currencies Computed Deterministically:
1. **Diamonds (Amber Gems)**:
   ```ts
   totals.diamonds = ledger.reduce((acc, entry) => acc + (entry.diamonds || 0), 0);
   ```
2. **Sanctuary Tickets**:
   ```ts
   ticketsFromLedger(ledger) = forgedTickets - spentTickets;
   ```
3. **Golden Marketplace Tokens**:
   ```ts
   tokensFromLedger(ledger) = forgedTokens - spentTokens;
   ```

---

## 2. Idempotent Purchase Transaction Flow

When a user initiates an unlock via `buyMarketItem(itemId, currency)`:

1. **Balance Check**:
   - `gems`: verifies `diamonds >= item.cost`.
   - `tickets`: verifies `tickets >= (item.ticketCost ?? 1)`.
   - `tokens`: verifies `tokens >= (item.tokenCost ?? 1)`.
2. **Duplicate Prevention**:
   - Digital items (stickers, status): checks `state.marketOwned.includes(itemId)`. Returns `{ ok: false, reason: 'owned' }` if already owned.
   - Physical items: permits multiple orders, assigning a unique timestamped key `market:${itemId}:${Date.now()}`.
3. **Ledger Commit**:
   - Creates an entry with kind `'market_spend'`.
   - Subtracts the exact cost from the appropriate currency balance (`diamonds: -item.cost`).
   - Appends atomically to the ledger and recalculates balances synchronously.
4. **Immediate Feedback**:
   - Shows feedback toast (`Unlocked [Item Title]!`).
   - Triggers haptic feedback (`hapticSuccess()`).
   - Updates UI instantly without network latency.

---

## 3. Forging Pipeline

- **Forge Ticket**:
  - `diamonds >= 500` ➔ deducts 500 Gems, adds 1 Ticket.
- **Forge Token**:
  - `tickets >= 5` ➔ converts 5 Tickets into 1 Token.
  - `diamonds >= 2500` ➔ converts 2,500 Gems directly into 1 Token.

