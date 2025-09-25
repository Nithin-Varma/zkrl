// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBond.sol";
import "./interfaces/IUser.sol";

contract Lender is ReentrancyGuard, Ownable {
    
    
    uint256 public interestRate;
    uint256 public totalFunds;
    uint256 public availableFunds;
    
    mapping(address => bool) public ownedBonds;
    address[] public bondAddresses;
    
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
    
    mapping(bytes32 => Loan) public loans;
    uint256 public totalLoans;
    
    event FundsAdded(uint256 amount, uint256 newTotal);
    event InterestRateUpdated(uint256 newRate);
    event BondTransferred(address indexed bondAddress, address indexed from, address indexed to);
    event LoanCreated(bytes32 indexed loanId, address indexed borrower, uint256 amount, address[] collateralBonds);
    event LoanRepaid(bytes32 indexed loanId, uint256 amount);
    event BondReturned(address indexed bondAddress, address indexed to);
    
    error InsufficientFunds();
    error InvalidInterestRate();
    error BondNotOwned();
    error LoanNotFound();
    error LoanNotActive();
    error LoanAlreadyRepaid();
    error InvalidProof();
    
    constructor(uint256 _interestRate) Ownable(msg.sender) {
        interestRate = _interestRate;
    }
    
    function addFunds() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        totalFunds += msg.value;
        availableFunds += msg.value;
        emit FundsAdded(msg.value, totalFunds);
    }
    
    function setInterestRate(uint256 _rate) external onlyOwner {
        require(_rate > 0 && _rate <= 10000, "Invalid interest rate"); // Max 100%
        interestRate = _rate;
        emit InterestRateUpdated(_rate);
    }
    
    function withdrawFunds(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= availableFunds, "Insufficient available funds");
        availableFunds -= _amount;
        totalFunds -= _amount;
        
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "ETH transfer failed");
    }
    
    function verifyAndLend(
        address _borrower,
        uint256 _amount,
        uint256 _duration,
        address[] calldata _collateralBonds,
        bytes calldata _proof
    ) external onlyOwner nonReentrant {
        require(_amount <= availableFunds, "Insufficient funds");
        require(_amount > 0, "Invalid amount");
        require(_collateralBonds.length > 0, "No collateral bonds");
        
        require(_verifyProof(_borrower, _collateralBonds, _proof), "Invalid proof");
        
        for (uint256 i = 0; i < _collateralBonds.length; i++) {
            address bondAddress = _collateralBonds[i];
            
            IBond bond = IBond(bondAddress);
            bondAddresses.push(bondAddress);
            
            emit BondTransferred(bondAddress, _borrower, address(this));
        }
        
        bytes32 loanId = keccak256(abi.encodePacked(_borrower, _amount, block.timestamp));
        loans[loanId] = Loan({
            borrower: _borrower,
            amount: _amount,
            interestRate: interestRate,
            duration: _duration,
            startTime: block.timestamp,
            collateralBonds: _collateralBonds,
            isActive: true,
            isRepaid: false
        });
        
        availableFunds -= _amount;
        totalLoans++;
        
        emit LoanCreated(loanId, _borrower, _amount, _collateralBonds);
        
        (bool success, ) = payable(_borrower).call{value: _amount}("");
        require(success, "ETH transfer failed");
    }
    
    function repayLoan(bytes32 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");
        
        uint256 interest = (loan.amount * loan.interestRate * (block.timestamp - loan.startTime)) / (10000 * 365 days);
        uint256 totalRepayment = loan.amount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment");
        
        loan.isRepaid = true;
        loan.isActive = false;
        
        availableFunds += loan.amount;
        
        for (uint256 i = 0; i < loan.collateralBonds.length; i++) {
            address bondAddress = loan.collateralBonds[i];
            ownedBonds[bondAddress] = false;
            emit BondReturned(bondAddress, msg.sender);
        }
        
        emit LoanRepaid(_loanId, totalRepayment);
        
        if (msg.value > totalRepayment) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalRepayment}("");
            require(success, "Refund failed");
        }
    }
    
    function getOwnedBonds() external view returns (address[] memory) {
        return bondAddresses;
    }
    
    function getLoan(bytes32 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function _verifyProof(
        address _borrower,
        address[] calldata _bonds,
        bytes calldata _proof
    ) internal pure returns (bool) {

        return _proof.length > 0 && _bonds.length > 0;
    }
}
