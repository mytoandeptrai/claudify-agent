# Solidity & Smart Contract (SMC) Security Skill

## 1. Smart Contract Security Mandates (Critical)
Smart contract bugs mean irreversible financial loss. Every smart contract edit MUST satisfy:
- **Reentrancy Protection:**
  - Always implement OpenZeppelin's `ReentrancyGuard` with `nonReentrant` on external state-changing functions.
  - Follow the **CEI Pattern (Checks-Effects-Interactions)** strictly: Perform validations, update internal contract state, and ONLY THEN perform external calls or token transfers.
- **Access Control:**
  - Explicitly restrict administrative functions using `Ownable2Step` (prevents accidental transfer to wrong address) or `AccessControl`.
  - Validate address parameters against `address(0)` in constructors and setters.
- **Integer & Math Safety:**
  - Use Solidity `^0.8.20+` for built-in overflow/underflow checks.
  - Avoid `unchecked` blocks unless gas optimization is strictly benchmarked and proven provably safe.

## 2. Gas Optimization Protocols
- Cache storage variables (`sload`) into memory/local stack variables before reading in loops.
- Use `uint256` in state variables where packing isn't possible (EVM native word size).
- Mark functions `external` instead of `public` if they are never invoked internally within the contract.
- Use custom errors `error Unauthorized()` instead of long `require(..., "string message")` to save deployment and execution gas.

## 3. Local Verification Loop (Hardhat & Foundry)
Execute local compilation and security suite:
```bash
forge build --sizes       # Foundry contract compilation & size check
forge test -vvv           # Unit & Fuzz testing
slither .                 # Static analysis vulnerability scanner
```

## 4. Anti-Patterns to Avoid
- ❌ Do NOT use `tx.origin` for authorization; always use `msg.sender`.
- ❌ Do NOT use `block.timestamp` or `blockhash` as sources of randomness (use Chainlink VRF).
- ❌ Do NOT perform transfer calls with raw `.call.value()()` without checking boolean return value and reentrancy guards.
