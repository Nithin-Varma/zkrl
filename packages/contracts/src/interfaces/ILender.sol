// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ILenderContract Interface
 * @dev Interface for individual lender contracts
 */
interface ILenderContract {
    
    // ============ STRUCTS ============
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        address[] collateralBonds;
        bool isActive;
        bool isRepaid;
    }
    
    // ============ EVENTS ============
    
    event FundsAdded(uint256 amount, uint256 newTotal);
    event InterestRateUpdated(uint256 newRate);
    event BondTransferred(address indexed bondAddress, address indexed from, address indexed to);
    event LoanCreated(bytes32 indexed loanId, address indexed borrower, uint256 amount, address[] collateralBonds);
    event LoanRepaid(bytes32 indexed loanId, uint256 amount);
    event BondReturned(address indexed bondAddress, address indexed to);
    
    // ============ FUNCTIONS ============
    
    // Lender functions
    function addFunds() external payable;
    function setInterestRate(uint256 _rate) external;
    function withdrawFunds(uint256 _amount) external;
    
    // Lending functions
    function verifyAndLend(
        address _borrower,
        uint256 _amount,
        uint256 _duration,
        address[] calldata _collateralBonds,
        bytes calldata _proof
    ) external;
    
    function repayLoan(bytes32 _loanId) external payable;
    
    // View functions
    function getOwnedBonds() external view returns (address[] memory);
    function getLoan(bytes32 _loanId) external view returns (Loan memory);
    function getBalance() external view returns (uint256);
    function interestRate() external view returns (uint256);
    function totalFunds() external view returns (uint256);
    function availableFunds() external view returns (uint256);
}
