import './settings.css';
import { App, PluginSettingTab, Setting, addIcon, setIcon } from 'obsidian';
import ObsidianToAnkiPlugin from 'src/main';
import { DEFAULT_SETTINGS, PluginSettings } from '.';

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

	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin.app, plugin);
	}

	setCallback(onCategoryTabSwitch: (newCategory: string) => void): void {
		this.onCategoryTabSwitch = onCategoryTabSwitch;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Create a header:
		const headerContainer = containerEl.createDiv({
			cls: 'o2a-settings-header'
		});
		setIcon(headerContainer, 'settings');
		headerContainer.createEl('h2', {
			text: 'Obsidian to Anki Settings'
		});

		// Create the tabs row:
		const tabsContainer = containerEl.createDiv({
			cls: 'o2a-tabs-container'
		});

		// Create a tab for each category:
		for (const category in CATEGORIES) {
			// The name of the category.
			const categoryName =
				CATEGORIES[category as keyof typeof CATEGORIES];

			// A div is used here as I wanted to avoid the default Obsidian styling.
			// As a compromise, accessibility may be lacking:
			const tab = tabsContainer.createDiv({
				cls: 'o2a-tab',
				attr: {
					'aria-label': categoryName
				}
			});
			tab.id = `o2a-tab-${category}`;

			// Add an icon to the tab:
			const icon = CATEGORY_ICONS[category];
			if (icon) setIcon(tab, icon);

			// Set the label in the tab:
			tab.createEl('span', {
				text: categoryName,
				cls: 'o2a-tab-label'
			});

			// Add a click event listener to the tab:
			tab.onclick = () => clickTab(category);

			// Set the default selected tab:
			if (category === this.selected) {
				tab.setAttribute('selected', 'true');
			}
		}

		// The click handler for the tabs:
		const clickTab = (category: string) => {
			// Check if the category is already selected:
			if (category === this.selected) return;

			// Make the original category unselected:
			const beforeEl = document.getElementById(
				`o2a-tab-${this.selected}`
			);
			if (beforeEl) {
				beforeEl.removeAttribute('selected');
			}

			// Set the new category as selected:
			this.selected = category;
			const el = document.getElementById(`o2a-tab-${category}`);
			if (el) {
				el.setAttribute('selected', 'true');
			}

			// Call the callback function:
			this.onCategoryTabSwitch(category);
		};

		// Create the display element:
		this.displayElement = containerEl.createDiv({
			cls: 'o2a-settings-display'
		});

		// Display the default category:
		this.displayCategory(this.selected);
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
