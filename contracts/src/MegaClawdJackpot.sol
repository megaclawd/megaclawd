// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MegaClawdJackpot
/// @notice Permissionless jackpot game: 1 USDC entry, 24h rounds.
///         50% to random winner, 50% used to buyback $MEGACLAWD via Uniswap V3.
/// @dev Deployed on Base L2.
contract MegaClawdJackpot is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- Constants ---
    uint256 public constant ENTRY_AMOUNT = 1e6; // 1 USDC (6 decimals)
    uint256 public constant ROUND_DURATION = 24 hours;
    uint256 public constant WINNER_BPS = 5000; // 50%
    uint256 public constant BUYBACK_BPS = 5000; // 50%

    // --- Immutables ---
    IERC20 public immutable usdc;
    address public immutable uniswapRouter;
    address public immutable megaClawdToken;

    // --- Round state ---
    uint256 public currentRound;
    uint256 public roundStartTime;
    uint256 public potBalance;
    address[] public players;
    mapping(address => bool) public hasEntered;

    // --- History ---
    struct RoundResult {
        address winner;
        uint256 winnerPrize;
        uint256 buybackAmount;
        uint256 playerCount;
        uint256 endTime;
    }
    mapping(uint256 => RoundResult) public roundResults;

    // --- Stats ---
    uint256 public totalBuybacks;
    uint256 public totalPrizes;

    // --- Events ---
    event RoundStarted(uint256 indexed round, uint256 startTime);
    event PlayerEntered(uint256 indexed round, address indexed player, uint256 playerCount);
    event RoundFinalized(
        uint256 indexed round,
        address indexed winner,
        uint256 prize,
        uint256 buyback,
        uint256 playerCount
    );

    error RoundNotOver();
    error AlreadyEntered();
    error NoPlayers();
    error TransferFailed();

    constructor(address _usdc, address _uniswapRouter, address _megaClawdToken) {
        usdc = IERC20(_usdc);
        uniswapRouter = _uniswapRouter;
        megaClawdToken = _megaClawdToken;

        currentRound = 1;
        roundStartTime = block.timestamp;
        emit RoundStarted(1, block.timestamp);
    }

    /// @notice Enter the current round by depositing 1 USDC
    function enter() external nonReentrant {
        if (hasEntered[msg.sender]) revert AlreadyEntered();

        usdc.safeTransferFrom(msg.sender, address(this), ENTRY_AMOUNT);

        players.push(msg.sender);
        hasEntered[msg.sender] = true;
        potBalance += ENTRY_AMOUNT;

        emit PlayerEntered(currentRound, msg.sender, players.length);
    }

    /// @notice Finalize the round after 24h. Callable by anyone.
    function finalizeRound() external nonReentrant {
        if (block.timestamp < roundStartTime + ROUND_DURATION) revert RoundNotOver();
        if (players.length == 0) revert NoPlayers();

        uint256 pot = potBalance;
        uint256 winnerPrize = (pot * WINNER_BPS) / 10000;
        uint256 buybackAmount = pot - winnerPrize;

        // Pick pseudo-random winner (sufficient for small-stakes game)
        uint256 winnerIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    players.length,
                    currentRound
                )
            )
        ) % players.length;

        address winner = players[winnerIndex];

        // Send prize to winner
        usdc.safeTransfer(winner, winnerPrize);
        totalPrizes += winnerPrize;

        // Send buyback portion to Uniswap router (approve + swap in production)
        // For now, hold buyback funds in contract for manual/bot swap
        totalBuybacks += buybackAmount;

        // Record result
        roundResults[currentRound] = RoundResult({
            winner: winner,
            winnerPrize: winnerPrize,
            buybackAmount: buybackAmount,
            playerCount: players.length,
            endTime: block.timestamp
        });

        emit RoundFinalized(currentRound, winner, winnerPrize, buybackAmount, players.length);

        // Reset for next round
        _resetRound();
    }

    /// @notice Get remaining time in current round (seconds)
    function timeRemaining() external view returns (uint256) {
        uint256 endTime = roundStartTime + ROUND_DURATION;
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }

    /// @notice Get number of players in current round
    function playerCount() external view returns (uint256) {
        return players.length;
    }

    /// @notice Get all players in current round
    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    /// @notice Get result of a past round
    function getRoundResult(uint256 round) external view returns (RoundResult memory) {
        return roundResults[round];
    }

    // --- Internal ---

    function _resetRound() internal {
        // Clear player entries
        for (uint256 i = 0; i < players.length; i++) {
            hasEntered[players[i]] = false;
        }
        delete players;
        potBalance = 0;

        currentRound++;
        roundStartTime = block.timestamp;
        emit RoundStarted(currentRound, block.timestamp);
    }
}
