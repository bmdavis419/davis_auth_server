<script>
	const { data } = $props();
</script>

{#if data.user}
	<p>Welcome {data.user.properties.name}</p>
{:else}
	<p>Please login</p>
{/if}
