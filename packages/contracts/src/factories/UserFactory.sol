// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {User} from "../User.sol";
import {IUser} from "../interfaces/IUser.sol";

contract UserFactory {

    mapping(address => bool) public isUser;
    mapping(address => address) public walletToUserContract;

    function createUser(address wallet) external returns(address) {
        require(walletToUserContract[wallet] == address(0), "User contract already exists");
        
        User user = new User(wallet);
        address userContract = address(user);
        
        isUser[userContract] = true;
        walletToUserContract[wallet] = userContract;
        
        return userContract;
    }

    function getUserContract(address wallet) external view returns(address) {
        return walletToUserContract[wallet];
    }

    function hasUserContract(address wallet) external view returns(bool) {
        return walletToUserContract[wallet] != address(0);
    }
}