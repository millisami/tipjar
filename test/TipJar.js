const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('TipJar smart contract', () => {
	let contract

	it('should deploy the contract and return 0 as totalTips', async () => {
		const contractFactory = await ethers.getContractFactory('TipJar')
		contract = await contractFactory.deploy()
		await contract.deployed()
		expect(await contract.totalTips()).to.equal(0)
	})
})
