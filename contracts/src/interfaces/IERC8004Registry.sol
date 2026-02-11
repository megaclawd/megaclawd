// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC8004Registry
/// @notice Interface for the ERC-8004 Trustless Agents Identity Registry
/// @dev Registry deployed at 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 on Ethereum mainnet
interface IERC8004Registry {
    /// @notice Register a new agent and mint an identity NFT
    /// @param agentURI URI pointing to agent metadata JSON
    /// @return agentId The newly assigned agent ID (token ID)
    function register(string calldata agentURI) external returns (uint256 agentId);

    /// @notice Update the metadata URI for an existing agent
    /// @param agentId The agent's token ID
    /// @param agentURI New metadata URI
    function setAgentURI(uint256 agentId, string calldata agentURI) external;

    /// @notice Set the wallet address associated with an agent
    /// @param agentId The agent's token ID
    /// @param wallet The agent's operational wallet address
    function setAgentWallet(uint256 agentId, address wallet) external;

    /// @notice Get the metadata URI for an agent
    /// @param agentId The agent's token ID
    /// @return The agent's metadata URI
    function agentURI(uint256 agentId) external view returns (string memory);

    /// @notice Get the wallet address for an agent
    /// @param agentId The agent's token ID
    /// @return The agent's wallet address
    function agentWallet(uint256 agentId) external view returns (address);

    /// @notice Get agent metadata
    /// @param agentId The agent's token ID
    /// @return name The agent's name
    /// @return description The agent's description
    function getMetadata(uint256 agentId) external view returns (
        string memory name,
        string memory description
    );

    /// @notice Check if an agent ID exists
    /// @param agentId The agent's token ID
    /// @return Whether the agent exists
    function exists(uint256 agentId) external view returns (bool);

    /// @notice Get total number of registered agents
    /// @return Total agent count
    function totalAgents() external view returns (uint256);
}
