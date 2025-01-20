import ObsidianToAnkiPlugin from 'src/main';
import AnkiCategory from './categories/anki';
import FilesCategory from './categories/files';
import HomeCategory from './categories/home';
import ParsingCategory from './categories/parsing';
import { PluginSettingsTab } from './category';

/**
 * Configures setting tabs to the plugin, with the ability of displaying
 * different categories of settings.
 * @param plugin the plugin instance
 */
export function configureSettingTabs(plugin: ObsidianToAnkiPlugin) {
	const settingsTab = new PluginSettingsTab(plugin);

	// Construct the category display, which handles displaying each category class:
	settingsTab.setCategories({
		home: new HomeCategory(plugin),
		files: new FilesCategory(plugin),
		parsing: new ParsingCategory(plugin),
		anki: new AnkiCategory(plugin)
	});

	// This is the callback function that will be called when the user switches
	// category tabs:
	const onCategoryTabSwitch = (newCategory: string) => {
		// Display different categories based on the tab switch:
		settingsTab.displayCategory(newCategory);
	};
	// Set the callback function:
	settingsTab.setCallback(onCategoryTabSwitch);

	// Add the settings tab to the plugin:
	plugin.addSettingTab(settingsTab);
}
