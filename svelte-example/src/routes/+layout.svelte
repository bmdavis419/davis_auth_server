<script lang="ts">
	import '../app.css';
	let { children, data } = $props();

	$inspect(data);
</script>

<div class="flex min-h-screen w-full flex-col">
	<nav class="flex items-center justify-between p-4 py-2">
		<h3 class="text-2xl font-bold">SVELTEKIT + OPEN AUTH DEMO</h3>
		<div>
			{#if data.user}
				<a
					href="/auth/logout"
					class="rounded-md bg-red-500 px-4 py-2 text-white disabled:opacity-50">Logout</a
				>
			{:else}
				<a
					href="/auth/login"
					class="rounded-md bg-blue-500 px-4 py-2 text-white disabled:opacity-50">Login</a
				>
			{/if}
		</div>
	</nav>
	{@render children()}
</div>
