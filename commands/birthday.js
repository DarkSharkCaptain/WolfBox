const Command = require("../structures/command");

module.exports = class BirthdayCommand extends Command {

	constructor(bot) {
		super(bot);
		this.help = "View or change {{a tupper}}'s birthday, or see upcoming birthdays";
		this.usage = [
			["[name] [date]",  "\n\tIf name and date are specified, set the named {{tupper}}'s birthday to the date.\n\tIf name only is specified, show the {{tupper}}'s birthday.\n\tIf neither are given, show the next 5 birthdays on the server."],
			["[name] clear/remove/none/delete", "Unset a birthday for the given {{tupper}}."]
		];
		this.desc = "Date must be given in format MM/DD/YY and are stored in UTC.";
		this.groupArgs = true;
	}

	async execute(bot, msg, args) {
		if(!args[0]) {
			return "The 'list upcoming birthdays' function is temporarily disabled due to recent Discord changes. We have a request in processing to obtain rights needed to re-enable it. Please check the support server for updates or try again in a day or two.";
			/*let targets = msg.channel.guild ? await bot.findAllUsers(msg.channel.guild.id) : [msg.author];
			let members = (await bot.db.query("SELECT *, birthday + date_trunc('year', age(birthday + 1)) + interval '1 year' as anniversary FROM Members WHERE birthday IS NOT NULL AND user_id IN (select(unnest($1::text[]))) ORDER BY anniversary LIMIT 5;",[targets.map(u => u.id)])).rows;
			if(!members[0]) return "No {{tupper}}s on this server have birthdays set.";
			return "Here are the next few upcoming {{tupper}} birthdays in this server (UTC):\n" + members.map(t => (bot.checkMemberBirthday(t) ? `${t.name}: Birthday today! \uD83C\uDF70` : `${t.name}: ${t.anniversary.toLocaleDateString("en-US",{timeZone:"UTC"})}`)).join("\n");*/
		}

		//check arguments
		let member = await bot.db.members.get(msg.author.id,args[0]);
		if(!member) return `You don't have {{a tupper}} named '${args[0]}' registered.`;
		if(!args[1]) return member.birthday ? "Current birthday: " + member.birthday.toDateString() + "\nTo remove it, try {{tul!}}birthday " + member.name + " clear" : "No birthday currently set for " + args[0];
		if(["clear","remove","none","delete"].includes(args[1])) {
			await bot.db.members.update(msg.author.id,member.name,"birthday",null);
			return "Birthday cleared.";
		}
		if(!(new Date(args[1]).getTime())) return "I can't understand that date. Please enter in the form MM/DD/YYYY with no spaces.";

		//update member
		let date = new Date(args[1]);
		await bot.db.members.update(msg.author.id,args[0],"birthday",date);
		return `{{Tupper}} '${args[0]}' birthday set to ${date.toDateString()}.`;
	}
};