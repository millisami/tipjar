<script>
	import { onMount } from 'svelte'
	import { ethers, providers } from 'ethers'
	import TipJarABI from '../../artifacts/src/contracts/TipJar.sol/TipJar.json'

	let userAddress = null
	let network = null
	let balance = null
	let contractBalance = null
	let isConnected = false
	let provider = null

	const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
	let amITheOwner = false

	let contract = null
	let allTips = []
	let isWithdrawing = false

	async function setupContract() {
		if (isConnected) {
			contract = new ethers.Contract(contractAddress, TipJarABI.abi, provider)
			const contractOwner = await contract.owner()
			amITheOwner = ethers.utils.getAddress(contractOwner) === ethers.utils.getAddress(userAddress)
			contract.on('NewWithdrawl', async () => {
				contractBalance = await provider.getBalance(contractAddress)
				balance = await provider.getBalance(userAddress)
				isWithdrawing = false
			})
		}
	}

	async function setup(accounts) {
		userAddress = accounts[0]
		try {
			provider = new ethers.providers.Web3Provider(window.ethereum)
			network = await provider.getNetwork()
			balance = await provider.getBalance(userAddress)
			contractBalance = await provider.getBalance(contractAddress)
			isConnected = true
			setupContract()
		} catch (error) {
			console.log(error)
		}
	}
	async function connectWallet() {
		if (window.ethereum) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
			if (accounts.length > 0) {
				await setup(accounts)
			} else {
				alert('No accounts found')
			}
		} else {
			alert('No ethereum wallet found')
		}
	}

	onMount(async () => {
		if (window.ethereum) {
			const accounts = await window.ethereum.request({ method: 'eth_accounts' })
			if (accounts.length > 0) {
				await setup(accounts)
			}
		}
	})

	async function withdraw() {
		if (isConnected) {
			isWithdrawing = true
			const rwContract = new ethers.Contract(contractAddress, TipJarABI.abi, provider.getSigner())
			const tx = await rwContract.withdraw()
			await tx.wait()
		}
	}
</script>

{#if isConnected}
	<h1 class="text-3xl text-gray-800 p-8">Withdraw from the TipJar contract</h1>
	<div class="text-sm text-gray-500 pb-4 flex flex-col gap-4">
		<p class="text-xl text-green-600">
			Successfully connected with account <strong>{userAddress}</strong>
		</p>
		<ul>
			<li>Current network: {network.name}</li>
			<li>Current balance: {ethers.utils.formatEther(balance)}</li>
			<li>Current contract balance: {ethers.utils.formatEther(contractBalance)}</li>
		</ul>
		{#if amITheOwner}
			{#if contractBalance.eq(0)}
				<p class="text-xl text-red-500">There is no balance to withdraw</p>
			{/if}
			<button
				class="btn variant-filled-primary w-3/12"
				on:click={withdraw}
				disabled={isWithdrawing || contractBalance.eq(0)}
				>{isWithdrawing ? 'Withdrawing...' : 'Withdraw'}</button
			>
		{:else}
			<p class="variant-filled-error rounded-md px-3 py-2">
				Only the owner of the contract can withdraw the balance
			</p>
		{/if}
	</div>
{:else}
	<button class="btn variant-filled-primary" on:click={connectWallet}> Connect with Wallet </button>
{/if}
