import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { fstat, readFileSync, writeFileSync, promises as fsPromises  } from 'fs';
import { dirname, join } from 'path';
import { Request } from 'request';

export default class MyPlugin extends Plugin {

	async onload() {
		const running = this.app
		const { basePath } = (running.vault.adapter as any); // const { peppe } = ciao.arrivederci ---> const peppe = ciao.arrivederci.peppe
		const dummy_partialPath = ".obsidian/plugins/smogon-to-obsidian-importer/dummy.txt"

		/* Write into Dummy file */
		const dummy_fullPath = join(basePath, dummy_partialPath);
		
		let pokemon_name = 'pidgeot';
		let version = 'ss';

		const request = require('request');
		
		request(`https://www.smogon.com/dex/${version}/pokemon/${pokemon_name}`, function (error: any, response: any, body: any) {
			console.error('error:', error); // Print the error if one occurred
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			console.log('body:', body); // Print the HTML for the Google homepage.
			this.resetFile(dummy_fullPath);
			this.writeFile(dummy_fullPath, body);
		});
	}

	onunload() {

	}

	async writeFile(outputDir: string, data: any) {
		try {
			await fsPromises.writeFile(outputDir, data, {flag: 'a+'});
		  	
			return;
		} catch (err) { return console.log(err) }
	}

	async resetFile(outputDir: string) {
		try {
			await fsPromises.truncate(outputDir, 0);
		  	
			return;
		} catch (err) { return console.log(err) }
	}
}