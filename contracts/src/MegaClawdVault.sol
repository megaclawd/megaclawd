// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MegaClawdVault
/// @notice Treasury vault for MEGA CLAWD agent - holds funds, manages budgets, pays for services
/// @dev Owner is the agent's wallet. Supports ETH, USDC, and $MEGACLAWD
contract MegaClawdVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Budget {
        uint256 dailyLimit;
        uint256 spentToday;
        uint256 lastResetTimestamp;
    }

    mapping(address => Budget) public tokenBudgets; // token => budget (address(0) for ETH)
    mapping(address => bool) public authorizedSpenders; // addresses that can spend from vault

    uint256 public totalEthSpent;
    uint256 public totalTransactions;

    event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);
    event BudgetSet(address indexed token, uint256 dailyLimit);
    event SpenderAuthorized(address indexed spender, bool authorized);

    error ExceedsDailyBudget(address token, uint256 requested, uint256 remaining);
    error NotAuthorized();
    error TransferFailed();

    modifier onlyAuthorized() {
        if (msg.sender != owner() && !authorizedSpenders[msg.sender]) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(address _agent) Ownable(_agent) {
        authorizedSpenders[_agent] = true;
    }

    receive() external payable {
        emit Deposited(address(0), msg.sender, msg.value);
    }

    /// @notice Deposit ERC-20 tokens into the vault
    function deposit(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(token, msg.sender, amount);
    }

    /// @notice Set daily spending budget for a token
    function setBudget(address token, uint256 dailyLimit) external onlyOwner {
        tokenBudgets[token].dailyLimit = dailyLimit;
        emit BudgetSet(token, dailyLimit);
    }

    /// @notice Authorize or revoke a spender
    function setSpender(address spender, bool authorized) external onlyOwner {
        authorizedSpenders[spender] = authorized;
        emit SpenderAuthorized(spender, authorized);
    }

    /// @notice Spend ETH from the vault (for gas, x402 payments, etc.)
    function spendEth(address payable to, uint256 amount) external onlyAuthorized nonReentrant {
        _checkBudget(address(0), amount);
        totalEthSpent += amount;
        totalTransactions++;

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(address(0), to, amount);
    }

    /// @notice Spend ERC-20 tokens from the vault
    function spendToken(
        address token,
        address to,
        uint256 amount
    ) external onlyAuthorized nonReentrant {
        _checkBudget(token, amount);
        totalTransactions++;

        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    /// @notice Get remaining daily budget for a token
    function remainingBudget(address token) public view returns (uint256) {
        Budget storage budget = tokenBudgets[token];
        if (budget.dailyLimit == 0) return type(uint256).max; // No limit set

        if (block.timestamp >= budget.lastResetTimestamp + 1 days) {
            return budget.dailyLimit;
        }
        if (budget.spentToday >= budget.dailyLimit) return 0;
        return budget.dailyLimit - budget.spentToday;
    }

    function _checkBudget(address token, uint256 amount) internal {
        Budget storage budget = tokenBudgets[token];
        if (budget.dailyLimit == 0) return; // No limit set

        // Reset daily counter if new day
        if (block.timestamp >= budget.lastResetTimestamp + 1 days) {
            budget.spentToday = 0;
            budget.lastResetTimestamp = block.timestamp;
        }

        uint256 remaining = budget.dailyLimit - budget.spentToday;
        if (amount > remaining) {
            revert ExceedsDailyBudget(token, amount, remaining);
        }
        budget.spentToday += amount;
    }
}
