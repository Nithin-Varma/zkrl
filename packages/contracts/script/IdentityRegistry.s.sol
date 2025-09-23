// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { IdentityRegistry } from "../src/IdentityRegister.sol";

contract IdentityRegistryScript is Script {
    function run() public {
        uint256 deployerKey = vm.envUint("NITHIN_TEST_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        address zkVerify = 0x201B6ba8EA862d83AAA03CFbaC962890c7a4d195;
        bytes32 vkey = 0x0b692be7b498a34664f07464866c2948b3ba925657185e5f2323be452bfd6722;
        IdentityRegistry identityRegistry = new IdentityRegistry(zkVerify, vkey);
        vm.stopBroadcast();

        console2.log("IdentityRegistry deployed.... to:", address(identityRegistry));
    }
}