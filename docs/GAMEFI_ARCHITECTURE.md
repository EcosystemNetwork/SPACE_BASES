# 🎮 SPACE_BASES GameFi Architecture Specification
## DeFi Kingdoms-Style Game on Mantle Network

**Version:** 1.0.0  
**Target Chain:** Mantle Network (EVM L2)  
**Author:** Senior Solidity + GameFi Architect  
**Date:** December 2024

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Token & Economic Layer](#2-token--economic-layer-on-mantle)
3. [Bridging & Cross-Chain Design](#3-bridging--cross-chain-design)
4. [Hero & Item NFT Design](#4-hero--item-nft-design)
5. [Quest / Game-Loop Smart Contracts](#5-quest--game-loop-smart-contracts)
6. [DEX / LP / Staking Subsystem](#6-dex--lp--staking-subsystem)
7. [Access Control, Governance & Security](#7-access-control-governance--security)
8. [Indexing, Subgraphs & Off-Chain Services](#8-indexing-subgraphs--off-chain-services)
9. [Front-End / Wallet Integration](#9-front-end--wallet-integration)
10. [Dev Tooling, Testing & Deployment](#10-dev-tooling-testing--deployment)
11. [Migration / Compatibility](#11-migration--compatibility-with-existing-dfk-ecosystems)
12. [Final Deliverables](#12-final-deliverables)

---

## 1. High-Level Architecture

### 1.1 System Overview

SPACE_BASES is a fully on-chain GameFi ecosystem on Mantle Network, inspired by DeFi Kingdoms. The architecture follows a modular design pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER (Next.js/React)              │
│  - Wallet Integration (Wagmi/RainbowKit)                            │
│  - Game UI (Heroes, Quests, Marketplace, DEX)                       │
│  - Subgraph Queries (The Graph)                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SMART CONTRACT LAYER                         │
│                                                                      │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐             │
│  │  TOKEN LAYER  │  │   NFT LAYER  │  │  DEX LAYER  │             │
│  │               │  │              │  │             │             │
│  │ • QUANTUM     │  │ • Heroes     │  │ • AMM       │             │
│  │ • CRYSTAL     │  │ • Pets       │  │ • Router    │             │
│  │ • JADE        │  │ • Items      │  │ • Factory   │             │
│  └───────────────┘  │ • Land       │  │ • Pairs     │             │
│                     └──────────────┘  └─────────────┘             │
│                                                                      │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐             │
│  │  QUEST ENGINE │  │  STAKING     │  │ MARKETPLACE │             │
│  │               │  │              │  │             │             │
│  │ • Gardening   │  │ • LP Gardens │  │ • Auction   │             │
│  │ • Mining      │  │ • MasterChef │  │ • Fixed     │             │
│  │ • Foraging    │  │ • Rewards    │  │ • Tavern    │             │
│  │ • Fishing     │  │              │  │             │             │
│  │ • Combat      │  │              │  │             │             │
│  └───────────────┘  └──────────────┘  └─────────────┘             │
│                                                                      │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐             │
│  │  SUMMONING    │  │  TREASURY    │  │   BRIDGE    │             │
│  │  PORTAL       │  │  & BANK      │  │  ADAPTER    │             │
│  └───────────────┘  └──────────────┘  └─────────────┘             │
│                                                                      │
│  ┌───────────────────────────────────────────────────┐             │
│  │         CORE INFRASTRUCTURE                        │             │
│  │  • AccessControl • Pausable • VRF • Timelock      │             │
│  └───────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                              │
│  - Chainlink VRF (Randomness)                                       │
│  - The Graph (Indexing)                                             │
│  - LayerZero (Cross-chain Bridge)                                   │
│  - Mantle RPC & Block Explorer                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Contract Modules

#### **A. Token Contracts**

1. **QUANTUM Token (Main ERC-20)**
   - Primary game economy token
   - Used for: DEX trading, quest rewards, staking, governance
   - Upgradeable: NO (immutable for trust)
   - Pattern: Standard ERC-20 with mint/burn capabilities

2. **CRYSTAL Token (Expansion ERC-20)**
   - Secondary reward token for specific realms
   - Used for: Rare quest rewards, special crafting
   - Upgradeable: NO

3. **JADE Token (Locked Governance ERC-20)**
   - Staked QUANTUM → JADE (vote-escrowed model)
   - Used for: Governance voting, protocol fees distribution
   - Upgradeable: NO

#### **B. NFT Contracts**

1. **HeroCore (ERC-721)**
   - Heroes as unique NFTs
   - Fully on-chain stats and metadata
   - Upgradeable: YES (UUPS proxy for game balance patches)
   - Extensions: HeroStats, HeroQuesting, HeroSummoning

2. **PetCore (ERC-721)**
   - Pets that accompany heroes on quests
   - Upgradeable: YES (UUPS)

3. **ItemCore (ERC-1155)**
   - Consumables, equipment, crafting materials
   - Semi-fungible tokens (same item type = same ID)
   - Upgradeable: YES (UUPS)

4. **LandCore (ERC-721)**
   - Land plots for player kingdoms
   - Upgradeable: YES (UUPS)

#### **C. DEX & LP Contracts**

1. **QuantumFactory (Uniswap V2 Fork)**
   - Creates trading pairs
   - Upgradeable: NO (immutable for security)

2. **QuantumRouter**
   - Handles swaps, adding/removing liquidity
   - Upgradeable: NO

3. **QuantumPair (ERC-20)**
   - LP token for each trading pair
   - Upgradeable: NO

4. **LPGarden (MasterChef-style)**
   - Staking LP tokens for QUANTUM rewards
   - Upgradeable: YES (Transparent Proxy for emission changes)

#### **D. Quest & Profession Contracts**

1. **QuestEngine (Core Logic)**
   - State machine for quest lifecycle
   - Upgradeable: YES (UUPS for adding new quest types)

2. **ProfessionManager**
   - Tracks hero profession skills (mining, gardening, fishing, etc.)
   - Upgradeable: YES (UUPS)

3. **Quest Modules** (Individual contracts)
   - GardeningQuest
   - MiningQuest
   - ForagingQuest
   - FishingQuest
   - CombatQuest
   - Upgradeable: YES (UUPS)

#### **E. Marketplace Contracts**

1. **TavernMarketplace**
   - Hero auction house (English & Dutch auctions)
   - Fixed-price listings
   - Upgradeable: YES (UUPS for fee changes)

2. **ItemMarketplace**
   - ERC-1155 item trading
   - Upgradeable: YES (UUPS)

#### **F. Summoning & Special Mechanics**

1. **SummoningPortal**
   - Burn two parent heroes + QUANTUM → mint new hero
   - Gene mixing, rarity calculation
   - Upgradeable: YES (UUPS for genetic algorithm tweaks)

2. **Bank (Treasury)**
   - Collects protocol fees
   - Distributes to JADE stakers
   - Upgradeable: YES (Transparent Proxy)

3. **BridgeAdapter**
   - Interfaces with LayerZero for cross-chain operations
   - Upgradeable: YES (UUPS for bridge upgrades)

### 1.3 Contract Interaction Flow

**Example: Complete Hero Quest Flow**

```
User → HeroCore.approveQuestEngine()
    → QuestEngine.startQuest(heroId, questType)
        → HeroCore.lockHero(heroId)
        → ProfessionManager.checkSkills(heroId)
        → emit QuestStarted(heroId, timestamp)
    
[TIME PASSES - Quest Duration]

User → QuestEngine.completeQuest(heroId)
    → VRFConsumer.requestRandomness()
        → Chainlink VRF → callback
    → QuestEngine._resolveQuest(heroId, randomness)
        → Calculate rewards based on stats + randomness
        → QUANTUM.mint(user, rewardAmount)
        → ItemCore.mint(user, itemId, itemAmount)
        → ProfessionManager.gainXP(heroId, profession)
        → HeroCore.unlockHero(heroId)
        → emit QuestCompleted(heroId, rewards)
```

### 1.4 Upgradeability Strategy

**UUPS (EIP-1822) for:**
- Game mechanics that need balancing (HeroCore, QuestEngine, SummoningPortal)
- Marketplace (fee adjustments)
- New feature additions

**Transparent Proxy for:**
- Critical economic contracts (LPGarden, Bank)
- Requires ProxyAdmin for extra security layer

**Immutable (No Proxy) for:**
- ERC-20 tokens (QUANTUM, CRYSTAL, JADE)
- DEX core (Factory, Router, Pairs)
- **Reason:** Trust maximization - users need assurance token economics won't change

**Upgrade Process:**
1. Multisig proposes upgrade
2. 48-hour timelock delay
3. Community can exit if they disagree (rage quit)
4. Execute upgrade after timelock


---

## 2. Token & Economic Layer on Mantle

### 2.1 QUANTUM Token Specification

**Token Details:**
- **Name:** QUANTUM
- **Symbol:** QNTM
- **Decimals:** 18
- **Total Supply:** 500,000,000 QNTM (hard cap)
- **Chain:** Mantle Network (native)
- **Standard:** ERC-20
- **Contract Type:** Immutable (no proxy)

**Roles & Use Cases:**
1. **In-Game Currency:** Buy items, pay quest fees, summon heroes
2. **DEX Trading:** Primary trading pair (QNTM/MNT, QNTM/USDC)
3. **LP Staking:** Stake LP tokens to earn QNTM rewards
4. **Governance:** Stake QNTM → get JADE → vote on proposals
5. **Quest Rewards:** Earned from completing quests and professions

### 2.2 Token Distribution & Emission

**Initial Allocation (at launch):**

| Category | Allocation | Amount | Vesting |
|----------|-----------|--------|---------|
| Quest Rewards Pool | 40% | 200M QNTM | Emitted over 5 years |
| LP Staking Rewards | 25% | 125M QNTM | Emitted over 4 years |
| Team & Development | 15% | 75M QNTM | 4-year linear vest, 1-year cliff |
| Treasury & Ecosystem | 10% | 50M QNTM | Controlled by governance |
| Liquidity Bootstrap | 5% | 25M QNTM | Immediate (paired with MNT) |
| Airdrop & Migration | 5% | 25M QNTM | Distributed to early adopters |

**Emission Schedule:**

```solidity
// Quest Rewards: Decreasing by 10% annually
Year 1: 50M QNTM (136,986 QNTM/day)
Year 2: 45M QNTM (123,287 QNTM/day)
Year 3: 40.5M QNTM (110,958 QNTM/day)
Year 4: 36.45M QNTM (99,863 QNTM/day)
Year 5: 32.8M QNTM (89,863 QNTM/day)
Total: 204.75M QNTM (remaining 4.75M buffer for governance)

// LP Staking: Exponential decay
Year 1: 50M QNTM
Year 2: 37.5M QNTM
Year 3: 25M QNTM
Year 4: 12.5M QNTM
```

### 2.3 CRYSTAL & JADE Tokens

**CRYSTAL (Secondary Reward Token):**
- **Symbol:** CRYST
- **Supply:** 100,000,000 CRYST (uncapped, controlled mint)
- **Purpose:** Reward for rare/hard quests, special events
- **Emission:** Controlled by QuestEngine governance
- **Use:** Craft legendary items, buy rare pets, access exclusive content

**JADE (Governance Token):**
- **Symbol:** JADE
- **Supply:** Dynamic (backed 1:1 by staked QNTM)
- **Mechanism:** Vote-escrow (veTokenomics)
  - Lock QNTM for 1 week → 4 years
  - Longer lock = more JADE voting power
  - Example: Lock 1000 QNTM for 4 years → 1000 JADE
  - Lock 1000 QNTM for 1 year → 250 JADE
- **Benefits:**
  - Governance voting rights
  - Protocol fee share (50% of all fees)
  - Boosted quest rewards (up to 2.5x multiplier)

### 2.4 Mint & Burn Mechanics

**QUANTUM Minting:**
```solidity
// Only authorized minters can mint (QuestEngine, LPGarden)
mapping(address => bool) public minters;

function mint(address to, uint256 amount) external onlyMinter {
    require(totalSupply() + amount <= MAX_SUPPLY, "Cap exceeded");
    _mint(to, amount);
}
```

**QUANTUM Burning:**
- Heroes summoning: 50-200 QNTM per summon (burned)
- Item crafting: Variable amounts burned
- Deflationary mechanism to balance emissions

**Fee Structure:**
- DEX swap fees: 0.3% (0.25% to LPs, 0.05% to treasury)
- Marketplace fees: 2.5% (1.5% to treasury, 1% to JADE stakers)
- Summoning fees: Variable (50% burned, 50% to treasury)

### 2.5 Gas Abstraction & UX on Mantle

**Mantle Gas Context:**
- Mantle uses MNT for gas (ERC-20 token)
- Gas costs ~90% cheaper than Ethereum mainnet
- Average quest transaction: ~$0.10-0.50 USD

**UX Improvements:**

1. **Gasless Transactions (EIP-2771 Meta-Transactions):**
   ```solidity
   // Trusted forwarder pattern
   contract HeroCore is ERC2771Context {
       function startQuest(uint256 heroId) external {
           address user = _msgSender(); // Gets real sender even via relayer
           // ... quest logic
       }
   }
   ```
   - Users sign messages off-chain
   - Relayer pays gas and submits transaction
   - Cost recovered from quest rewards (optional 0.5% fee)

2. **Batch Transactions:**
   ```solidity
   // MultiCall contract for batching
   function multicall(bytes[] calldata data) external {
       for (uint i = 0; i < data.length; i++) {
           (bool success, ) = address(this).delegatecall(data[i]);
           require(success);
       }
   }
   ```

3. **Quest Completion Gas Optimization:**
   - Use commit-reveal for randomness (1 tx upfront, 1 tx reveal)
   - Batch multiple quest completions in single transaction
   - Off-chain computation with on-chain verification

**Who Pays Gas:**
- **Default:** User pays gas in MNT
- **Optional:** Protocol-subsidized relayer for first 10 quests (onboarding)
- **Power Users:** Can acquire MNT via DEX or bridge from Ethereum

---

## 3. Bridging & Cross-Chain Design

### 3.1 Bridge Architecture

**Primary Bridge: LayerZero V2**

**Why LayerZero:**
- ✅ Battle-tested with $6B+ in volume
- ✅ Supports arbitrary message passing (not just tokens)
- ✅ Security via DVN (Decentralized Verifier Networks)
- ✅ Can bridge NFTs with full metadata
- ✅ Native support for Mantle

**Alternative/Backup: Mantle Canonical Bridge**
- Use for MNT ↔ ETH transfers
- Slower (7-day withdrawal) but maximum security
- Fallback if LayerZero has issues

### 3.2 Token Bridge Design

**Scenario 1: New Native QUANTUM on Mantle**
- QUANTUM is native to Mantle (no bridging needed)
- Users on other chains can bridge assets TO Mantle
- Lock-and-mint: Lock JEWEL on DFK Chain → mint QUANTUM on Mantle

**Bridge Contracts:**

```solidity
// On DFK Chain (Avalanche subnet)
contract JEWELVault {
    IERC20 public JEWEL;
    
    function lockAndBridge(uint256 amount, address recipient) external {
        JEWEL.transferFrom(msg.sender, address(this), amount);
        
        bytes memory payload = abi.encode(recipient, amount);
        _lzSend(MANTLE_CHAIN_ID, payload, payable(msg.sender), address(0), "", "");
        
        emit TokensLocked(msg.sender, recipient, amount);
    }
}

// On Mantle
contract QUANTUMMinter is ILayerZeroReceiver {
    IQUANTUM public QUANTUM;
    
    function lzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64,
        bytes memory _payload
    ) external override onlyLzEndpoint {
        (address recipient, uint256 amount) = abi.decode(_payload, (address, uint256));
        
        require(isTrustedSource(_srcChainId, _srcAddress), "Untrusted source");
        
        // Mint equivalent QUANTUM (1:1 ratio)
        QUANTUM.mint(recipient, amount);
        
        emit TokensBridged(_srcChainId, recipient, amount);
    }
}
```

**Exchange Rate:** 1 JEWEL = 1 QUANTUM (fixed at launch)

### 3.3 NFT Bridge Design

**Challenge:** Bridge heroes with full stats, levels, quest history

**Solution: Full Metadata Bridge**

```solidity
struct HeroBridgeData {
    uint256 tokenId;
    uint256 level;
    uint256 xp;
    uint8 rarity;
    uint8 class;
    uint256 summonedTime;
    uint256[6] stats; // STR, DEX, AGI, VIT, INT, WIS
    uint256[10] professionSkills;
    uint256 summons; // Number of times hero has summoned
    bytes32 visualDNA; // Appearance genes
    bytes32 statDNA; // Hidden growth genes
}

// On source chain
function bridgeHero(uint256 heroId, uint16 dstChainId) external {
    require(ownerOf(heroId) == msg.sender, "Not owner");
    
    // Lock (burn) hero on source chain
    _burn(heroId);
    
    // Encode full hero data
    HeroBridgeData memory data = _getHeroData(heroId);
    bytes memory payload = abi.encode(heroId, msg.sender, data);
    
    // Send via LayerZero
    _lzSend(dstChainId, payload, payable(msg.sender), address(0), "", "");
    
    emit HeroBridged(heroId, msg.sender, dstChainId);
}

// On destination chain (Mantle)
function lzReceive(uint16, bytes memory, uint64, bytes memory _payload) external override {
    (uint256 heroId, address owner, HeroBridgeData memory data) = 
        abi.decode(_payload, (uint256, address, HeroBridgeData));
    
    // Mint hero with preserved data
    _mint(owner, heroId);
    heroes[heroId] = data;
    
    emit HeroReceived(heroId, owner);
}
```

**Key Considerations:**
- **Uniqueness:** Use deterministic tokenId across chains (hash of original chain + original tokenId)
- **History:** Store immutable bridge receipts on both chains
- **Validation:** Verify hero data matches expected ranges (anti-cheat)

### 3.4 Bridge Security & Controls

**Security Measures:**

1. **Rate Limiting:**
   ```solidity
   uint256 public constant MAX_DAILY_BRIDGE = 1_000_000 ether; // 1M QUANTUM/day
   mapping(uint256 => uint256) public dailyBridged; // day => amount
   
   function _checkRateLimit(uint256 amount) internal {
       uint256 today = block.timestamp / 1 days;
       require(dailyBridged[today] + amount <= MAX_DAILY_BRIDGE, "Rate limit");
       dailyBridged[today] += amount;
   }
   ```

2. **Pausable Emergency Control:**
   ```solidity
   function pauseBridge() external onlyGuardian {
       _pause();
   }
   ```

3. **Trusted Source Validation:**
   ```solidity
   mapping(uint16 => mapping(bytes => bool)) public trustedSources;
   
   function setTrustedSource(uint16 chainId, bytes memory addr, bool trusted) 
       external onlyOwner {
       trustedSources[chainId][addr] = trusted;
   }
   ```

4. **Reorg Protection:**
   - Wait for 20+ block confirmations before processing bridge events
   - Use LayerZero's built-in confirmation requirements

5. **Oracle Failure Handling:**
   - Multiple DVNs required for LayerZero messages
   - Fallback to manual verification if oracle set fails
   - 24-hour emergency delay for large transfers (>100K QUANTUM)

**Bridge Fees:**
- Small fee (0.1%) to discourage round-trip arbitrage
- LayerZero gas fees paid by user in native token


---

## 4. Hero & Item NFT Design

### 4.1 Hero NFT Structure (ERC-721)

**Full Hero Data Model:**

```solidity
struct Hero {
    // Core Identity (64 bytes)
    uint64 summonedTime;      // Birth timestamp
    uint64 lastQuestTime;     // Last quest completion
    uint32 summons;           // Times this hero has summoned offspring
    uint32 maxSummons;        // Max summons allowed (based on rarity)
    uint16 level;             // Current level (1-100)
    uint16 xp;                // Experience points
    uint8 rarity;             // 0=Common, 1=Uncommon, 2=Rare, 3=Legendary, 4=Mythic
    uint8 class;              // 0=Warrior, 1=Mage, 2=Rogue, 3=Cleric, 4=Ranger, 5=Paladin
    
    // Base Stats (32 bytes) - scaled 0-255
    uint8 strength;           // Physical attack
    uint8 dexterity;          // Critical/dodge
    uint8 agility;            // Speed/initiative
    uint8 vitality;           // HP/defense
    uint8 intelligence;       // Magic attack
    uint8 wisdom;             // Magic defense/mana
    uint8 luck;               // Critical rate modifier
    uint8 stamina;            // Quest energy (0-100)
    
    // Profession Skills (20 bytes) - level 0-100 each
    uint8 mining;
    uint8 gardening;
    uint8 foraging;
    uint8 fishing;
    
    // Genetics (64 bytes)
    uint256 visualDNA;        // Appearance genes (SVG traits)
    uint256 statDNA;          // Hidden growth rate genes
    
    // Quest State (32 bytes)
    uint256 activeQuestId;    // 0 if idle, >0 if on quest
    uint64 questStartTime;
    uint64 questEndTime;
    uint128 questSeed;        // For deterministic randomness
}

// Total struct size: ~244 bytes per hero
// Optimized with bit-packing where possible
```

**Compressed Storage Pattern:**

```solidity
// Pack multiple fields into single storage slots
struct HeroCompressed {
    // Slot 1: 256 bits
    uint256 packed1; // summonedTime(64) + lastQuestTime(64) + summons(32) + 
                     // maxSummons(32) + level(16) + xp(16) + rarity(8) + class(8) + stamina(8)
    
    // Slot 2: 256 bits  
    uint256 packed2; // stats(8*8=64 bits) + professions(8*4=32 bits) + questState(160 bits)
    
    // Slot 3 & 4: DNA
    uint256 visualDNA;
    uint256 statDNA;
}

function getHero(uint256 tokenId) external view returns (Hero memory) {
    HeroCompressed storage hc = heroesCompressed[tokenId];
    // Unpack on read
    return _unpackHero(hc);
}
```

**Gas Savings:** ~40% reduction in storage costs vs. unpacked structs

### 4.2 Hero Rarity & Stat Generation

**Rarity Distribution (at summoning):**
- Common: 50% (base stats 100-120)
- Uncommon: 30% (base stats 120-140)
- Rare: 15% (base stats 140-160)
- Legendary: 4% (base stats 160-180)
- Mythic: 1% (base stats 180-200)

**Stat Calculation:**

```solidity
function _generateStats(uint256 seed, uint8 rarity) internal pure returns (uint8[8] memory stats) {
    uint256 baseStatSum = 600 + (rarity * 50); // Common=600, Mythic=800
    
    // Use seed to distribute stat points
    for (uint8 i = 0; i < 8; i++) {
        uint256 roll = uint256(keccak256(abi.encodePacked(seed, i))) % 100;
        
        // Base stat for rarity
        uint8 baseStat = uint8(50 + rarity * 10);
        
        // Variance ±20%
        uint8 variance = uint8((roll * 20) / 100);
        stats[i] = baseStat + variance;
    }
    
    // Normalize to ensure total matches baseStatSum
    uint16 actualSum = 0;
    for (uint8 i = 0; i < 8; i++) {
        actualSum += stats[i];
    }
    
    // Proportional adjustment
    for (uint8 i = 0; i < 8; i++) {
        stats[i] = uint8((uint256(stats[i]) * baseStatSum) / actualSum);
    }
    
    return stats;
}
```

**Gene System:**

```solidity
// Visual DNA encodes appearance traits
// Bits 0-31: Skin color (32 variations)
// Bits 32-63: Hair style (32 variations)
// Bits 64-95: Hair color (32 variations)
// Bits 96-127: Eye color (32 variations)
// Bits 128-159: Armor style (32 variations)
// ... etc

function getVisualTrait(uint256 visualDNA, uint8 traitIndex) public pure returns (uint8) {
    return uint8((visualDNA >> (traitIndex * 32)) & 0xFFFFFFFF) % 32;
}

// Stat DNA encodes hidden growth rates
// Determines stat gains per level
function getStatGrowthRate(uint256 statDNA, uint8 statIndex) public pure returns (uint8) {
    // Growth rate 1-20 (per level)
    return uint8(((statDNA >> (statIndex * 8)) & 0xFF) % 20) + 1;
}
```

### 4.3 Hero Leveling & Progression

**Level System:**
- Max level: 100
- XP required for level N: `100 * N^2` 
- Example: Level 1→2 = 100 XP, Level 49→50 = 240,100 XP

**Level Up Logic:**

```solidity
function levelUp(uint256 heroId) public {
    Hero storage hero = heroes[heroId];
    require(hero.xp >= getXPForNextLevel(hero.level), "Insufficient XP");
    
    hero.level++;
    hero.xp -= getXPForNextLevel(hero.level - 1);
    
    // Apply stat gains based on statDNA
    for (uint8 i = 0; i < 6; i++) {
        uint8 growth = getStatGrowthRate(hero.statDNA, i);
        hero.stats[i] += growth;
    }
    
    emit HeroLevelUp(heroId, hero.level);
}

function getXPForNextLevel(uint16 currentLevel) public pure returns (uint256) {
    return 100 * uint256(currentLevel + 1) ** 2;
}
```

**Stamina System:**
- Heroes have 100 stamina points
- Each quest consumes 10-50 stamina (depends on quest difficulty)
- Stamina regenerates at 1 point per hour (100 points = 4.2 days)
- Can consume stamina potions (ERC-1155 items) to restore instantly

```solidity
function _consumeStamina(uint256 heroId, uint8 amount) internal {
    Hero storage hero = heroes[heroId];
    require(hero.stamina >= amount, "Insufficient stamina");
    hero.stamina -= amount;
}

function _regenerateStamina(uint256 heroId) internal {
    Hero storage hero = heroes[heroId];
    uint256 hoursPassed = (block.timestamp - hero.lastQuestTime) / 1 hours;
    uint8 newStamina = uint8(Math.min(100, hero.stamina + hoursPassed));
    hero.stamina = newStamina;
}
```

### 4.4 Pet NFT Design (ERC-721)

```solidity
struct Pet {
    uint64 bornTime;
    uint16 level;
    uint8 species;        // 0=Wolf, 1=Fox, 2=Dragon, 3=Phoenix, etc.
    uint8 rarity;
    uint8 bonusType;      // 0=Combat, 1=Profession, 2=Luck, 3=Stamina
    uint8 bonusAmount;    // +5% to +50% depending on rarity
    uint256 attachedHeroId; // 0 if not attached to a hero
}

// Pets provide passive bonuses when attached to heroes
function attachPet(uint256 petId, uint256 heroId) external {
    require(ownerOf(petId) == msg.sender);
    require(heroNFT.ownerOf(heroId) == msg.sender);
    
    Pet storage pet = pets[petId];
    require(pet.attachedHeroId == 0, "Pet already attached");
    
    pet.attachedHeroId = heroId;
    emit PetAttached(petId, heroId);
}
```

### 4.5 Item NFT Design (ERC-1155)

**Item Categories:**

```solidity
enum ItemCategory {
    Consumable,      // Potions, food, buffs
    Equipment,       // Weapons, armor (equippable)
    Crafting,        // Materials for crafting
    QuestItem,       // Keys, special quest items
    Cosmetic         // Skins, emotes
}

struct ItemMetadata {
    ItemCategory category;
    uint8 rarity;
    uint16 stackSize;       // Max stack (1 for equipment, 999 for consumables)
    uint16 level;           // Required level to use
    uint256 effects;        // Bit-packed effects (stat boosts, etc.)
}

mapping(uint256 => ItemMetadata) public itemMetadata;

// Example item IDs:
// 1-999: Consumables
// 1000-1999: Weapons
// 2000-2999: Armor
// 3000-3999: Crafting materials
```

**Equipment System:**

```solidity
struct HeroEquipment {
    uint256 weapon;       // Item ID (0 = none equipped)
    uint256 armor;
    uint256 helmet;
    uint256 gloves;
    uint256 boots;
    uint256 accessory1;
    uint256 accessory2;
}

mapping(uint256 => HeroEquipment) public heroEquipment;

function equipItem(uint256 heroId, uint256 itemId, uint8 slot) external {
    require(heroNFT.ownerOf(heroId) == msg.sender);
    require(itemNFT.balanceOf(msg.sender, itemId) > 0);
    
    ItemMetadata memory meta = itemMetadata[itemId];
    require(meta.category == ItemCategory.Equipment);
    
    // Unequip old item
    uint256 oldItemId = _getEquippedItem(heroId, slot);
    if (oldItemId != 0) {
        itemNFT.safeTransferFrom(address(this), msg.sender, oldItemId, 1, "");
    }
    
    // Equip new item
    itemNFT.safeTransferFrom(msg.sender, address(this), itemId, 1, "");
    _setEquippedItem(heroId, slot, itemId);
    
    emit ItemEquipped(heroId, itemId, slot);
}
```

### 4.6 Land NFT Design (ERC-721)

```solidity
struct Land {
    uint16 x;               // Grid position X
    uint16 y;               // Grid position Y
    uint8 landType;         // 0=Plains, 1=Forest, 2=Mountains, 3=Lake, 4=Desert
    uint8 tier;             // 1-5 (size/productivity)
    uint64 lastHarvestTime;
    uint256 buildingIds;    // Bit-packed building types
    uint256 resourceAmount; // Accumulated resources
}

// Land generates passive resources over time
function harvestLand(uint256 landId) external {
    Land storage land = lands[landId];
    require(landNFT.ownerOf(landId) == msg.sender);
    
    uint256 timeSinceHarvest = block.timestamp - land.lastHarvestTime;
    uint256 yield = (timeSinceHarvest * land.tier * 10) / 1 days;
    
    land.lastHarvestTime = uint64(block.timestamp);
    land.resourceAmount += yield;
    
    emit LandHarvested(landId, yield);
}
```

**Metadata Strategy:**
- **On-Chain:** All numeric stats, quest state, ownership
- **Off-Chain (IPFS):** SVG artwork, long descriptions, lore
- **Hybrid:** Store IPFS hash on-chain for verification

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    Hero memory hero = getHero(tokenId);
    
    // Generate dynamic SVG on-chain for rarity/stats
    string memory svg = _generateHeroSVG(hero);
    
    // JSON metadata
    string memory json = Base64.encode(bytes(string(abi.encodePacked(
        '{"name": "Hero #', Strings.toString(tokenId), '",',
        '"description": "A hero of SPACE_BASES",',
        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
        '"attributes": ', _generateAttributes(hero), '}'
    ))));
    
    return string(abi.encodePacked('data:application/json;base64,', json));
}
```


---

## 5. Quest / Game-Loop Smart Contracts

### 5.1 Quest Engine Architecture

**Core QuestEngine Contract:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract QuestEngine is UUPSUpgradeable, VRFConsumerBaseV2 {
    // Quest state machine
    enum QuestStatus { Idle, InProgress, PendingVRF, Completed, Failed }
    
    struct Quest {
        uint256 heroId;
        address player;
        uint8 questType;      // 0=Gardening, 1=Mining, 2=Foraging, 3=Fishing, 4=Combat
        uint8 difficulty;     // 1-10
        uint64 startTime;
        uint64 endTime;
        uint256 vrfRequestId; // Chainlink VRF request ID
        QuestStatus status;
        uint256 seed;         // Randomness seed
    }
    
    mapping(uint256 => Quest) public quests;        // questId => Quest
    mapping(uint256 => uint256) public heroQuests;  // heroId => questId
    mapping(uint256 => uint256) public vrfRequests; // vrfRequestId => questId
    
    uint256 public nextQuestId = 1;
    
    // Chainlink VRF V2
    VRFCoordinatorV2Interface public vrfCoordinator;
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 200000;
    
    event QuestStarted(uint256 indexed questId, uint256 indexed heroId, address player, uint8 questType);
    event QuestCompleted(uint256 indexed questId, uint256 indexed heroId, uint256 rewards, uint256 xp);
    event QuestFailed(uint256 indexed questId, uint256 indexed heroId);
    
    function startQuest(
        uint256 heroId,
        uint8 questType,
        uint8 difficulty
    ) external whenNotPaused returns (uint256 questId) {
        require(heroNFT.ownerOf(heroId) == msg.sender, "Not hero owner");
        require(heroQuests[heroId] == 0, "Hero already on quest");
        require(difficulty >= 1 && difficulty <= 10, "Invalid difficulty");
        
        Hero memory hero = heroNFT.getHero(heroId);
        require(hero.stamina >= getStaminaCost(difficulty), "Insufficient stamina");
        require(hero.level >= getRequiredLevel(difficulty), "Level too low");
        
        // Lock hero
        heroNFT.lockHero(heroId);
        
        // Consume stamina
        heroNFT.consumeStamina(heroId, getStaminaCost(difficulty));
        
        // Create quest
        questId = nextQuestId++;
        Quest storage quest = quests[questId];
        quest.heroId = heroId;
        quest.player = msg.sender;
        quest.questType = questType;
        quest.difficulty = difficulty;
        quest.startTime = uint64(block.timestamp);
        quest.endTime = uint64(block.timestamp + getQuestDuration(questType, difficulty));
        quest.status = QuestStatus.InProgress;
        
        heroQuests[heroId] = questId;
        
        emit QuestStarted(questId, heroId, msg.sender, questType);
    }
    
    function completeQuest(uint256 questId) external whenNotPaused {
        Quest storage quest = quests[questId];
        require(quest.player == msg.sender, "Not quest owner");
        require(quest.status == QuestStatus.InProgress, "Quest not in progress");
        require(block.timestamp >= quest.endTime, "Quest not finished");
        
        // Request randomness from Chainlink VRF
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // requestConfirmations
            callbackGasLimit,
            1  // numWords
        );
        
        quest.vrfRequestId = requestId;
        quest.status = QuestStatus.PendingVRF;
        vrfRequests[requestId] = questId;
    }
    
    // Chainlink VRF callback
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 questId = vrfRequests[requestId];
        Quest storage quest = quests[questId];
        
        require(quest.status == QuestStatus.PendingVRF, "Invalid quest state");
        
        quest.seed = randomWords[0];
        
        // Resolve quest with randomness
        bool success = _resolveQuest(questId, randomWords[0]);
        
        if (success) {
            quest.status = QuestStatus.Completed;
            emit QuestCompleted(questId, quest.heroId, 0, 0); // Rewards calculated off-chain or in separate call
        } else {
            quest.status = QuestStatus.Failed;
            emit QuestFailed(questId, quest.heroId);
        }
        
        // Unlock hero
        heroNFT.unlockHero(quest.heroId);
        heroQuests[quest.heroId] = 0;
    }
    
    function _resolveQuest(uint256 questId, uint256 randomness) internal returns (bool success) {
        Quest storage quest = quests[questId];
        Hero memory hero = heroNFT.getHero(quest.heroId);
        
        // Calculate success chance based on hero stats + equipment
        uint256 successChance = _calculateSuccessChance(hero, quest.questType, quest.difficulty);
        uint256 roll = randomness % 100;
        
        if (roll < successChance) {
            // Success - grant rewards
            _grantRewards(questId, hero, randomness);
            
            // Grant XP
            uint256 xpGain = getXPReward(quest.questType, quest.difficulty);
            heroNFT.grantXP(quest.heroId, xpGain);
            
            // Grant profession XP
            uint256 professionXP = getProfessionXP(quest.questType, quest.difficulty);
            professionManager.grantProfessionXP(quest.heroId, quest.questType, professionXP);
            
            return true;
        } else {
            // Failure - minimal/no rewards
            return false;
        }
    }
    
    function _calculateSuccessChance(Hero memory hero, uint8 questType, uint8 difficulty) 
        internal view returns (uint256) 
    {
        uint256 baseChance = 50; // 50% base
        
        // Adjust based on hero level vs quest difficulty
        int256 levelDiff = int256(uint256(hero.level)) - int256(uint256(difficulty * 5));
        if (levelDiff > 0) {
            baseChance += uint256(levelDiff) * 2; // +2% per level above requirement
        } else {
            baseChance = baseChance > uint256(-levelDiff) * 2 ? 
                baseChance - uint256(-levelDiff) * 2 : 10; // Minimum 10%
        }
        
        // Adjust based on relevant stat
        uint8 relevantStat = _getRelevantStat(hero, questType);
        baseChance += (relevantStat / 10); // +1% per 10 stat points
        
        // Adjust based on profession skill
        uint8 professionLevel = professionManager.getProfessionLevel(hero.id, questType);
        baseChance += (professionLevel / 5); // +1% per 5 profession levels
        
        // Equipment bonuses
        uint256 equipmentBonus = _getEquipmentBonus(hero.id, questType);
        baseChance += equipmentBonus;
        
        // Pet bonuses
        uint256 petBonus = _getPetBonus(hero.id);
        baseChance += petBonus;
        
        // Cap at 95%
        return baseChance > 95 ? 95 : baseChance;
    }
    
    function _grantRewards(uint256 questId, Hero memory hero, uint256 randomness) internal {
        Quest storage quest = quests[questId];
        
        // Calculate QUANTUM reward
        uint256 baseReward = getBaseReward(quest.questType, quest.difficulty);
        uint256 multiplier = 100 + (hero.luck / 2); // Luck increases rewards
        uint256 quantumReward = (baseReward * multiplier) / 100;
        
        // Mint QUANTUM to player
        quantumToken.mint(quest.player, quantumReward);
        
        // Chance for item drops
        uint256 itemRoll = uint256(keccak256(abi.encodePacked(randomness, "item"))) % 100;
        if (itemRoll < getItemDropChance(quest.difficulty)) {
            uint256 itemId = _rollItemDrop(randomness, quest.questType, quest.difficulty);
            uint256 itemAmount = 1;
            itemNFT.mint(quest.player, itemId, itemAmount, "");
        }
        
        // Rare chance for CRYSTAL
        uint256 crystalRoll = uint256(keccak256(abi.encodePacked(randomness, "crystal"))) % 1000;
        if (crystalRoll < 10) { // 1% chance
            uint256 crystalAmount = quest.difficulty * 1e18;
            crystalToken.mint(quest.player, crystalAmount);
        }
    }
    
    // Quest configuration functions
    function getQuestDuration(uint8 questType, uint8 difficulty) public pure returns (uint256) {
        // Base duration: 1 hour to 12 hours
        return (1 hours + (difficulty * 1 hours));
    }
    
    function getStaminaCost(uint8 difficulty) public pure returns (uint8) {
        return uint8(10 + (difficulty * 5)); // 10-60 stamina
    }
    
    function getRequiredLevel(uint8 difficulty) public pure returns (uint16) {
        return uint16(difficulty * 5); // Level 5-50
    }
    
    function getBaseReward(uint8 questType, uint8 difficulty) public view returns (uint256) {
        // Base: 10 QUANTUM, scaled by difficulty
        return 10 ether * difficulty;
    }
    
    function getXPReward(uint8 questType, uint8 difficulty) public pure returns (uint256) {
        return uint256(difficulty) * 100;
    }
    
    function getProfessionXP(uint8 questType, uint8 difficulty) public pure returns (uint256) {
        return uint256(difficulty) * 50;
    }
}
```

### 5.2 Individual Quest Modules

Each quest type has specialized logic:

**GardeningQuest:** Grow crops, earn QUANTUM + crop items
**MiningQuest:** Mine ores, chance for rare gems (CRYSTAL)
**ForagingQuest:** Find herbs/materials for crafting
**FishingQuest:** Catch fish, rare chance for legendary fish NFT
**CombatQuest:** Battle monsters, earn XP + equipment

### 5.3 Randomness Security

**Chainlink VRF V2 Integration:**

- **Subscription Model:** Pre-fund LINK subscription
- **Request Confirmations:** 3 blocks (prevent reorg attacks)
- **Gas Limit:** 200,000 gas for callback
- **Key Hash:** Mantle-specific VRF key hash from Chainlink docs

**Backup: Commit-Reveal Pattern (if VRF unavailable):**

```solidity
mapping(uint256 => bytes32) public questCommitments;

function commitQuest(uint256 questId, bytes32 commitment) external {
    require(quests[questId].player == msg.sender);
    questCommitments[questId] = commitment;
}

function revealQuest(uint256 questId, uint256 secret) external {
    bytes32 expectedCommitment = keccak256(abi.encodePacked(questId, secret, msg.sender));
    require(questCommitments[questId] == expectedCommitment, "Invalid reveal");
    
    // Use block hash + secret for randomness
    uint256 randomness = uint256(keccak256(abi.encodePacked(
        blockhash(block.number - 1),
        secret,
        questId
    )));
    
    _resolveQuest(questId, randomness);
}
```

### 5.4 Gas Optimization Strategies

**Batch Quest Resolution:**

```solidity
function batchCompleteQuests(uint256[] calldata questIds) external {
    uint256 totalRewards = 0;
    
    for (uint i = 0; i < questIds.length; i++) {
        // ... quest logic
        totalRewards += questRewards[i];
    }
    
    // Single mint for all rewards
    quantumToken.mint(msg.sender, totalRewards);
}
```

**Off-Chain Computation + On-Chain Verification:**

```solidity
struct QuestProof {
    uint256 questId;
    uint256 rewards;
    uint256 xp;
    bytes32 proofHash;
    bytes signature;
}

function completeQuestWithProof(QuestProof calldata proof) external {
    // Verify signature from authorized oracle
    bytes32 messageHash = keccak256(abi.encodePacked(
        proof.questId, proof.rewards, proof.xp
    ));
    address signer = recoverSigner(messageHash, proof.signature);
    require(authorizedOracles[signer], "Invalid oracle");
    
    // Grant rewards without heavy computation
    quantumToken.mint(msg.sender, proof.rewards);
    heroNFT.grantXP(quests[proof.questId].heroId, proof.xp);
}
```

---

## 6. DEX / LP / Staking Subsystem

### 6.1 AMM Choice: Uniswap V2 Fork

**Rationale:**
- ✅ Battle-tested (billions in volume)
- ✅ Simple constant-product formula (x * y = k)
- ✅ Gas efficient
- ✅ Easy to integrate with existing tools (DEX aggregators, analytics)

**Why Not V3:**
- Concentrated liquidity adds complexity
- Higher gas costs
- Not necessary for game token pairs

### 6.2 Core DEX Contracts

**QuantumFactory.sol:**

```solidity
contract QuantumFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Zero address");
        require(getPair[token0][token1] == address(0), "Pair exists");
        
        bytes memory bytecode = type(QuantumPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        IQuantumPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
}
```

**QuantumRouter.sol:**

```solidity
contract QuantumRouter {
    IQuantumFactory public factory;
    address public WMNT; // Wrapped MNT
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint[] memory amounts) {
        amounts = QuantumLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");
        
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, QuantumLibrary.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = QuantumLibrary.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IQuantumPair(pair).mint(to);
    }
}
```

### 6.3 LP Staking (MasterChef V2)

```solidity
contract LPGarden {
    struct UserInfo {
        uint256 amount;        // LP tokens staked
        uint256 rewardDebt;    // Reward debt
        uint256 pendingRewards;
    }
    
    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;    // Allocation points (weight)
        uint256 lastRewardBlock;
        uint256 accQuantumPerShare;
    }
    
    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    uint256 public quantumPerBlock = 10 ether; // Base emission rate
    uint256 public totalAllocPoint = 0;
    
    // Emission decay: 10% reduction every 180 days
    uint256 public lastEmissionUpdate;
    uint256 public constant EMISSION_DECAY_INTERVAL = 180 days;
    uint256 public constant EMISSION_DECAY_RATE = 9000; // 90% (10% reduction)
    
    function updateEmissionRate() public {
        if (block.timestamp >= lastEmissionUpdate + EMISSION_DECAY_INTERVAL) {
            quantumPerBlock = (quantumPerBlock * EMISSION_DECAY_RATE) / 10000;
            lastEmissionUpdate = block.timestamp;
        }
    }
    
    function deposit(uint256 _pid, uint256 _amount) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accQuantumPerShare / 1e12) - user.rewardDebt;
            user.pendingRewards += pending;
        }
        
        pool.lpToken.transferFrom(msg.sender, address(this), _amount);
        user.amount += _amount;
        user.rewardDebt = user.amount * pool.accQuantumPerShare / 1e12;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    function harvest(uint256 _pid) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        uint256 pending = (user.amount * pool.accQuantumPerShare / 1e12) - user.rewardDebt;
        pending += user.pendingRewards;
        
        if (pending > 0) {
            // Apply JADE boost if user has staked QUANTUM
            uint256 boost = jadeStaking.getBoostMultiplier(msg.sender);
            pending = (pending * boost) / 100;
            
            safeQuantumTransfer(msg.sender, pending);
            user.pendingRewards = 0;
        }
        
        user.rewardDebt = user.amount * pool.accQuantumPerShare / 1e12;
        
        emit Harvest(msg.sender, _pid, pending);
    }
}
```

### 6.4 Initial Trading Pairs

1. **QNTM/MNT** (Main pair, highest liquidity)
2. **QNTM/USDC** (Stablecoin pair)
3. **CRYSTAL/QNTM**
4. **MNT/USDC** (Reference price)

**Liquidity Bootstrap:**
- 25M QNTM + 50,000 MNT (assuming 1 QNTM = 0.002 MNT)
- Locked for 6 months to prevent rug pull

### 6.5 Fee Structure

**Swap Fees:**
- 0.3% total
  - 0.25% to LP providers
  - 0.05% to treasury (auto-converted to MNT, distributed to JADE stakers)

**Dynamic Fees (Future):**
- Lower fees (0.1%) for stable pairs
- Higher fees (0.5%) for volatile pairs

---

## 7. Access Control, Governance & Security

### 7.1 Role-Based Access Control

```solidity
contract Roles is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant GAME_ADMIN_ROLE = keccak256("GAME_ADMIN");
    bytes32 public constant ECONOMIC_ADMIN_ROLE = keccak256("ECONOMIC_ADMIN");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE");
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
}

// Usage in contracts
contract HeroCore is Roles {
    function setQuestEngine(address _questEngine) external onlyRole(GAME_ADMIN_ROLE) {
        questEngine = _questEngine;
    }
}
```

**Role Responsibilities:**

| Role | Permissions | Holders |
|------|-------------|---------|
| ADMIN | Grant/revoke roles, upgrade contracts | 3/5 multisig |
| GAME_ADMIN | Adjust quest parameters, loot tables | 2/3 multisig (game team) |
| ECONOMIC_ADMIN | Modify emission rates, fee structures | 3/5 multisig |
| GUARDIAN | Emergency pause, bridge rate limits | 2/4 multisig (rapid response) |
| MINTER | Mint tokens (only contracts like QuestEngine) | Contract addresses |
| ORACLE | Submit off-chain computation proofs | Authorized oracle nodes |

### 7.2 Timelock & Governance

**Timelock Contract:**

```solidity
contract Timelock {
    uint256 public constant MINIMUM_DELAY = 48 hours;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    
    mapping(bytes32 => bool) public queuedTransactions;
    
    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external onlyRole(ADMIN_ROLE) returns (bytes32) {
        require(eta >= block.timestamp + MINIMUM_DELAY, "ETA too soon");
        
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;
        
        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }
    
    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external payable onlyRole(ADMIN_ROLE) returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        require(queuedTransactions[txHash], "Transaction not queued");
        require(block.timestamp >= eta, "Transaction not ready");
        require(block.timestamp <= eta + 7 days, "Transaction expired");
        
        queuedTransactions[txHash] = false;
        
        bytes memory callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "Transaction execution failed");
        
        emit ExecuteTransaction(txHash, target, value, signature, data, eta);
        return returnData;
    }
}
```

### 7.3 Security Measures

**1. Reentrancy Protection:**

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract QuestEngine is ReentrancyGuard {
    function completeQuest(uint256 questId) external nonReentrant {
        // ... quest logic
    }
}
```

**2. Pausable Mechanism:**

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract HeroCore is Pausable {
    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function transferFrom(address from, address to, uint256 tokenId) 
        public override whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }
}
```

**3. Rate Limiting:**

```solidity
contract RateLimiter {
    mapping(address => mapping(uint256 => uint256)) public userActionCount;
    uint256 public constant MAX_ACTIONS_PER_HOUR = 100;
    
    modifier rateLimit() {
        uint256 currentHour = block.timestamp / 1 hours;
        require(userActionCount[msg.sender][currentHour] < MAX_ACTIONS_PER_HOUR, "Rate limit");
        userActionCount[msg.sender][currentHour]++;
        _;
    }
}
```

**4. Input Validation:**

```solidity
function summon(uint256 hero1Id, uint256 hero2Id) external {
    require(hero1Id != hero2Id, "Cannot summon with self");
    require(hero1Id != 0 && hero2Id != 0, "Invalid hero ID");
    
    Hero memory hero1 = heroes[hero1Id];
    Hero memory hero2 = heroes[hero2Id];
    
    require(hero1.summons < hero1.maxSummons, "Hero1 summon limit reached");
    require(hero2.summons < hero2.maxSummons, "Hero2 summon limit reached");
    require(hero1.level >= 5 && hero2.level >= 5, "Heroes must be level 5+");
    
    // ... summoning logic
}
```

### 7.4 Top Security Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Reentrancy** | Use ReentrancyGuard, checks-effects-interactions pattern |
| **Randomness Manipulation** | Chainlink VRF V2 with 3 block confirmations |
| **Price Oracle Exploits** | Use TWAP (time-weighted average price) from DEX pairs |
| **Bridge Exploits** | Rate limits, pausable, trusted source validation, 20-block confirmation |
| **Quest Griefing** | Stamina costs, cooldowns, quest cancellation penalties |
| **Integer Overflow/Underflow** | Solidity 0.8+ built-in checks, SafeMath library |
| **Signature Replay** | Nonces, expiration timestamps, domain separators (EIP-712) |
| **Flash Loan Attacks** | Block-level reentrancy guards, TWAP oracles |
| **Front-Running** | Commit-reveal for sensitive operations, slippage protection |
| **Governance Attacks** | Timelock delays, multisig requirements, emergency pause |


---

## 8. Indexing, Subgraphs & Off-Chain Services

### 8.1 The Graph Subgraph

**Entities to Index:**

```graphql
type Hero @entity {
  id: ID!
  tokenId: BigInt!
  owner: Bytes!
  level: Int!
  rarity: Int!
  class: Int!
  summonedTime: BigInt!
  totalQuestsCompleted: Int!
  totalXPEarned: BigInt!
  currentQuest: Quest
  equipment: [Equipment!]!
  history: [QuestHistory!]! @derivedFrom(field: "hero")
}

type Quest @entity {
  id: ID!
  questId: BigInt!
  hero: Hero!
  player: Bytes!
  questType: Int!
  difficulty: Int!
  startTime: BigInt!
  endTime: BigInt!
  status: String!
  rewards: BigInt
  xpGained: BigInt
}

type DEXPair @entity {
  id: ID!
  token0: Bytes!
  token1: Bytes!
  reserve0: BigDecimal!
  reserve1: BigDecimal!
  totalSupply: BigDecimal!
  volumeToken0: BigDecimal!
  volumeToken1: BigDecimal!
  txCount: BigInt!
}

type User @entity {
  id: ID!
  address: Bytes!
  heroesOwned: [Hero!]! @derivedFrom(field: "owner")
  questsCompleted: Int!
  totalRewardsEarned: BigInt!
  lpPositions: [LPPosition!]! @derivedFrom(field: "user")
}
```

**Subgraph Deployment:**
```bash
graph init --product hosted-service
graph codegen
graph build
graph deploy --product hosted-service username/space-bases-mantle
```

### 8.2 Off-Chain Services

**Quest Calculation Service (Node.js + Redis):**
- Pre-calculate quest success rates
- Cache hero stats for fast lookup
- Generate quest rewards off-chain, verify on-chain

**Matchmaking Service (Combat Quests):**
- Match heroes of similar power levels
- Track combat rankings/leaderboards
- Generate battle simulations

**Notification Service:**
- WebSocket connections for real-time updates
- Email/Discord notifications for quest completions
- Price alerts for DEX trading

**Analytics Dashboard:**
- Track player retention, DAU/MAU
- Monitor token emissions vs burns
- DEX volume and liquidity metrics

---

## 9. Front-End / Wallet Integration

### 9.1 Tech Stack

**Framework:** Next.js 14 + React 18 + TypeScript
**Wallet:** Wagmi 2.x + RainbowKit
**State:** Zustand or Jotai
**Queries:** TanStack Query (React Query) + The Graph
**UI:** Tailwind CSS + Framer Motion

### 9.2 Wallet Integration

```typescript
// app/providers.tsx
'use client';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'SPACE_BASES',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [mantle],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.Node }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 9.3 Contract Interaction Hooks

```typescript
// hooks/useStartQuest.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { QUEST_ENGINE_ABI, QUEST_ENGINE_ADDRESS } from '@/contracts';

export function useStartQuest() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const startQuest = async (heroId: bigint, questType: number, difficulty: number) => {
    writeContract({
      address: QUEST_ENGINE_ADDRESS,
      abi: QUEST_ENGINE_ABI,
      functionName: 'startQuest',
      args: [heroId, questType, difficulty],
    });
  };

  return { startQuest, isLoading, isSuccess };
}
```

### 9.4 Multicall for Batch Operations

```typescript
import { useReadContracts } from 'wagmi';

const heroContract = { address: HERO_ADDRESS, abi: HERO_ABI };

const { data } = useReadContracts({
  contracts: [
    { ...heroContract, functionName: 'getHero', args: [1n] },
    { ...heroContract, functionName: 'getHero', args: [2n] },
    { ...heroContract, functionName: 'getHero', args: [3n] },
  ],
});

// Returns array of hero data in single RPC call
```

---

## 10. Dev Tooling, Testing & Deployment

### 10.1 Project Stack: Foundry

**Why Foundry:**
- ✅ Fast (Rust-based)
- ✅ Native fuzzing and invariant testing
- ✅ Built-in gas snapshots
- ✅ Solidity test scripts (no JavaScript)

**Project Structure:**

```
contracts/
├── src/
│   ├── tokens/
│   │   ├── QUANTUM.sol
│   │   ├── CRYSTAL.sol
│   │   └── JADE.sol
│   ├── nfts/
│   │   ├── HeroCore.sol
│   │   ├── PetCore.sol
│   │   ├── ItemCore.sol
│   │   └── LandCore.sol
│   ├── quest/
│   │   ├── QuestEngine.sol
│   │   ├── ProfessionManager.sol
│   │   └── modules/
│   │       ├── GardeningQuest.sol
│   │       ├── MiningQuest.sol
│   │       └── CombatQuest.sol
│   ├── dex/
│   │   ├── QuantumFactory.sol
│   │   ├── QuantumRouter.sol
│   │   ├── QuantumPair.sol
│   │   └── LPGarden.sol
│   ├── marketplace/
│   │   ├── TavernMarketplace.sol
│   │   └── ItemMarketplace.sol
│   ├── bridge/
│   │   └── BridgeAdapter.sol
│   ├── governance/
│   │   ├── Timelock.sol
│   │   └── JADEStaking.sol
│   └── libraries/
│       ├── HeroLib.sol
│       └── MathLib.sol
├── test/
│   ├── unit/
│   ├── integration/
│   └── fuzz/
├── script/
│   ├── Deploy.s.sol
│   └── Upgrade.s.sol
└── foundry.toml
```

### 10.2 Comprehensive Testing

**Unit Tests:**

```solidity
// test/unit/HeroCore.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {HeroCore} from "src/nfts/HeroCore.sol";

contract HeroCoreTest is Test {
    HeroCore public heroCore;
    address public user = address(0x1);

    function setUp() public {
        heroCore = new HeroCore();
        vm.deal(user, 100 ether);
    }

    function testMintHero() public {
        vm.startPrank(user);
        uint256 tokenId = heroCore.mintHero(1, 0); // rarity=1, class=0
        assertEq(heroCore.ownerOf(tokenId), user);
        vm.stopPrank();
    }

    function testFuzz_HeroStatsInRange(uint8 rarity, uint256 seed) public {
        vm.assume(rarity <= 4);
        
        uint8[8] memory stats = heroCore.generateStats(seed, rarity);
        for (uint i = 0; i < stats.length; i++) {
            assertTrue(stats[i] >= 50 && stats[i] <= 200, "Stat out of range");
        }
    }
}
```

**Integration Tests:**

```solidity
// test/integration/QuestFlow.t.sol
contract QuestFlowTest is Test {
    function testFullQuestCycle() public {
        // Setup
        HeroCore heroNFT = new HeroCore();
        QuestEngine questEngine = new QuestEngine();
        QUANTUM token = new QUANTUM();
        
        // Mint hero
        uint256 heroId = heroNFT.mintHero(user, 2, 0);
        
        // Start quest
        vm.startPrank(user);
        heroNFT.approve(address(questEngine), heroId);
        uint256 questId = questEngine.startQuest(heroId, 0, 5);
        
        // Fast forward time
        vm.warp(block.timestamp + 2 hours);
        
        // Complete quest (mock VRF)
        uint256 randomness = 12345;
        questEngine.mockCompleteQuest(questId, randomness);
        
        // Verify rewards
        assertGt(token.balanceOf(user), 0);
        assertGt(heroNFT.getHero(heroId).xp, 0);
        vm.stopPrank();
    }
}
```

**Invariant Tests:**

```solidity
contract InvariantTest is Test {
    function invariant_TotalSupplyNeverExceedsCap() public {
        assertLe(quantum.totalSupply(), quantum.MAX_SUPPLY());
    }
    
    function invariant_LPTokensSumMatchesPairReserves() public {
        // For all pairs, sum of LP balances should match total supply
        for (uint i = 0; i < factory.allPairsLength(); i++) {
            address pair = factory.allPairs(i);
            // ... verify invariant
        }
    }
}
```

### 10.3 Deployment Plan

**Phase 1: Testnet (Mantle Sepolia)**

1. Deploy core infrastructure
```bash
forge script script/Deploy.s.sol:DeployCore --rpc-url $MANTLE_TESTNET_RPC --broadcast --verify
```

2. Deploy tokens (QUANTUM, CRYSTAL, JADE)
3. Deploy NFTs (Hero, Pet, Item, Land)
4. Deploy DEX (Factory, Router, Pairs)
5. Deploy Quest Engine + Modules
6. Deploy Marketplace
7. Deploy Bridge Adapter
8. Configure permissions and roles
9. Create initial LP pairs
10. Run integration tests on testnet

**Phase 2: Mainnet**

1. Audit smart contracts (2-3 firms: Trail of Bits, OpenZeppelin, Consensys Diligence)
2. Bug bounty program (Immunefi, $500K pool)
3. Gradual mainnet deployment:
   - Week 1: Tokens + DEX only (test liquidity)
   - Week 2: Add NFTs + Marketplace
   - Week 3: Add Quest Engine (limited access)
   - Week 4: Full public launch
4. Liquidity bootstrap event
5. Bridge activation
6. Marketing campaign

**Deployment Script:**

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract DeployCore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy tokens
        QUANTUM quantum = new QUANTUM();
        CRYSTAL crystal = new CRYSTAL();
        JADE jade = new JADE(address(quantum));

        // Deploy NFTs
        HeroCore heroNFT = new HeroCore();
        PetCore petNFT = new PetCore();
        ItemCore itemNFT = new ItemCore();
        LandCore landNFT = new LandCore();

        // Deploy DEX
        QuantumFactory factory = new QuantumFactory();
        QuantumRouter router = new QuantumRouter(address(factory), WMNT);

        // Deploy Quest Engine
        QuestEngine questEngine = new QuestEngine(
            address(heroNFT),
            address(quantum),
            address(crystal),
            VRF_COORDINATOR
        );

        // Grant roles
        quantum.grantRole(quantum.MINTER_ROLE(), address(questEngine));
        heroNFT.grantRole(heroNFT.GAME_ADMIN_ROLE(), address(questEngine));

        // Log addresses
        console.log("QUANTUM:", address(quantum));
        console.log("HeroNFT:", address(heroNFT));
        console.log("QuestEngine:", address(questEngine));

        vm.stopBroadcast();
    }
}
```

**Contract Verification:**

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
  --chain mantle \
  --etherscan-api-key $MANTLE_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" <ARG>)
```

---

## 11. Migration / Compatibility with Existing DFK Ecosystems

### 11.1 Migration Strategy

**Bridge Migration Event (1 month window):**

1. **Snapshot Existing DFK Assets:**
   - Take snapshot of JEWEL holders on DFK Chain
   - Record all hero NFT states (stats, levels, genes)
   - Export item inventories

2. **1:1 Token Migration:**
   - Lock JEWEL on DFK Chain → mint QUANTUM on Mantle
   - Exchange rate: 1 JEWEL = 1 QUANTUM
   - No fees for first 30 days

3. **Hero Migration:**
   - Bridge heroes via LayerZero with full metadata
   - Preserve: tokenId, stats, levels, summons, profession skills
   - Hero history stored on IPFS, hash on-chain

4. **Early Migration Incentives:**
   - First 1000 migrated heroes get exclusive "Pioneer" badge NFT
   - 20% bonus QUANTUM airdrop for migration within first week
   - Exclusive cosmetic items for early adopters

### 11.2 Backward Compatibility

**Cross-Chain Hero Rentals:**
- Heroes on Mantle can be rented for quests on other DFK chains
- Use LayerZero for trustless rental agreements

**Unified Leaderboards:**
- Aggregate quest completions across all chains
- Display unified hero power rankings

**Phased Rewards:**
- First 3 months: 2x emissions on Mantle (incentivize migration)
- Months 4-6: 1.5x emissions
- Month 7+: Standard emissions

### 11.3 Liquidity Migration

**JEWEL → QUANTUM Liquidity Bridge:**
- Provide liquidity on both chains with same LP tokens
- Incentivize LPs to migrate with bonus CRYSTAL rewards
- Gradually reduce emissions on old chain

---

## 12. Final Deliverables

### 12.1 System Architecture Summary

SPACE_BASES is a modular, secure, and scalable GameFi ecosystem on Mantle Network featuring:

- **3 ERC-20 tokens:** QUANTUM (main), CRYSTAL (rare), JADE (governance)
- **4 NFT types:** Heroes, Pets, Items (ERC-1155), Land
- **Uniswap V2 DEX fork:** QuantumFactory, Router, Pairs, LPGarden
- **Quest system:** 5 quest types with VRF randomness
- **Marketplace:** Auction house for heroes/items
- **Bridge:** LayerZero integration for cross-chain assets
- **Governance:** Timelock + multisig + JADE voting

### 12.2 Core Contract List

| Contract | Type | Upgradeable | Purpose |
|----------|------|-------------|---------|
| QUANTUM.sol | ERC-20 | No | Main game token |
| CRYSTAL.sol | ERC-20 | No | Rare reward token |
| JADE.sol | ERC-20 | No | Governance token |
| HeroCore.sol | ERC-721 | UUPS | Hero NFTs |
| PetCore.sol | ERC-721 | UUPS | Pet NFTs |
| ItemCore.sol | ERC-1155 | UUPS | Item NFTs |
| LandCore.sol | ERC-721 | UUPS | Land NFTs |
| QuestEngine.sol | Logic | UUPS | Quest state machine |
| ProfessionManager.sol | Logic | UUPS | Skill tracking |
| QuantumFactory.sol | AMM | No | DEX pair factory |
| QuantumRouter.sol | AMM | No | DEX routing |
| LPGarden.sol | Staking | Transparent | LP rewards |
| TavernMarketplace.sol | Marketplace | UUPS | Hero trading |
| ItemMarketplace.sol | Marketplace | UUPS | Item trading |
| SummoningPortal.sol | Logic | UUPS | Hero breeding |
| BridgeAdapter.sol | Bridge | UUPS | LayerZero integration |
| Timelock.sol | Governance | No | Upgrade delays |
| Treasury.sol | Treasury | Transparent | Fee collection |

### 12.3 Solidity Interface Skeletons

See separate files in `contracts/interfaces/`:
- IHeroCore.sol
- IQuestEngine.sol
- IQuantumDEX.sol
- IBridgeAdapter.sol

### 12.4 Operations Runbook

**Daily Operations:**
- Monitor VRF subscription balance (top up if < 10 LINK)
- Check bridge rate limits (reset daily)
- Review quest completion rates
- Monitor DEX liquidity depth

**Weekly Operations:**
- Update emission rates if scheduled
- Review and process governance proposals
- Analyze player retention metrics
- Optimize gas usage for high-traffic functions

**Upgrade Procedure:**
1. Test upgrade on testnet
2. Propose upgrade via Timelock (48-hour delay)
3. Announce to community
4. Execute upgrade
5. Verify contract state post-upgrade
6. Monitor for 24 hours

**Emergency Response:**
- Guardian multisig can pause critical contracts within 1 hour
- Emergency contacts: Discord #emergency channel
- Incident postmortem required within 48 hours

### 12.5 Monitoring & Alerts

**Grafana Dashboards:**
- Transaction volume by contract
- Gas usage trends
- Quest completion rates
- DEX TVL and volume
- Token emission vs burn rates

**Alerts (PagerDuty):**
- Bridge rate limit exceeded
- VRF randomness failure
- Abnormal token mint/burn
- LP pool imbalance > 20%
- Failed quest rate > 10%

---

## Appendices

### A. Gas Cost Estimates (Mantle)

| Operation | Gas Cost | USD (at $0.10/MNT, 5 Gwei) |
|-----------|----------|---------------------------|
| Mint Hero | ~150,000 | ~$0.075 |
| Start Quest | ~100,000 | ~$0.05 |
| Complete Quest | ~200,000 | ~$0.10 |
| DEX Swap | ~120,000 | ~$0.06 |
| Add Liquidity | ~180,000 | ~$0.09 |
| Bridge Hero | ~250,000 | ~$0.125 |

### B. Economic Model Summary

**Year 1 Projections:**
- Daily Active Users: 10,000
- Quests/day: 50,000
- DEX Volume: $1M/day
- QUANTUM Price Target: $0.50
- Market Cap: $250M (500M supply)

**Burn Mechanisms:**
- Summoning: ~50K QUANTUM/day
- Crafting: ~20K QUANTUM/day
- Total Burn: ~70K QUANTUM/day

**Emission:**
- Quests: ~137K QUANTUM/day
- LP Staking: ~137K QUANTUM/day
- Total Emission: ~274K QUANTUM/day

**Net Inflation:** ~204K QUANTUM/day (decreases over time)

### C. Assumptions

1. Mantle Network maintains stability and low gas costs
2. Chainlink VRF available on Mantle
3. LayerZero supports Mantle <-> DFK Chain bridging
4. The Graph supports Mantle network
5. Community migrates from existing DFK chains
6. No major security incidents during launch
7. Regulatory environment remains favorable for gaming tokens

---

## Conclusion

This specification provides an implementation-ready blueprint for SPACE_BASES, a DeFi Kingdoms-inspired GameFi ecosystem on Mantle Network. The architecture prioritizes:

✅ **Security:** Multiple audits, battle-tested patterns, comprehensive access controls
✅ **Scalability:** Modular design, upgradeable contracts, off-chain computation
✅ **User Experience:** Low gas costs, gasless transactions, beautiful UI
✅ **Economic Sustainability:** Balanced emissions, multiple burn mechanisms, DAO governance

**Next Steps:**
1. Begin Foundry project setup
2. Implement core token contracts
3. Build and test Hero NFT system
4. Develop Quest Engine with VRF integration
5. Deploy to Mantle testnet
6. Security audits
7. Mainnet launch

**Timeline:** 6-9 months from start to mainnet launch

---

*Document Version: 1.0.0*  
*Last Updated: December 2024*  
*Prepared for: SPACE_BASES Development Team*
