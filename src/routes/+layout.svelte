<script>
	import '../app.css'
</script>

<div class="w-full bg-gray-200 flex items-center flex-col p-10">
	<ul class="flex flex-row pt-6 px-4 gap-12">
		<li><a href="/" class="underline text-indigo-400">Tip Jar</a></li>
		<li><a href="/withdraw" class="underline text-indigo-400">Withdraw</a></li>
	</ul>
	<div class="flex items-center flex-col p-10">
		<slot />
	</div>
</div>
