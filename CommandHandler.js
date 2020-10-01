class CommandHandler {
	constructor(data = {}) {
		if(data.get) return;
		if(!data.folder) return new Error("No commands folder specified!");
		if(!data.prefix) return new Error("No prefix specified!");
		if(!data.groups) return new Error("No groups specified!");
		let disabled = data.disable ? data.disable : [];
		let groups = [];
		this.options = {"prefix":data.prefix,"folder":data.folder,"disabled":disabled,"groups":disabled !== [] && !data.groups.includes('utility') ? data.groups.forEach(e => groups.push(e.toLowerCase())).push('utility') : data.groups.forEach(e => groups.push(e.toLowerCase()))};
		this.options.groups = groups;
		this.waiting = new Map();
		this.loadCommands();
	}

	recursiveReadDir(path, items = []) {
		const fs = require('fs');
		for(const file of fs.readdirSync(path)) {
			const stat = fs.statSync(file);
			if(!stat) return;
			if(stat.isDirectory()) {
				items.push(this.recursiveReadDir(path + '/' + file));
			} else if(stat.isFile()) {
				items.push(path + '/' + file);
			}
		}
		return items;
	}

	static getCommands() {
		return this.commands;
	}
	
	static getGroups() {
		return this.options.groups;
	}

	loadCommands() {
		let files = recursiveReadDir(this.options.folder).push(recursiveReadDir('./builtins').filter(x => !disabled.includes(new x().name)));
		let commands = new Map();
		let aliases = new Map();
		console.log(`Found ${files.length} files to load!`);
		for(const i of files) {
			const file = require(i);
			const cmd = new file();

			const name = cmd.name;
			commands.set(name, cmd);

			console.log(`Loading command ${name}`);
			if(cmd.alias) {
				for(const alias of cmd.alias) {
					aliases.set(alias, name);
				}
			}
		}

		console.log('Done loading commands!');
        this.commands = commands;
        this.aliases = aliases;
	}

	static getCommand(str) {
		let pass = false;
		let prefix = '';
		for(const i of this.options.prefix) {
			if(str.startsWith(i)) {
				pass = true;
				prefix = i;
			}
		}

		if(!pass) return null;

		const command = str.substring(prefix.length);
		let cmd = this.commands.get(command.toLowerCase());
		if(!cmd) {
			const alias = this.aliases.get(command.toLowerCase());
			if(!alias) return null;
			cmd = alias;
		}
		return cmd;
	}

	static run(cmd, bot, message, args) {
		for(const arg of cmd.info.args) {
			if(arg.prompt !== null && cmd.info.args.length === 1 && args.length < 1) {
				message.reply(`${arg.prompt}\n\nType \`cancel\` to cancel the command.`);
				this.setWait(message.author, message.guild, true)
				setTimeout(() => {
					if(!this.getWait(message.author, message.guild)) {
						this.setWait(message.author, message.guild, false);
						message.channel.send("Command automatically cancelled.");
					}
				}, 15000);
			} else if(args.length >= 1 && cmd.info.args) {
				message.channel.send("")
			}
			return;
		}
	}

	static setWait(member, guild, bool) {
		if(typeof(bool) !== 'boolean') return;
		bool ? this.waiting.set(`${member.id}-${guild.id}`, bool) : this.waiting.delete(`${member.id}-${guild.id}`);
	}

	static getWait(member, guild) {
		return this.waiting.get(`${member.id}-${guild.id}`);
	}
}

module.exports = { CommandHandler };