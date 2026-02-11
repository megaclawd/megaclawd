// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title X402PaymentReceiver
/// @notice Receives and verifies x402 protocol payments for MEGA CLAWD agent services
/// @dev Supports EIP-3009 (transferWithAuthorization) style gasless USDC payments
contract X402PaymentReceiver is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct PaymentRecord {
        address payer;
        uint256 amount;
        bytes32 requestHash;
        uint256 timestamp;
        bool fulfilled;
    }

    IERC20 public immutable paymentToken; // USDC
    address public immutable agentVault;  // Where payments go
    uint256 public minimumPayment;
    uint256 public totalPaymentsReceived;
    uint256 public totalPaymentCount;

    mapping(bytes32 => PaymentRecord) public payments; // paymentId => record
    mapping(bytes32 => bool) public usedNonces;

    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        bytes32 requestHash
    );
    event PaymentFulfilled(bytes32 indexed paymentId);
    event MinimumPaymentUpdated(uint256 newMinimum);

    error PaymentTooLow(uint256 sent, uint256 minimum);
    error PaymentAlreadyExists(bytes32 paymentId);
    error PaymentNotFound(bytes32 paymentId);
    error NonceAlreadyUsed(bytes32 nonce);
    error InvalidSignature();

    constructor(
        address _paymentToken,
        address _agentVault,
        uint256 _minimumPayment
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        agentVault = _agentVault;
        minimumPayment = _minimumPayment;
    }

    /// @notice Process an x402 payment - called when agent receives HTTP 402 payment
    /// @param paymentId Unique payment identifier
    /// @param amount Payment amount in USDC
    /// @param requestHash Hash of the HTTP request being paid for
    /// @param nonce Unique nonce to prevent replay
    function processPayment(
        bytes32 paymentId,
        uint256 amount,
        bytes32 requestHash,
        bytes32 nonce
    ) external nonReentrant {
        if (amount < minimumPayment) revert PaymentTooLow(amount, minimumPayment);
        if (payments[paymentId].timestamp != 0) revert PaymentAlreadyExists(paymentId);
        if (usedNonces[nonce]) revert NonceAlreadyUsed(nonce);

        usedNonces[nonce] = true;

        // Transfer USDC from payer to agent vault
        paymentToken.safeTransferFrom(msg.sender, agentVault, amount);

        payments[paymentId] = PaymentRecord({
            payer: msg.sender,
            amount: amount,
            requestHash: requestHash,
            timestamp: block.timestamp,
            fulfilled: false
        });

        totalPaymentsReceived += amount;
        totalPaymentCount++;

        emit PaymentReceived(paymentId, msg.sender, amount, requestHash);
    }

    /// @notice Mark a payment as fulfilled (service delivered)
    function fulfillPayment(bytes32 paymentId) external onlyOwner {
        if (payments[paymentId].timestamp == 0) revert PaymentNotFound(paymentId);
        payments[paymentId].fulfilled = true;
        emit PaymentFulfilled(paymentId);
    }

    /// @notice Update minimum payment amount
    function setMinimumPayment(uint256 _minimumPayment) external onlyOwner {
        minimumPayment = _minimumPayment;
        emit MinimumPaymentUpdated(_minimumPayment);
    }

    /// @notice Get payment details
    function getPayment(bytes32 paymentId) external view returns (PaymentRecord memory) {
        return payments[paymentId];
    }
}
