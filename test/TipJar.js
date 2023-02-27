const { expect } = require('chai')
const { ethers } = require('hardhat')
// const provider = waffle.provider

describe('TipJar smart contract', () => {
	let contract

	beforeEach(async () => {
		const contractFactory = await ethers.getContractFactory('TipJar')
		contract = await contractFactory.deploy()
		await contract.deployed()
	})

	it('should deploy the contract and return 0 as totalTips', async () => {
		expect(await contract.totalTips()).to.equal(0)
	})

	it('should allow to send a tip and increase the num of total tips stored', async () => {
		const [, sender] = await ethers.getSigners()
		const senderBalance = await sender.getBalance()

		const txn = await contract
			.connect(sender)
			.sendTip('message', 'name', { value: ethers.utils.parseEther('0.001') })
		await txn.wait()

		const newSenderBanalce = await sender.getBalance()

		expect(txn).changeEtherBalance(contract.address, ethers.utils.parseEther('0.001'))
		expect(newSenderBanalce).to.be.below(senderBalance)
		expect(await contract.totalTips()).to.equal(1)
	})

	it('should return all the tips', async () => {
		const amount = ethers.utils.parseEther('0.002')
		const [, sender] = await ethers.getSigners()
		const txn = await contract.connect(sender).sendTip('message 2', 'name 2', { value: amount })
		await txn.wait()
		const tips = await contract.getAllTips()
		console.log(tips)
		expect(await contract.totalTips()).to.equal(1)
		expect(tips.length).to.equal(1)
		expect(tips[0].message).to.equal('message 2')
		expect(tips[0].amount).to.be.equal(amount)
	})

	it('should fail to send eth bigger than the balance', async () => {
		const [, sender] = await ethers.getSigners()
		const amount = ethers.utils.parseEther('9999')
		const txn = contract.connect(sender).sendTip('message 2', 'name 2', { value: amount })
		await expect(txn).to.be.revertedWith('Not enough funds')
	})

	it('should react to the tip event', async () => {
		const [, sender] = await ethers.getSigners()
		const amount = ethers.utils.parseEther('0.1')
		const txn = await contract.connect(sender).sendTip('event message', 'event', { value: amount })
		await txn.wait()
		expect(txn)
			.to.emit(contract, 'NewTip')
			.withArgs(sender.address, 'event message', 'event', amount)
	})

	it('should allow the owner to withdraw the whole balance', async () => {
		const [owner, sender] = await ethers.getSigners()
		const amount = ethers.utils.parseEther('0.2')
		const tx = await contract.connect(sender).sendTip('event message', 'event', { value: amount })
		await tx.wait()

		const ownerBalance = await owner.getBalance()
		const contractBalance = await ethers.provider.getBalance(contract.address)
		const tips = await contract.getAllTips()
		const sumTips = tips.reduce((acc, tip) => acc.add(tip.amount), ethers.BigNumber.from(0))
		expect(sumTips).to.be.equals(contractBalance)

		const txn = await contract.connect(owner).withdraw()
		await txn.wait()
		expect(txn).changeEtherBalance(contract, contractBalance.mul(-1))
		expect(txn).changeEtherBalance(owner, contractBalance)

		const newOwnerBalance = await owner.getBalance()
		expect(newOwnerBalance).to.be.above(ownerBalance)

		expect(txn).to.emit(contract, 'NewWithdraw').withArgs(contractBalance)
	})

	it('should reject withdrawal from another address than the owner', async () => {
		const [, otherUser] = await ethers.getSigners()
		const txn = contract.connect(otherUser).withdraw()
		expect(txn).to.be.revertedWith('Withdraw failed')
	})
})
