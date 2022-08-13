import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext } from 'obsidian';
import { fstat, readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { dirname, join } from 'path';
import { Request } from 'request';

export default class MyPlugin extends Plugin {

	async onload() {

		let test = `<section data-reactid=".0.1.1.4.1"><div class="PokemonAltInfo" data-reactid=".0.1.1.4.1.0:1"><div class="PokemonAltInfo-sprite" data-reactid=".0.1.1.4.1.0:1.0"><div style="background-image:url(https://www.smogon.com/dex/media/sprites/xy/wooper.gif);" data-reactid=".0.1.1.4.1.0:1.0.0"></div><img src="https://www.smogon.com/dex/media/sprites/xy/wooper.gif" data-reactid=".0.1.1.4.1.0:1.0.1"></div><div class="PokemonAltInfo-data" data-reactid=".0.1.1.4.1.0:1.1"><table class="PokemonSummary" data-reactid=".0.1.1.4.1.0:1.1.0"><tbody data-reactid=".0.1.1.4.1.0:1.1.0.0"><tr data-reactid=".0.1.1.4.1.0:1.1.0.0.0"><th data-reactid=".0.1.1.4.1.0:1.1.0.0.0.0"><span class="PokemonSummary-type" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.0.0">Type</span></th><td data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1"><div class="PokemonSummary-types" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0"><ul class="TypeList" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0.0.$Water"><a class="Type water" href="/dex/xy/types/water/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0.0.$Water.0">Water</a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0.0.$Ground"><a class="Type ground" href="/dex/xy/types/ground/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.0.0.$Ground.0">Ground</a></li></ul></div><div class="PokemonSummary-typeEffectivesPopup " data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1"><dl class="TypeEffectives" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0"><dt data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.0:0">Immune to:</dt><dd data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.0:1"><ul class="TypeList" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.0:1.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.0:1.0.$Electric"><a class="Type electric" href="/dex/xy/types/electric/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.0:1.0.$Electric.0">Electric</a></li></ul></dd><dt data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:0">Resists:</dt><dd data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1"><ul class="TypeList" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Fire"><a class="Type fire" href="/dex/xy/types/fire/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Fire.0">Fire</a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Poison"><a class="Type poison" href="/dex/xy/types/poison/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Poison.0">Poison</a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Rock"><a class="Type rock" href="/dex/xy/types/rock/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Rock.0">Rock</a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Steel"><a class="Type steel" href="/dex/xy/types/steel/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.1:1.0.$Steel.0">Steel</a></li></ul></dd><dt data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.2:0">Very weak to:</dt><dd data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.2:1"><ul class="TypeList" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.2:1.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.2:1.0.$Grass"><a class="Type grass" href="/dex/xy/types/grass/" data-reactid=".0.1.1.4.1.0:1.1.0.0.0.1.1.0.2:1.0.$Grass.0">Grass</a></li></ul></dd></dl></div></td></tr><tr data-reactid=".0.1.1.4.1.0:1.1.0.0.1"><th data-reactid=".0.1.1.4.1.0:1.1.0.0.1.0">Abilities</th><td data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1"><ul class="AbilityList" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Damp"><a class="AbilityLink" href="/dex/xy/abilities/damp/" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Damp.0"><span data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Damp.0.0">Damp</span><div class="AbilityPreview" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Damp.0.1">Prevents Explosion/Self-Destruct/Aftermath while this Pokemon is active.</div></a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Unaware"><a class="AbilityLink" href="/dex/xy/abilities/unaware/" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Unaware.0"><span data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Unaware.0.0">Unaware</span><div class="AbilityPreview" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Unaware.0.1">This Pokemon ignores other Pokemon's stat stages when taking or doing damage.</div></a></li><li data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Water Absorb"><a class="AbilityLink" href="/dex/xy/abilities/water-absorb/" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Water Absorb.0"><span data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Water Absorb.0.0">Water Absorb</span><div class="AbilityPreview" data-reactid=".0.1.1.4.1.0:1.1.0.0.1.1.0.$Water Absorb.0.1">This Pokemon heals 1/4 of its max HP when hit by Water moves; Water immunity.</div></a></li></ul></td></tr><tr data-reactid=".0.1.1.4.1.0:1.1.0.0.2"><th data-reactid=".0.1.1.4.1.0:1.1.0.0.2.0">Tier</th><td data-reactid=".0.1.1.4.1.0:1.1.0.0.2.1"><ul class="FormatList" data-reactid=".0.1.1.4.1.0:1.1.0.0.2.1.0"><li data-reactid=".0.1.1.4.1.0:1.1.0.0.2.1.0.$LC"><a href="/dex/xy/formats/lc/" data-reactid=".0.1.1.4.1.0:1.1.0.0.2.1.0.$LC.0">LC</a></li></ul></td></tr></tbody></table></div><div class="PokemonAltInfo-stats" data-reactid=".0.1.1.4.1.0:1.2"><table class="PokemonStats" data-reactid=".0.1.1.4.1.0:1.2.0"><tbody data-reactid=".0.1.1.4.1.0:1.2.0.0"><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.0"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.0.0">HP:</th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.0.1">55</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.0.2"><div class="PokemonStats-bar" style="width:27.500000000000004%;background-color:#ff1800;" data-reactid=".0.1.1.4.1.0:1.2.0.0.0.2.0"></div></td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.1"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.1.0">Attack:</th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.1.1">45</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.1.2"><div class="PokemonStats-bar" style="width:22.5%;background-color:#ff0000;" data-reactid=".0.1.1.4.1.0:1.2.0.0.1.2.0"></div></td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.2"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.2.0">Defense:</th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.2.1">45</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.2.2"><div class="PokemonStats-bar" style="width:22.5%;background-color:#ff0000;" data-reactid=".0.1.1.4.1.0:1.2.0.0.2.2.0"></div></td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.3"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.3.0">Sp. Atk:</th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.3.1">25</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.3.2"><div class="PokemonStats-bar" style="width:12.5%;background-color:#ff0000;" data-reactid=".0.1.1.4.1.0:1.2.0.0.3.2.0"></div></td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.4"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.4.0">Sp. Def:</th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.4.1">25</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.4.2"><div class="PokemonStats-bar" style="width:12.5%;background-color:#ff0000;" data-reactid=".0.1.1.4.1.0:1.2.0.0.4.2.0"></div></td></tr><tr class="PokemonStats-speed" data-reactid=".0.1.1.4.1.0:1.2.0.0.5"><th data-reactid=".0.1.1.4.1.0:1.2.0.0.5.0"><span class="PokemonStats-speed-title" data-reactid=".0.1.1.4.1.0:1.2.0.0.5.0.0">Speed</span><span data-reactid=".0.1.1.4.1.0:1.2.0.0.5.0.1">:</span></th><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.1">15</td><td class="PokemonStats-speed-cell" data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2"><div class="PokemonStats-bar" style="width:7.5%;background-color:#ff0000;" data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.0"></div><div class="PokemonStats-speed-popup" data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1"><table data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0"><tbody data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0"><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.0"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.0.0">Min (-ve nature, 0 IVs)</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.0.1">5</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.1"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.1.0">Default</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.1.1">8</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.2"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.2.0">Max Neutral</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.2.1">11</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.3"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.3.0">Max Positive</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.3.1">12</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.4"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.4.0">Max Neutral (+1)</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.4.1">16</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.5"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.5.0">Max Positive (+1)</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.5.1">18</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.6"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.6.0">Max Neutral (+2)</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.6.1">22</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.7"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.7.0">Max Positive (+2)</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.7.1">24</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.8"><td colspan="2" class="PokemonStats-speed-popup-format" data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.8.0">Little Cup</td></tr><tr data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.9"><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.9.0">Water Absorb</td><td data-reactid=".0.1.1.4.1.0:1.2.0.0.5.2.1.0.0.9.1">7</td></tr></tbody></table></div></td></tr></tbody></table></div></div></section>`;

		// let pokemon_name = 'pidgeot';
		// let version = 'ss';

		// const request = require('request');

		// request(`https://www.smogon.com/dex/${version}/pokemon/${pokemon_name}`, function (error: any, response: any, body: any) {
		// 	console.error('error:', error); // Print the error if one occurred
		// 	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		// 	console.log('body:', body); // Print the HTML for the Google homepage.
		// 	this.resetFile(dummycopy html nfde from _fullPath);
		// 	this.writeFile(dummy_fullPath, body);
		// });
		
		let pokemon_name = 'pidgeot';
		let version = 'rs';

		const request = require('request');
		const parser = new DOMParser();
		
		request(`https://www.smogon.com/dex/${version}/pokemon`, async (error: any, response: any, body: any) => {
			// console.error('error:', error); // Print the error if one occurred
			// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			const response_document = parser.parseFromString(body, "text/html");
			console.log('body:', response_document); // Print the HTML for the Google homepage.
			// this.resetFile(dummy_fullPath);
			// this.writeFile(dummy_fullPath, body);
			const tag = response_document.getElementsByTagName('script')[1];
			console.log('tag:', tag);
			const F = new Function('let ' + tag.text + '\nreturn dexSettings;');
			
			const obj = F();
			
			console.log(obj.injectRpcs[1][1].pokemon);
		});


		this.registerMarkdownPostProcessor(
			async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				let codeblocks = el.querySelectorAll("pre");

				// make a new parser
				const parser = new DOMParser();


				for (let block of Array.from(codeblocks)) {
					let content = ctx.getSectionInfo(block);

					// Skip empty code blocks
					if (!content) continue;

					// Get code block language
					let lines = content.text
						.split("\n")
						.slice(content.lineStart, content.lineEnd);
					let first_line = lines[0];

					// Check block language. ```pokemon name version```
					if (!first_line.contains("pokemon")) continue;

					el.addClass("pokemon-container");

					request('https://www.smogon.com/dex/xy/pokemon/wooper/', function (error: any, response: any, body: string) {
						// console.error('error:', error); // Print the error if one occurred
						// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

						// convert html string into DOM
						const response_document = parser.parseFromString(body, "text/html");

						console.log(response_document);
					});

					let d: HTMLElement = el;
					d.innerHTML = test;
				}
				
				// document.addEventListener("DOMContentLoaded", function() { 
				// 	let parent = el.querySelector('.pokemon-container');
				// 	console.log(parent);
				// });
				
				let parent = el.querySelector('table[class = PokemonSummary] > tbody > tr');
				// let parent = el.querySelector('.pokemon-container');
				console.log(parent);
				let type_effectives_popup = el.getElementsByClassName('PokemonSummary-typeEffectivesPopup');
				
				if (parent) {
					parent.addEventListener('mouseover', function() 
					{ type_effectives_popup[0].className += ' PokemonSummary-typeEffectivesPopup-isDisplayed' })

					parent.addEventListener('mouseout', function() 
					{ type_effectives_popup[0].className = 'PokemonSummary-typeEffectivesPopup' })
				} 
			},
			100
		);
	}

	onunload() {

	}

	async writeFile(outputDir: string, data: any) {
		try {
			await fsPromises.writeFile(outputDir, data, { flag: 'a+' });

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