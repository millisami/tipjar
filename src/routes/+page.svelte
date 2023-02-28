<script>
	import { onMount } from 'svelte'
	import { ethers, providers } from 'ethers'
	import TipJarABI from '../artifacts/src/contracts/TipJar.sol/TipJar.json'
	import { each } from 'svelte/internal'
	import { focusTrap } from '@skeletonlabs/skeleton'

	let userAddress = null
	let network = null
	let balance = null
	let isConnected = false
	let provider = null

	const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
	let contract = null
	let allTips = []
	let sendingTip = false
	let isFocused = true

	async function setupContract() {
		if (isConnected) {
			contract = new ethers.Contract(contractAddress, TipJarABI.abi, provider)
			contract.on('NewTip', async () => {
				balance = await provider.getBalance(userAddress)

				// Update the table
				await getAllTips()
				sendingTip = false
			})
		}
	}

	async function sendTip(event) {
		sendingTip = true
		const formData = new FormData(event.target)
		const data = {}
		for (let field of formData) {
			const [key, value] = field
			data[key] = value
		}

		const rwContract = new ethers.Contract(contractAddress, TipJarABI.abi, provider.getSigner())
		const tx = await rwContract.sendTip(data.message, data.name, {
			value: ethers.utils.parseEther(data.amount)
		})
		await tx.wait()
	}

	async function getAllTips() {
		if (isConnected) {
			const tips = await contract.getAllTips()
			allTips = tips.map((item) => {
				return {
					...item,
					timestamp: new Date(item.timestamp * 1000).toLocaleDateString(),
					amount: ethers.utils.parseEther(item.amount.toString())
				}
			})
		}
	}

	async function setup(accounts) {
		userAddress = accounts[0]
		try {
			provider = new ethers.providers.Web3Provider(window.ethereum)
			network = await provider.getNetwork()
			balance = await provider.getBalance(userAddress)
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
</script>

{#if isConnected}
	<p class="text-xl text-green-600">
		Successfully connected with account <strong>{userAddress}</strong>
	</p>
	<ul>
		<li>Current network: {network.name}</li>
		<li>Current balance: {ethers.utils.formatEther(balance)}</li>
	</ul>

	<form
		class="w-2/3 mx-auto border rounded-md border-indigo-200 flex flex-col gap-8 p-6 mt-4"
		on:submit|preventDefault={sendTip}
		use:focusTrap={isFocused}
	>
		<div class="grid grid-cols-2">
			<label for="amount" class="label">Send me an ETH tip!</label>
			<input type="text" name="amount" required class="input" placeholder="0.001" />
		</div>
		<div class="grid grid-cols-2">
			<label for="name">Your Name</label>
			<input type="text" name="name" required class="input" placeholder="Your name" />
		</div>
		<div class="grid grid-cols-2">
			<label for="message">Your Message</label>
			<input type="text" name="message" required class="input" />
		</div>
		<div class="flex justify-center">
			<button disabled={sendingTip} type="submit" class="btn variant-filled-primary w-2/3"
				>{sendingTip ? 'Sending Tip...' : 'Send a Tip!'}</button
			>
		</div>
	</form>

	<div class="table-container">
		<table class="table table-hover table-comfortable">
			<thead>
				<tr>
					<th>Sender Address</th>
					<th>Name</th>
					<th class="table-cell-fit">Message</th>
					<th>Timestamp</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each allTips as item}
					<tr>
						<td>{item.sender}</td>
						<td>{item.name}</td>
						<td class="table-cell-fit">{item.message}</td>
						<td>{item.timestamp}</td>
						<td>{item.amount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<div class="grid place-content-center h-96">
		<button class="btn variant-filled-primary" on:click={connectWallet}>
			Connect with Wallet
		</button>
	</div>
{/if}
