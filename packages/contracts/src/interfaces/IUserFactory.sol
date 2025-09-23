//SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

interface IUserFactory {

    function createUser(address user) external returns(address);
    function getUserContract(address wallet) external view returns(address);
    function hasUserContract(address wallet) external view returns(bool);
}