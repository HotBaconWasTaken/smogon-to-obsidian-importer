import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext } from 'obsidian';
import { fstat, readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { dirname, join } from 'path';
import { Request } from 'request';
import { table } from 'console';

export default class MyPlugin extends Plugin {

	async onload() {

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

		// MyPlugin.JsonPokemonDownload('ss')
		
		const Generations = [
			'GS',
			'RS',
			'DP',
			'BW',
			'XY',
			'SM',
			'SS'
		];

		const type_array = [
			"Bug",
			"Dark",
			"Dragon",
			"Electric",
			"Fairy",
			"Fighting",
			"Fire",
			"Flying",
			"Ghost",
			"Grass",
			"Ground",
			"Ice",
			"Normal",
			"Poison",
			"Psychic",
			"Rock",
			"Steel",
			"Water"
		];

		let Data = require('data.json');
		let Types_resistance = require('types.json');
		
		this.registerMarkdownPostProcessor(
			async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				let codeblocks = el.querySelectorAll("pre");

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

					let first_line_copy = first_line.replace("pokemon", "");

					let Gen;
					let Gen_number;
					for (let i = 0; i < Generations.length; i++) {
						if(first_line_copy.contains(" " + Generations[i])){
							Gen = Generations[i];
							first_line_copy = first_line_copy.replace(Generations[i], "");
							Gen_number = i;
							break;
						}
					}

					if(Gen_number === undefined || !Gen) {
						new Notice("Pokemon Gen not found");
						console.error("Insert a valid pokemon Gen");
						return;
					}

					let pokemon_name = first_line_copy.replace("```", "").trim();

					console.log("Pokemon: ", "'" + pokemon_name + "'", "Gen: ", Gen);

					const pokemon = Data[Gen_number][pokemon_name];

					if(!pokemon) {
						new Notice(`Pokemon: ${pokemon_name} not found`);
						console.error("Invalid Pokemon");
						return;
					}

					console.log("Pokemon", pokemon);

					let PokemonSummary_types = '';
					for(let type of pokemon.types){
						PokemonSummary_types += `<li><a class="Type ${type.toLowerCase()}">${type}</a></li>`;
					}
					
					let Resists = '';
					let Immune_to = '';
					let Very_weak = '';

					for(let types of type_array){
						let val = 1;
						let value = 1;
						for(let type of pokemon.types){
							val = Types_resistance[type][types] as number;
						}
						value *= val;

						if (value === 1){
							// resist
							Resists += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (value < 1){
							// immune
							Immune_to += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (value > 1){
							// very weak
							Very_weak += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						}
					}


					// TODO find the immune, resist, very weak in data.json


					let formats = '';
					for(let format of pokemon.formats){
						formats += `<li><a>${format}</a></li>`;
					}


					let PokemonAlt: HTMLElement = el;
					PokemonAlt.innerHTML  = `
<div class="PokemonAltInfo">
<div class="PokemonAltInfo-sprite">
	<div style="background-image:url(https://www.smogon.com/dex/media/sprites/${Gen.toLowerCase() === 'gs' ? 'c' : Gen.toLowerCase()}/${pokemon_name.toLowerCase()}.gif);"></div>
</div>
<div class="PokemonAltInfo-data">
	<table class="PokemonSummary">
		<tbody>
			<tr>
				<th><span class="PokemonSummary-type">Type</span></th>
				<td>
					<div class="PokemonSummary-types">
						<ul class="TypeList">
							${PokemonSummary_types}
						</ul>
					</div>
					<div class="PokemonSummary-typeEffectivesPopup ">
						<dl class="TypeEffectives">
							<dt>Immune to:</dt>
							<dd>
								<ul class="TypeList">
									${Immune_to}
								</ul>
							</dd>
							<dt>Resists:</dt>
							<dd>
								<ul class="TypeList">
									${Resists}
								</ul>
							</dd>
							<dt>Very weak to:</dt>
							<dd>
								<ul class="TypeList">
									${Very_weak}
								</ul>
							</dd>
						</dl>
					</div>
				</td>
			</tr>
			<tr>
				<th>Abilities</th>
				<td>
					<ul class="AbilityList">
						${''}
					</ul>
				</td>
			</tr>
			<tr>
				<th>Tier</th>
				<td>
					<ul class="FormatList">
						${formats}
					</ul>
				</td>
			</tr>
		</tbody>
	</table>
</div>
<div class="PokemonAltInfo-stats">
	<table class="PokemonStats">
		<tbody>
			<tr>
				<th>HP:</th>
				<td>${pokemon.hp}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.hp as number/2}%;background-color:#ff1800;"></div>
				</td>
			</tr>
			<tr>
				<th>Attack:</th>
				<td>${pokemon.atk}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.atk as number/2}%;background-color:#ff0000;"></div>
				</td>
			</tr>
			<tr>
				<th>Defense:</th>
				<td>${pokemon.def}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.def as number/2}%;background-color:#ff0000;"></div>
				</td>
			</tr>
			<tr>
				<th>Sp. Atk:</th>
				<td>${pokemon.spa}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.spa as number/2}%;background-color:#ff0000;"></div>
				</td>
			</tr>
			<tr>
				<th>Sp. Def:</th>
				<td>${pokemon.spd}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.spd as number/2}%;background-color:#ff0000;"></div>
				</td>
			</tr>
			<tr class="PokemonStats-speed">
				<th><span class="PokemonStats-speed-title">Speed</span><span>:</span></th>
				<td>${pokemon.spe}</td>
				<td class="PokemonStats-speed-cell">
					<div class="PokemonStats-bar" style="width:7.5%;background-color:#ff0000;"></div>
					<div class="PokemonStats-speed-popup">
						<table>
							<tbody>
								<tr>
									<td>Min (-ve nature, 0 IVs)</td>
									<td>5</td>
								</tr>
								<tr>
									<td>Default</td>
									<td>8</td>
								</tr>
								<tr>
									<td>Max Neutral</td>
									<td>11</td>
								</tr>
								<tr>
									<td>Max Positive</td>
									<td>12</td>
								</tr>
								<tr>
									<td>Max Neutral (+1)</td>
									<td>16</td>
								</tr>
								<tr>
									<td>Max Positive (+1)</td>
									<td>18</td>
								</tr>
								<tr>
									<td>Max Neutral (+2)</td>
									<td>22</td>
								</tr>
								<tr>
									<td>Max Positive (+2)</td>
									<td>24</td>
								</tr>
								<tr>
									<td colspan="2" class="PokemonStats-speed-popup-format">Little Cup</td>
								</tr>
								<tr>
									<td>Water Absorb</td>
									<td>7</td>
								</tr>
							</tbody>
						</table>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</div>
</div>`;

					// el.appendChild(PokemonAlt);
					// el.addClass("pokemon-container");
					
					// let d: HTMLElement = el;
					// d.innerHTML = test;
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

	// async writeFile(outputDir: string, data: any) {
	// 	try {
	// 		await fsPromises.writeFile(outputDir, data, { flag: 'a+' });

	// 		return;
	// 	} catch (err) { return console.log(err) }
	// }

	// async resetFile(outputDir: string) {
	// 	try {
	// 		await fsPromises.truncate(outputDir, 0);

	// 		return;
	// 	} catch (err) { return console.log(err) }
	// }

	static JsonPokemonDownload(version: string): void {
		const request = require('request');
		
		request(`https://www.smogon.com/dex/${version}/pokemon`, (error: any, response: any, body: any) => {
			if(error) return;
			// console.error('error:', error); // Print the error if one occurred
			// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			const response_document = new DOMParser().parseFromString(body, "text/html");

			// this.resetFile(dummy_fullPath);
			// this.writeFile(dummy_fullPath, body);

			const F = new Function('let ' + (response_document.getElementsByTagName('script')[1]).text + '\nreturn dexSettings;');

			const pokemon_list = F().injectRpcs[1][1].pokemon;
			let pokemon_list_fixed: any = {};

			for(let i = 0; i < pokemon_list.length; i++) {
				pokemon_list_fixed[pokemon_list[i].name] = {...pokemon_list[i]}
				delete pokemon_list_fixed[pokemon_list[i].name].name;
			}

			console.log('pokemon list:', pokemon_list_fixed);
			console.log('pokemon list json:', JSON.stringify(pokemon_list_fixed));
		});

	}
	
	static stringToHTML (str: string): HTMLElement {
		var parser = new DOMParser();
		var doc = parser.parseFromString(str, 'text/html');
		return doc.body;
	};
	static Table(str: string): any {

		let type_array = [
			"Bug",
			"Dark",
			"Dragon",
			"Electric",
			"Fairy",
			"Fighting",
			"Fire",
			"Flying",
			"Ghost",
			"Grass",
			"Ground",
			"Ice",
			"Normal",
			"Poison",
			"Psychic",
			"Rock",
			"Steel",
			"Water"
		]

		const lines = this.stringToHTML(str);
		let Obj: any = {};

		console.log(lines);

		let divs = lines.getElementsByTagName('div');

		for(let i = 0, k = 0, j = 0; i < divs.length; i++, k++) {
			if(!Obj[type_array[k]])
				Obj[type_array[k]] = {};

			let val;
			switch(divs[i].textContent) {
				case 'x1':
					val = 1;
					break;
				case 'x2':
					val = 2;
					break;
				case 'x0':
					val = 0;
					break;
				case 'x½':
					val = .5;
			}

			Obj[type_array[k]][type_array[j]] = val;

			if(k === type_array.length -1){
				k = -1;
				j++;
			}
		}

		console.log(Obj);

		console.log(JSON.stringify(Obj));

	}
}