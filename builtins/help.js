const Discord = require('discord.js');
const { CommandHandler } = require('../CommandHandler')

module.exports = class Help {
	constructor(){
		this.name = 'help',
		this.alias = ['cmds', 'commands'],
		this.usage = 'help',
		this.info = {
			"description": "Show info about commands.",
			"group": "utility",
			"examples": ["ban","case",""],
			"usage": "[command]",
			"botUse": false,
			"args": [
				{
					"id": "command",
					"prompt": null
				}
			]
		}
	}
	run(bot, message, { command }) {
		let commands = CommandHandler.getCommands();
		if(!command || !commands.includes()) {
			let str = `This is a list of available bot commands.\nFor more information about a command, use \`!help <command>\`\n`;
			for(const i of CommandHandler.getGroups()) {
				let cmds = [];
				commands.filter(x => x.info.group === i).forEach(x => {
					cmds.push(x.name);
				});
				str + `**${i[0].toUpperCase() + i.substr(1).toLowerCase()}**\n\`${cmds.join('\` \`')}\`\n`;
			}
			const embed = new Discord.MessageEmbed()
				.setColor('BLUE')
				.setTitle('Commands')
				.setDescription(str)
				.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);
			return message.channel.send(embed);
		}
		const cmd = CommandHandler.getCommand(command.toLowerCase());
		const embed = new Discord.MessageEmbed()
			.setColor('BLUE')
			.setTitle(`\`${`${command.toLowerCase()} ${cmd.info.usage}`.trim()}\``)
			.addFields([
				{name:'Description',value:cmd.info.description},
				cmd.alias ? {name:'Aliases',value:cmd.alias.join('` `')} : {name:'Examples',value:cmd.examples.join('` `')}
			])
			.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);
		if(cmd.alias) embed.addField('Examples', cmd.examples.join('` `'));
		message.channel.send(embed);
	}
};
