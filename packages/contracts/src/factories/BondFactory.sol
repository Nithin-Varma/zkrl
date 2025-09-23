// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Bond} from "../Bond.sol";
import {IBond} from "../interfaces/IBond.sol";

contract BondFactory {

    mapping(address => bool) public isBond;
    address[] public allBonds;

    function createBond(address asset, address user1, address user2) external returns(address) {
        Bond bond = new Bond(asset, user1, user2);
        address bondAddress = address(bond);
        
        isBond[bondAddress] = true;
        allBonds.push(bondAddress);
        
        return bondAddress;
    }

    function getAllBonds() external view returns(address[] memory) {
        return allBonds;
    }

    function getBondCount() external view returns(uint256) {
        return allBonds.length;
    }
}



