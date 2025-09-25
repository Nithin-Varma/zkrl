// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Lender} from "../Lender.sol";

contract LenderFactory {
    
    mapping(address => address) public lender;
    address[] public allLenders;
    
    event LenderContractCreated(address indexed lender, address indexed contractAddress);
    

    function createLenderContract(uint256 _interestRate) external returns (address) {
        require(lender[msg.sender] == address(0), "Lender contract already exists");
        
        Lender newContract = new Lender(_interestRate);
        lender[msg.sender] = address(newContract);
        allLenders.push(msg.sender);
        
        emit LenderContractCreated(msg.sender, address(newContract));
        return address(newContract);
    }
    
    function getLenderContract(address _lender) external view returns (address) {
        return lender[_lender];
    }
    
    function hasLenderContract(address _lender) external view returns (bool) {
        return lender[_lender] != address(0);
    }

    function getAllLenders() external view returns (address[] memory) {
        return allLenders;
    }
    
    function getLenderCount() external view returns (uint256) {
        return allLenders.length;
    }
}
