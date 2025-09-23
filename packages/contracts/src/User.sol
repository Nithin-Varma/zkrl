// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IUser} from "./interfaces/IUser.sol";
import {Bond} from "./Bond.sol";
import {IBond} from "./interfaces/IBond.sol";
import {IUserFactory} from "./interfaces/IUserFactory.sol";
import {BondFactory} from "./factories/BondFactory.sol";

contract User is IUser{

    address public owner;
    address[] public allBonds;
    UserDetails public user;

    constructor(address _user) {
        owner = _user;
        user = UserDetails({
            userAddress: _user,
            trustScore: 0,
            totalBonds: 0,
            totalAmount: 0,
            totalWithdrawnBonds: 0,
            totalBrokenBonds: 0,
            totalActiveBonds: 0,
            totalWithdrawnAmount: 0,
            totalBrokenAmount: 0,
            createdAt: block.timestamp
        });
        emit UserCreated(_user, block.timestamp);
    }

    function createBond(address partner, address userFactory, address bondFactory) external {
        require(msg.sender == owner, "Only owner can create bonds");
        require(partner != address(0), "Invalid partner address");
        require(partner != owner, "Cannot create bond with self");
        
        // Check if partner has a User contract, if not create one
        IUserFactory userFactoryContract = IUserFactory(userFactory);
        address partnerUserContract;
        
        if (userFactoryContract.hasUserContract(partner)) {
            partnerUserContract = userFactoryContract.getUserContract(partner);
        } else {
            partnerUserContract = userFactoryContract.createUser(partner);
        }
        
        // Create the bond using BondFactory
        BondFactory bondFactoryContract = BondFactory(bondFactory);
        address bondAddress = bondFactoryContract.createBond(address(0), address(this), partnerUserContract);
        
        // Track the bond
        allBonds.push(bondAddress);
        user.totalBonds += 1;
        user.totalActiveBonds += 1;
        
        emit BondDeployed(bondAddress, owner, partner, 0, block.timestamp);
    }
    
    function getAllBonds() external view returns(address[] memory) {
        return allBonds;
    }
    
    function getBondCount() external view returns(uint256) {
        return allBonds.length;
    }

    function getUserDetails() external view returns(IUser.UserDetails memory) {
        return user;
    }

    function updateTrustScore(uint256 newTrustScore) external {
        // Only allow the user themselves or authorized contracts to update trust score
        // require(msg.sender == owner, "Only owner can update trust score");
        user.trustScore = newTrustScore;
    }
}
