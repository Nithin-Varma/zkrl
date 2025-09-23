// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IBond} from "./interfaces/IBond.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IUserFactory} from "./interfaces/IUserFactory.sol";
import {IUser} from "./interfaces/IUser.sol";

contract Bond is IBond, ReentrancyGuard {

    uint256 public constant MAX_BPS = 10000;


    mapping(address => uint256) public individualAmount;
    // mapping(address => uint256) public claimableYield;
    mapping(address => uint256) public individualPercentage;

    mapping(address => address) public userToPartner;

    uint256 public constant W1 = 30000;
    uint256 public constant W2 = 20000;
    uint256 public constant W3 = 50000;

    BondDetails public bond;
    mapping(address => bool) public isUser;
    IUserFactory public userFactory;

    constructor(address _asset, address _user1, address _user2, address _userFactory) {
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
        userFactory = IUserFactory(_userFactory);
        userToPartner[_user1] = _user2;
        userToPartner[_user2] = _user1;
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

    function freezeBond() private {
        bond.isFreezed = true;
        // to whom we can give the access/authority of this bond ??????????
    }

    function getUserDetails(address _user) private view returns(IUser.UserDetails memory) {

        IUser user = IUser(userFactory.getUserContract(_user));
        return user.getUserDetails();
    }

     /*
    -------------------------------------------------
    -------------Trust Score Calculation-------------
    -------------------------------------------------
    */

    function calculateTrustScore(address user) private view returns (uint256) {
        IUser.UserDetails memory userDetails = getUserDetails(user);
        IUser.UserDetails memory partnerDetails = getUserDetails(userToPartner[user]);
        
        uint256 lnComponent = W1 * _ln(1 + bond.totalBondAmount);
        uint256 sqrtComponent = W2 * _sqrt(block.timestamp - bond.createdAt);
        uint256 partnerComponent = W3 * ((partnerDetails.trustScore / 100) * (individualAmount[userToPartner[user]] / bond.totalBondAmount));
        
        return (lnComponent + sqrtComponent + partnerComponent);
    }

    function calculateBreakingPenalty(address breaker) private view{
        IUser.UserDetails memory breakerDetails = getUserDetails(breaker);
        uint256 breakerTrustScore = breakerDetails.trustScore;
        breakerDetails.trustScore = breakerTrustScore - (calculateTrustScore(breaker) + _sqrt(bond.totalBondAmount * breakerDetails.totalBrokenBonds));
    }

    function calculateWithdrawPenalty(address withdrawer) private view {
        IUser.UserDetails memory withdrawerDetails = getUserDetails(withdrawer);
        uint256 withdrawerTrustScore = withdrawerDetails.trustScore;
        withdrawerDetails.trustScore = withdrawerTrustScore + calculateTrustScore(withdrawer) - ( _sqrt(bond.totalBondAmount * withdrawerDetails.totalWithdrawnBonds));
    }


    /*
    -------------------------------------------------
    ----------Mathematical helper functions----------
    -------------------------------------------------
    */
    
    function _ln(uint256 x) internal pure returns (uint256 result) {
        if (x == 0) return 0;
        if (x == 1) return 0;
        
        if (x > 1) {
            uint256 y = x - 1;
            result = y;
            if (y > 0) {
                uint256 y2 = (y * y) / 1e18;
                result -= y2 / 2;
                if (y2 > 0) {
                    uint256 y3 = (y2 * y) / 1e18;
                    result += y3 / 3;
                }
            }
            return result;
        }
        
        // For x < 1, return 0 (ln of values < 1 is negative, but we return 0 for simplicity)
        return 0;
    }
    
    function _sqrt(uint256 x) internal pure returns (uint256 result) {
        if (x == 0) return 0;
        if (x == 1) return 1;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        result = y;
    }
}
