<script lang="ts">
	import { setIcon } from 'obsidian';
	import { onMount } from 'svelte';

	const { icon, class: className }: { icon: string; class?: string } =
		$props();

	let container: HTMLSpanElement;
	onMount(() => {
		setIcon(container, icon);
		if (!className) return;
		const iconElement = container.children?.[0];
		if (!iconElement) return;
		iconElement.classList.add(...className.split(" "));
	});
</script>

<span bind:this={container} class="flex justify-center items-center"></span>
