// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IBond} from "./interfaces/IBond.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Bond is IBond, ReentrancyGuard {

    uint256 public constant MAX_BPS = 10000;

    mapping(address => uint256) public individualAmount;
    // mapping(address => uint256) public claimableYield;
    mapping(address => uint256) public individualPercentage;

    BondDetails public bond;
    mapping(address => bool) public isUser;

    constructor(address _asset, address _user1, address _user2) {
        bond = BondDetails({
            asset: _asset,
            user1: _user1,
            user2: _user2,
            totalBondAmount: 0,
            createdAt: block.timestamp,
            isBroken: false,
            isWithdrawn: false,
            isActive: true,
            isFreezed: false
        });
        individualPercentage[_user1] = 100;
        isUser[_user1] = true;
        isUser[_user2] = true;
        emit BondCreated(address(this), _user1, _user2, 0, block.timestamp);
    }

    function stake(address user, uint256 _amount) external override nonReentrant returns (BondDetails memory) {
        _onlyActive();
        individualAmount[user] += _amount;
        bond.totalBondAmount += _amount;
        individualPercentage[bond.user1] = (individualAmount[bond.user1] * MAX_BPS) / bond.totalBondAmount;
        individualPercentage[bond.user2] = (individualAmount[bond.user2] * MAX_BPS) / bond.totalBondAmount;
        return bond;
    }

    function withdraw(address to) external override nonReentrant returns (BondDetails memory) {
        _onlyActive();
        _onlyUser();
        _freezed();
        uint256 withdrawable = individualAmount[msg.sender];
        individualAmount[msg.sender] = 0;
        bond.isWithdrawn = true;
        emit BondWithdrawn(address(this), bond.user1, bond.user2, msg.sender, withdrawable, block.timestamp);
        return bond;
    }

    function breakBond(address _to) external override nonReentrant returns (BondDetails memory) {
        _onlyActive();
        _onlyUser();
        _freezed();
        bond.isBroken = true;
        bond.isActive = false;
        individualAmount[bond.user1] = 0;
        individualAmount[bond.user2] = 0;
        emit BondBroken(address(this), bond.user1, bond.user2, msg.sender, bond.totalBondAmount, block.timestamp);
        return bond;
    }

    // private view functions

    function _onlyActive() private view {
        if (!bond.isActive) revert BondNotActive();
    }

    function _freezed() private view {
        if (bond.isFreezed) revert BondIsFreezed();
    }

    function _onlyUser() private view {
        if (!isUser[msg.sender]) revert UserIsNotAOwnerForThisBond();
    }

    // function requestForCollateral() external override {
    //     _onlyActive();
    //     _onlyUser();
    //     // Implementation for collateral request
    // }

    // function acceptForCollateral() external override {
    //     _onlyActive();
    //     _onlyUser();
    //     // Implementation for accepting collateral
    // }

    // function unfreeze() external override {
    //     _onlyUser();
    //     bond.isFreezed = false;
    // }

    // function yieldServiceProvider() external view override returns (address) {
    //     return address(0); // TODO: Implement yield service provider
    // }

    // function collectYield(address _aAsset, address _user) external override {
    //     _onlyActive();
    //     _onlyUser();
    //     // Implementation for yield collection
    // }

    function freezeBond() private {
        bond.isFreezed = true;
        // to whom we can give the access/authority of this bond ??????????
    }
}
