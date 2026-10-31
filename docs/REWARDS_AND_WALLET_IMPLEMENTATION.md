# Thrivefold — Rewards and Wallet Implementation

> **Authoritative Wallet Ledger Model & Lifecycle**  
> **Source:** `Apps/thrivefold/src/stores/slices/questSlice.ts`, `src/domain/game/rewards.ts`

---

## 1. Wallet Balance & Transactional Ledger

Thrivefold uses an immutable append-only ledger (`rewardLedger: LedgerEntry[]`) stored in Zustand and persisted via encrypted MMKV with non-destructive nullish coalescing.

### Currencies Computed Deterministically
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

## 2. Complete Purchase Transaction Lifecycle

```
[Marketplace Home] ──► [Select Item] ──► [Item Detail Sheet] ──► [Balance Verification]
        │
        ▼
[Confirmation Prompt] ──► [Authoritative Ledger Spend] ──► [Grant Ownership] ──► [Success Modal]
        │
        ▼
[Inventory Updated] ──► [Real Usage: Equip / Active Toggle]
```

### Transaction Steps
1. **Balance Check**:
   - `gems`: verifies `diamonds >= item.cost`.
   - `tickets`: verifies `tickets >= (item.ticketCost ?? 1)`.
   - `tokens`: verifies `tokens >= (item.tokenCost ?? 1)`.
   - UI clearly shows `Unlock Price` vs `Your Balance` with `AVAILABLE TO UNLOCK` or `INSUFFICIENT GEMS/TOKENS/TICKETS` badge.
2. **Duplicate Prevention**:
   - Digital items (stickers, status badges): checks `state.marketOwned.includes(itemId)`. Returns `{ ok: false, reason: 'owned' }` if already owned.
   - Physical items: permits multiple orders, assigning a unique timestamped key `market:${itemId}:${Date.now()}`.
3. **Confirmation Dialog**:
   - Explains the exact currency deduction before any commit.
4. **Ledger Commit**:
   - Creates an entry with kind `'market_spend'`.
   - Subtracts the exact price (`diamonds: -item.cost` or decrements token/ticket balance).
   - Commits atomically to `rewardLedger` and recalculates derived balances synchronously.
5. **Ownership & Immediate UI Feedback**:
   - Unlocked item appears in `marketOwned` immediately.
   - Displays celebratory `Item Unlocked!` sheet with direct options to:
     - "Equip as Active Sticker" (for stickers).
     - "View in Inventory".
     - "Continue Browsing".

---

## 3. Item Usage & Active State

Purchasing an item has direct functional consequences:
- **Equipping Stickers**:
  - Tapping "Equip as Active Sticker" invokes `setActiveSticker(itemId)`.
  - The equipped sticker is persisted in Zustand/MMKV under `activeSticker`.
  - Displayed on the user's Profile, companion Coach, and Dashboard header.
  - Can be unequipped or swapped at any time from Marketplace or Inventory.
- **Physical Gear Requests**:
  - Submits recipient name, phone, and delivery address.
  - Recorded in the ledger and displayed under Inventory as "In Processing".
- **Milestone Cards**:
  - Permanent cards unlocked via milestone chests are cataloged in Inventory with full card artwork, rarity tier, and lore.

---

## 4. Currency Forging Pipeline

- **Forge Ticket**:
  - `diamonds >= 500` ➔ deducts 500 Gems, adds 1 Ticket.
- **Forge Token**:
  - `tickets >= 5` ➔ converts 5 Tickets into 1 Token.
  - `diamonds >= 2500` ➔ converts 2,500 Gems directly into 1 Token.

All forging actions validate balances, commit atomic spend records to `rewardLedger`, and provide tactile haptic confirmations.
