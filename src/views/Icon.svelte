<script lang="ts">
	import { setIcon } from 'obsidian';
	import { onMount } from 'svelte';

	const { icon, class: className }: { icon: string; class?: string } =
		$props();

	let container: HTMLDivElement;
	onMount(() => {
		setIcon(container, icon);

		if (!className) return;
		const iconElement = container.children?.[0];
		if (!iconElement) return;
		iconElement.classList.add(className);
	});
</script>

<div bind:this={container}></div>
