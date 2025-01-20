import { PluginSettingTab } from 'obsidian';
import ObsidianToAnkiPlugin from 'src/main';
import { mount, unmount } from 'svelte';
import type { PluginSettings } from './defaults';
import CategoryComponent from './CategoryComponent.svelte';

/**
 * A mapping of category IDs with their corresponding names.
 */
export const CATEGORIES = {
	home: 'Home',
	parsing: 'Parsing',
	files: 'Files',
	anki: 'Anki'
};

/**
 * A mapping of category IDs with their corresponding icons.
 * Icons are from Lucide, see {@link https://lucide.dev/icons/}
 */
const CATEGORY_ICONS: Record<string, string> = {
	home: 'house',
	parsing: 'parentheses',
	files: 'folder',
	anki: 'sliders-vertical'
};

/**
 * This class is used to create a category within the settings page.
 */
export abstract class SettingsCategory {
	/**
	 * The main plugin instance.
	 */
	protected plugin: ObsidianToAnkiPlugin;

	constructor(plugin: ObsidianToAnkiPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Updates and saves a setting.
	 * @param setting the setting to update
	 * @param value the new value of the setting
	 * @returns {Promise<void>} a promise that resolves when the setting is updated
	 */
	protected async updateAndSaveSetting(
		setting: keyof PluginSettings,
		value: string
	) {
		this.plugin.settings[setting] = value;
		return this.plugin.saveSettings();
	}

	/**
	 * Displays the category.
	 * @param container the container element to display the category
	 */
	abstract display(container: HTMLElement): void;
}

/**
 * This class handles the category tab within the settings page.
 * @class
 */
export class PluginSettingsTab extends PluginSettingTab {
	/**
	 * The selected category.
	 */
	public selected = 'home';
	/**
	 * The element used to display various setting categories.
	 */
	private displayElement: HTMLElement;
	/**
	 * A mapping of category IDs with their corresponding classes.
	 */
	private categoryClasses: Record<string, SettingsCategory> = {};
	/**
	 * The callback function that will be called when the user switches category tabs.
	 */
	private onCategoryTabSwitch: (newCategory: string) => void;
	/**
	 * The Svelte component handling the setting categories.
	 */
	private categoryComponent: ReturnType<typeof CategoryComponent> | undefined;

	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin.app, plugin);
	}

	setCallback(onCategoryTabSwitch: (newCategory: string) => void): void {
		this.onCategoryTabSwitch = onCategoryTabSwitch;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Mount the Svelte component:
		this.categoryComponent = mount(CategoryComponent, {
			target: this.containerEl,
			props: {
				categories: CATEGORIES,
				categoryIcons: CATEGORY_ICONS,
				defaultSelectedCategory: this.selected,
				categoryChanged: this.onCategoryTabSwitch
			}
		});

		// Create the display element:
		this.displayElement = containerEl.createDiv({
			cls: 'o2a-settings-display'
		});

		// Display the default category:
		this.displayCategory(this.selected);
	}

	hide() {
		if (this.categoryComponent) {
			// Unmount the Svelte component:
			unmount(this.categoryComponent);
		}
	}

	/**
	 * Displays the category.
	 * @param category the category to display
	 * @returns {void}
	 */
	displayCategory(category: string): void {
		// Empty the container:
		this.displayElement.empty();

		// Get the category class:
		const categoryClass = this.categoryClasses[category];
		if (!categoryClass) return;

		// Display the category:
		categoryClass.display(this.displayElement);
	}

	/**
	 * Sets the categories for display.
	 * @param categories a mapping of category IDs with their corresponding
	 * classes
	 */
	setCategories(
		categories: Record<keyof typeof CATEGORIES, SettingsCategory>
	): void {
		this.categoryClasses = categories;
	}
}
