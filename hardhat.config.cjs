require('@nomiclabs/hardhat-waffle')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.17',
	paths: {
		artifacts: './src/artifacts',
		sources: './src/contracts'
	},
	networks: {
		hardhat: {
			chainId: 1337
		},
		goerli: {
			url: process.env.ALCHEMY_URL,
			accounts: [process.env.PRIVATE_KEY]
		}
	}
}
