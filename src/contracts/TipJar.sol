// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import 'hardhat/console.sol';

contract TipJar {
  uint256 public totalTips;

  constructor() {
    console.log('New Smart Contract');
  }
}