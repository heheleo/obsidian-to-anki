<script lang="ts">
	import Icon from 'src/views/Icon.svelte';
	import type { CATEGORIES } from './category';

	const {
		categories,
		categoryIcons,
		defaultSelectedCategory,
		categoryChanged
	}: {
		categories: typeof CATEGORIES;
		categoryIcons: Record<string, string>;
		defaultSelectedCategory: string;
		categoryChanged: (newCategory: string) => void;
	} = $props();

	let selectedCategory = $state<string>(defaultSelectedCategory);

	/**
	 * Change the selected category, whilst also using the callback
	 * function.
	 */
	function changeCategory(newCategory: string) {
		selectedCategory = newCategory;
		categoryChanged(newCategory);
	}
</script>

<div class="mb-4 flex gap-2 items-center">
	<Icon icon="cog" class="size-4" />
	<span class="text-xl">Obsidian to Anki</span>
</div>

<div class="border-b border-[rgba(255,255,255,0.1)] flex flex-row gap-2">
	{#each Object.keys(categories) as categoryKey}
		{@const category = categories[categoryKey as keyof typeof categories]}

		<!-- Avoid buttons as I wanted to deviate from the default button styles -->
		<!-- This unfortunately results in less accessibility features -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			onclick={() => changeCategory(categoryKey)}
			aria-label={`Select settings category: ${category}`}
			class="o2a-tab -mb-[1px] flex gap-2 cursor-pointer p-2 rounded-t-lg justify-center items-center transition-colors border-b-2 border-transparent"
			class:o2a-tab-selected={selectedCategory === categoryKey}
		>
			<Icon icon={categoryIcons[categoryKey]} />
			<span>{category}</span>
		</div>
	{/each}
</div>

<style>
	.o2a-tab-selected {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: #add8e6;
	}

	.o2a-tab:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}
</style>
