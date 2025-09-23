//SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {User} from "./User.sol";
import {IUser} from "./interfaces/IUser.sol";
import {IUserFactory} from "./interfaces/IUserFactory.sol";

interface IVerifyProofAggregation {
    function verifyProofAggregation(
        uint256 _domainId,
        uint256 _aggregationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external view returns (bool);
}

contract IdentityRegistry {

    mapping(bytes32 => address) public identityToAddress;
    mapping(address => bytes32) public addressToIdentity;
    mapping(address => bool) public isVerified;
    mapping(bytes32 => bool) public usedProofs;
    mapping(address => address) public addressToUser;

    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));
    bytes32 public vkey;

    address public zkVerify;
    IUserFactory public userFactory;

    event AadhaarVerified(address indexed wallet, bytes32 identityHash);
    event AadhaarRevoked(address indexed wallet, bytes32 identityHash);

    error ProofAlreadyUsed(address existing);

    constructor(address _zkVerify, bytes32 _vkey, address _userFactory) {
        zkVerify = _zkVerify;
        vkey = _vkey;
        userFactory = IUserFactory(_userFactory);
    }

    function verifyAadhar(
        address wallet, 
        bytes32 identityHash, 
        uint256 _hash,
        uint256 _aggregationId,
        uint256 _domainId,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
        ) public {
            bytes32 leaf = keccak256(abi.encodePacked(PROVING_SYSTEM_ID, vkey, VERSION_HASH, keccak256(abi.encodePacked(_changeEndianess(_hash)))));

            bytes32 proofId = keccak256(abi.encodePacked(leaf, _aggregationId, _domainId));
            address existing = identityToAddress[identityHash];
            if(usedProofs[proofId]) {
                revert ProofAlreadyUsed(existing);
            }


            address existingWallet = identityToAddress[identityHash];
            require(existingWallet == address(0) || existingWallet == wallet, "Identity already linked");
            bytes32 existingIdentity = addressToIdentity[wallet];
            require(existingIdentity == bytes32(0) || existingIdentity == identityHash, "Wallet already linked");

            require(IVerifyProofAggregation(zkVerify).verifyProofAggregation(
                _domainId,
                _aggregationId,
                leaf,
                _merklePath,
                _leafCount,
                _index
            ), "Invalid proof");

            usedProofs[proofId] = true;

            identityToAddress[identityHash] = wallet;
            addressToIdentity[wallet] = identityHash;
            isVerified[wallet] = true;
            // createUser(wallet);
            IUser user = IUser(userFactory.createUser(wallet));
            addressToUser[wallet] = address(user);

            emit AadhaarVerified(wallet, identityHash);
    }

    function revokeAadhar(address wallet, bytes32 identityHash) public {}

    function checkVerified(address wallet) external view returns (bool) {
        return isVerified[wallet];
    }

    // function createUser(address wallet) private {
    //     // User user = new User();
    //     // addressToUser[wallet] = address(user);
    // }

    //INTERNAL
    function _changeEndianess(uint256 input) internal pure returns (uint256 v) {
        v = input;
        // swap bytes
        v =
            ((v &
                0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00) >>
                8) |
            ((v &
                0x00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF) <<
                8);
        // swap 2-byte long pairs
        v =
            ((v &
                0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000) >>
                16) |
            ((v &
                0x0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF) <<
                16);
        // swap 4-byte long pairs
        v =
            ((v &
                0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000) >>
                32) |
            ((v &
                0x00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF) <<
                32);
        // swap 8-byte long pairs
        v =
            ((v &
                0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000) >>
                64) |
            ((v &
                0x0000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF) <<
                64);
        // swap 16-byte long pairs
        v = (v >> 128) | (v << 128);
    }
}