// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MegaClawdToken ($MEGACLAWD)
/// @notice ERC-20 token for the MEGA CLAWD autonomous AI agent
/// @dev Deployed on Base L2. Owner is the agent's wallet.
contract MegaClawdToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens
    uint256 public constant AGENT_ALLOCATION = 200_000_000 * 1e18; // 20% to agent
    uint256 public constant COMMUNITY_ALLOCATION = 500_000_000 * 1e18; // 50% community
    uint256 public constant LIQUIDITY_ALLOCATION = 300_000_000 * 1e18; // 30% liquidity

    address public immutable agentWallet;

    bool public tradingEnabled;
    mapping(address => bool) public isExcludedFromLimits;

    event TradingEnabled(uint256 timestamp);

    error TradingNotEnabled();
    error ExceedsMaxSupply();

    constructor(
        address _agentWallet,
        address _communityVault,
        address _liquidityPool
    ) ERC20("MEGA CLAWD", "MEGACLAWD") Ownable(msg.sender) {
        agentWallet = _agentWallet;

        isExcludedFromLimits[_agentWallet] = true;
        isExcludedFromLimits[_communityVault] = true;
        isExcludedFromLimits[_liquidityPool] = true;

        _mint(_agentWallet, AGENT_ALLOCATION);
        _mint(_communityVault, COMMUNITY_ALLOCATION);
        _mint(_liquidityPool, LIQUIDITY_ALLOCATION);
    }

    /// @notice Enable trading - can only be called once by the agent
    function enableTrading() external onlyOwner {
        tradingEnabled = true;
        emit TradingEnabled(block.timestamp);
    }

    /// @notice Exclude an address from transfer limits
    function setExcludedFromLimits(address account, bool excluded) external onlyOwner {
        isExcludedFromLimits[account] = excluded;
    }

    function _update(address from, address to, uint256 value) internal override {
        // Allow minting and burning always
        if (from != address(0) && to != address(0)) {
            if (!tradingEnabled && !isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
                revert TradingNotEnabled();
            }
        }
        super._update(from, to, value);
    }
}
