import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext } from 'obsidian';
import { fstat, readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { dirname, join } from 'path';
import { Request } from 'request';
import { table } from 'console';

interface PluginSettings {
	Font_Scaling: boolean;
	Font_size: number;
}

const DEFAULT_SETTINGS: PluginSettings = {
	Font_Scaling: false,
	Font_size: 10
};

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	static Poke_data = require('pokemon.json');
	static Type_list = require('types.json');
	obj: string = '';

	async onload() {
		await this.loadSettings();
		const Generations = [
			'RB',
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

		// MyPlugin.JsonPokemonDownload('xy');
		// MyPlugin.GetAbility('https://pokeapi.co/api/v2/ability')

		/* Main Function */
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

					// Check block language. ```pokemon name version```
					if (!lines[0].contains("pokemon")) continue;

					let Gen;
					let Gen_number;
					for (let i = 0; i < Generations.length; i++) {
						if (lines[1].contains(" " + Generations[i])) {
							Gen = Generations[i];
							lines[1] = lines[1].replace(Generations[i], "");
							Gen_number = i;
							break;
						}
					}

					if (Gen_number === undefined || !Gen) {
						new Notice("Pokemon Gen not found");
						console.error("Insert a valid pokemon Gen");
						return;
					}

					let pokemon_name = lines[1].replace("```", "").trim();

					console.log("Pokemon: ", "'" + pokemon_name + "'", "Gen: ", Gen);

					const pokemon = MyPlugin.Poke_data[Gen_number][pokemon_name];

					if (!pokemon) {
						new Notice(`Pokemon: ${pokemon_name} not found`);
						console.error("Invalid Pokemon");
						return;
					}

					console.log("Pokemon", pokemon);

					let PokemonSummary_types = '';
					for (let type of pokemon.types) {
						PokemonSummary_types += `<li><a class="Type ${type.toLowerCase()}">${type}</a></li>`;
					}

					let Immune_to = '';
					let Strong_resists = '';
					let Resists = '';
					let Weak_to = '';
					let Very_weak_to = '';

					for (let types of type_array) {
						let val = 1;
						for (let type of pokemon.types) {
							val *= MyPlugin.Type_list[type][types];
						}

						if (val === 0) {
							Immune_to += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (val === .25) {
							Strong_resists += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (val === .5) {
							Resists += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (val === 2) {
							Weak_to += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						} else if (val === 4) {
							Very_weak_to += `<li><a class="Type ${types.toLowerCase()}">${types}</a></li>`;
						}
					}

					const type_summary =
						(Immune_to ? `<dt>Immune to:</dt><dd><ul class="TypeList">${Immune_to}</ul></dd>` : '') +
						(Strong_resists ? `<dt>Strongly Resists:</dt><dd><ul class="TypeList">${Strong_resists}</ul></dd>` : '') +
						(Resists ? `<dt>Resists:</dt><dd><ul class="TypeList">${Resists}</ul></dd>` : '') +
						(Weak_to ? `<dt>Weak to:</dt><dd><ul class="TypeList">${Weak_to}</ul></dd>` : '') +
						(Very_weak_to ? `<dt>Very Weak to:</dt><dd><ul class="TypeList">${Very_weak_to}</ul></dd>` : '');

					let formats = '';
					for (let format of pokemon.formats) {
						formats += `<li><a>${format}</a></li>`;
					}

					let Ability_list = '';
					for (let i = 0; i < pokemon.abilities.length; i++) {
						if (pokemon.abilities[i] === true || pokemon.abilities[i] === false) continue;
						const is_hidden = pokemon.abilities[i + 1] === true ? '<is-hidden>Hidden</is-hidden>' : '';

						Ability_list +=
							`<li><a class="AbilityLink"><span>${pokemon.abilities[i]}</span> 
						<div class="AbilityPreview">
						...
						</div>
						</a>${is_hidden}</li>`;
					}

					let PokemonAlt: HTMLElement = el;
					PokemonAlt.addClass('pokemon-container');
					PokemonAlt.innerHTML = `
<div class="PokemonAltInfo-sprite">
	<div style="background-image:url(https://www.smogon.com/dex/media/sprites/${Gen === 'GS' ? 'c' : Gen === 'SM' || Gen === 'SS' ? 'xy' : Gen.toLowerCase()}/${pokemon_name.toLowerCase()}.${Gen_number < 4 && Gen != 'GS' ? 'png' : 'gif'});"></div>
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
						${type_summary}
					</dl>
				</div>
			</td>
		</tr>
		<tr>
			<th>Abilities</th>
			<td>
				<ul class="AbilityList">
					${Ability_list}
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
					<div class="PokemonStats-bar" style="width:${pokemon.hp * 100 / 260}%;background:hsl(${Math.floor((pokemon.hp/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
			<tr>
				<th>Attack:</th>
				<td>${pokemon.atk}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.atk * 100 / 260}%;background:hsl(${Math.floor((pokemon.atk/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
			<tr>
				<th>Defense:</th>
				<td>${pokemon.def}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.def * 100 / 260}%;background:hsl(${Math.floor((pokemon.def/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
			<tr>
				<th>Sp. Atk:</th>
				<td>${pokemon.spa}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.spa * 100 / 260}%;background:hsl(${Math.floor((pokemon.spa/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
			<tr>
				<th>Sp. Def:</th>
				<td>${pokemon.spd}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.spd * 100 / 260}%;background:hsl(${Math.floor((pokemon.spd/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
			<tr>
				<th>Speed:</th>
				<td>${pokemon.spe}</td>
				<td>
					<div class="PokemonStats-bar" style="width:${pokemon.spe * 100 / 260}%;background:hsl(${Math.floor((pokemon.spe/50*100 +5+31) * 180 / 714)},85%,45%);"></div>
				</td>
			</tr>
		</tbody>
	</table>
</div>`;
					if (Ability_list)
						MyPlugin.loadAbStats(el.querySelectorAll('.AbilityPreview'), el, pokemon, 0, 0);
				}

				let parent = el.querySelector('table[class = PokemonSummary] > tbody > tr');
				let type_effectives_popup = el.getElementsByClassName('PokemonSummary-typeEffectivesPopup');

				if (parent) {
					parent.addEventListener('mouseover', () => { type_effectives_popup[0].className += ' PokemonSummary-typeEffectivesPopup-isDisplayed' })
					parent.addEventListener('mouseout', () => { type_effectives_popup[0].className = 'PokemonSummary-typeEffectivesPopup' })
				}
			},
			100
		);

		this.addSettingTab(new SettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		this.Font_Scaling_change(this.settings.Font_Scaling ? undefined : this.settings.Font_size);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {

	}

	static async loadAbStats(AbilityPreview: any, el: HTMLElement, pokemon: any, i: number, j: number) {
		if (j === AbilityPreview.length) return;
		if (pokemon.abilities[i] === true || pokemon.abilities[i] === false) {
			this.loadAbStats(AbilityPreview, el, pokemon, ++i, j);
			return;
		}
		fetch(`https://pokeapi.co/api/v2/ability/${pokemon.abilities[i]?.toString().toLowerCase().replace(/\s/g, '-')}/`)
			.then((response) => response.json())
			.then((data) => {
				AbilityPreview[j].textContent = data.effect_entries[1].effect;
				this.loadAbStats(AbilityPreview, el, pokemon, ++i, ++j);
			}).catch(error => console.error(error));
	}

	static JsonPokemonDownload(version: string): void {
		const request = require('request');

		request(`https://www.smogon.com/dex/${version}/pokemon`, (error: any, response: any, body: any) => {
			if (error) return;
			// console.error('error:', error); // Print the error if one occurred
			// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			const response_document = new DOMParser().parseFromString(body, "text/html");

			// this.resetFile(dummy_fullPath);
			// this.writeFile(dummy_fullPath, body);

			const F = new Function('let ' + (response_document.getElementsByTagName('script')[1]).text + '\nreturn dexSettings;');
			console.log(F().injectRpcs[1][1].abilities);

			const pokemon_list = F().injectRpcs[1][1].pokemon;
			let pokemon_list_fixed: any = {};

			for (let i = 0; i < pokemon_list.length; i++) {
				pokemon_list_fixed[pokemon_list[i].name] = { ...pokemon_list[i] }
				delete pokemon_list_fixed[pokemon_list[i].name].name;
			}

			console.log('pokemon list:', pokemon_list_fixed);
			console.log('pokemon list json:', JSON.stringify(pokemon_list_fixed));
		});

	}

	static stringToHTML(str: string): HTMLElement {
		var parser = new DOMParser();
		var doc = parser.parseFromString(str, 'text/html');
		return doc.body;
	}

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

		for (let i = 0, k = 0, j = 0; i < divs.length; i++, k++) {
			if (!Obj[type_array[k]])
				Obj[type_array[k]] = {};

			let val;
			switch (divs[i].textContent) {
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

			if (k === type_array.length - 1) {
				k = -1;
				j++;
			}
		}

		console.log(Obj);

		console.log(JSON.stringify(Obj));

	}

	static GetAbility(str: string) {
		const request = require('request');

		request(str, (error: any, response: any, body: any) => {
			if (error) return;

			const json = JSON.parse(body);
			console.log(json.next);

			if (json.next) {
				this.GetAbility(json.next);
			}

			for (let ab of json.results) {
				request(ab.url, (error: any, response: any, body: any) => {
					// console.table(JSON.parse(body));
					let pokemons = JSON.parse(body).pokemon;

					for (let j = 0; j < MyPlugin.Poke_data.length; j++) {
						for (let pokemon of pokemons) {
							let name = pokemon.pokemon.name.charAt(0).toUpperCase() + pokemon.pokemon.name.slice(1);
							if (name.contains('-')) {
								let arr = [...name];
								for (let i = 0; i < arr.length; i++) {
									if (arr[i] === '-') {
										arr[i + 1] = arr[i + 1].toUpperCase();
										break;
									}
								}
								name = arr.join('');
								console.log(name, arr);
							}
							if (MyPlugin.Poke_data[j][name]) {
								for (let i = 0; i < MyPlugin.Poke_data[j][name].abilities.length; i++) {
									if (MyPlugin.Poke_data[j][name].abilities[i].toString().toLowerCase().replace(/\s/g, '-') === ab.name) {
										MyPlugin.Poke_data[j][name].abilities.splice(i + 1, 0, pokemon.is_hidden);
									}
								}
							}
						}
					}

				});
			}

			if (!json.next)
				console.log(JSON.stringify(MyPlugin.Poke_data));
		});
	}

	Font_Scaling_change(value: number | undefined) {
		document.documentElement.style.setProperty('--size', value ? value + 'px' : 'calc(.6vw + .6vh + .1vmin)');
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	if_Create_Slider = true;
	static if_Create_Slider = true;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	Create_Slider(container: HTMLElement): void{
		if(!this.plugin.settings.Font_Scaling){
			new Setting(container).addSlider(slider => {
				slider
					.setLimits(1, 20, 1)
					.setValue(this.plugin.settings.Font_size)
					.setDynamicTooltip()
					.onChange(async (value: number) => {
						this.plugin.settings.Font_size = value;
						this.plugin.Font_Scaling_change(value);
						await this.plugin.saveSettings();
					});
			})
			.setName("Font Size Slider")
			.setDesc("With this slider you can change the size of the container.");
		}
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Settings for Smogon to Obsidian" });

		new Setting(containerEl)
			.setName("Font Scaling")
			.setDesc(createFragment((frag) => {
				frag.createDiv().innerHTML = "This setting makes the pokemon container size automatically scale based on the window width." 
				frag.createDiv().innerHTML = "Disabling this setting lets you manually set the pokemon container size."
			}))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.Font_Scaling)
					.onChange(async value => {
						this.plugin.settings.Font_Scaling = value;
						this.plugin.Font_Scaling_change(value ? undefined : this.plugin.settings.Font_size);
						this.if_Create_Slider = false;
						this.display();
						this.Create_Slider(containerEl);
						await this.plugin.saveSettings();
					});
			});

		if(this.if_Create_Slider) 
			this.Create_Slider(containerEl);
		else this.if_Create_Slider = true;
	}
}