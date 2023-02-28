<script>
	// Your selected Skeleton theme:
	import '@skeletonlabs/skeleton/themes/theme-modern.css'

	// This contains the bulk of Skeletons required styles:
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.css'

	import { AppShell, AppBar, LightSwitch } from '@skeletonlabs/skeleton'
	import { ThreeDRotate, NoCopyright } from 'tabler-icons-svelte'
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4" slotFooter="px-10 py-5 flex justify-center">
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead"
				><ThreeDRotate class="ml-5" size="32" strokeWidth="2" /></svelte:fragment
			>
			<h2>Tip Jar</h2>
			<svelte:fragment slot="trail"><LightSwitch /></svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<!-- Insert the list: -->
		<nav class="list-nav">
			<ul>
				<li><a href="/">Tip Jar</a></li>
				<li><a href="/withdraw">Withdraw</a></li>
				<li>
					<a href="https://github.com/millisami/tipjar" target="_blank" rel="noreferrer">Code</a>
				</li>
			</ul>
		</nav>
		<!-- --- -->
	</svelte:fragment>
	<!-- Router Slot -->
	<div class="container mx-auto p-8 space-y-8">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer">
		<NoCopyright />
	</svelte:fragment>
</AppShell>
