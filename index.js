const Discord = require("discord.js");
const tokenfile = require("./tokenfile.json");
const prefix = require("./botconfig.json");
const bot = new Discord.Client({disableEveryone: true});
var weather = require('weather-js');
const superagent = require('superagent');
const randomPuppy = require('random-puppy');

const disbut = require('discord-buttons');

const { Player } = require("discord-player");

const player = new Player(bot);
bot.player = player;

bot.player.on("trackStart", (message, track) => message.channel.send(`Most megy: ${track.title}`))
bot.player.on("trackAdd", (message, track, queue) => message.channel.send(`${message.content.split(" ").slice(1).join(" ")} hozzá lett adva a várólistához!`))

const fs = require("fs");
const ms = require("ms");
const money = require("./money.json");
const { error } = require("console");
const { attachCookies } = require("superagent");
const { Client } = require("discord.js-commando");

bot.on('guildMemberAdd', member => {
    member.guild.channels.get('807938126286159912').send("Welcome"); 
});

bot.on("guildMemberAdd", (member) => {
    const rulesChannel = "807938126286159912";
    const channelID = "807938126286159912";

    if(!channelID) return;
    if(!rulesChannel) return;
 
    const message = `Isten hozott <@${member.id}>! Olvasd el a szabályzatot: ${member.guild.channels.cache.get(rulesChannel).toString()}`;

    const channel = member.guild.channels.cache.get(channelID);
    channel.send(message);
});
bot.on("guildMemberRemove", (member) => {
    const channelID = member.guild.systemChannelID;

    if(!channelID) return;
 
    const message = `Kilépett: <@${member.id}>! `;

    const channel = member.guild.channels.cache.get(channelID);
    channel.send(message);
});

//////////////////////////////////////////////////////////
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

bot.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(bot)
});

bot.on("message", async message => {
    let prefix = '!'

    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message)

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd.length === 0) return;

    let command = bot.commands.get(cmd);
    if(!command) command = bot.commands.get(bot.aliases.get(cmd));

    if(command)
    command.run(bot, message, args);
});

//////////////////////////////////////////////////////////////////////////////////////


let botname = "Refrone"

bot.on("ready", async() => {
    console.log(`${bot.user.username} elindult!`)

    let státuszok = [
        `Prefix: !`,
        "Készítő: Valaki#9932"
    ]

    setInterval(function() {
        let status = státuszok[Math.floor(Math.random()* státuszok.length)]

        bot.user.setActivity(status, {type: "WATCHING"})
    }, 3000)
})

bot.on("message", async message => {
    let MessageArray = message.content.split(" ");
    let cmd = MessageArray[0];
    let args = MessageArray.slice(1);
    let prefix = '!'

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;


////////////////|| ECONOMY ||/////////////////////

    if(!money[message.author.id]) {
        money[message.author.id] = {
            money: 100,
            user_id: message.author.id

        };
    }
    fs.writeFile("./money.json", JSON.stringify(money), (err) => {
        if(err) console.log(err);
    });
    let selfMoney = money[message.author.id].money;


    if(cmd === `${prefix}freeMoney`){
        message.channel.send("600FT ot kaptál!")

        money[message.author.id] = {
            money: selfMoney + 600,
            user_id: message.author.id
        }
    }

    if(message.guild){
        let drop_money = Math.floor(Math.random()*50 + 1)
        let random_money = Math.floor(Math.random()*900 + 1)

        if(drop_money === 2){
            let üzenetek = ["Kiraboltál egy csövest.", "Elloptál egy biciklit!", "Kiraboltál egy boltot!"]
            let random_üzenet_szam = Math.floor(Math.random()*üzenetek.length)

            let DropMoneyEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .addField("Szerencséd volt!", `${üzenetek[random_üzenet_szam]} Ezért kaptál: ${random_money}FT-ot!`)
            .setColor("RANDOM")
            .setThumbnail(message.author.displayAvatarURL())

            message.channel.send(DropMoneyEmbed);

            money[message.author.id] = {
                money: selfMoney + 600,
                user_id: message.author.id
            }

        }
    }

    if(cmd === `${prefix}shop`){
        let ShopEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .setDescription(`${prefix}vasarol-vip (ÁR: 500FT)`)
            .setColor("RANDOM")
            .setThumbnail(bot.user.displayAvatarURL())

            message.channel.send(ShopEmbed);
    }



    if(cmd === `${prefix}vasarol-vip`){
        let viprang_id = "812622030855077928"

        let price = "500";
        if(message.member.roles.cache.has(viprang_id)) return message.reply("*Ezt a rangot már megvetted!*");
        if(selfMoney < price) return message.reply(`Erre a rangra nincs pénzed! Egyenleged: ${selfMoney}FT.`)

        money[message.author.id] = {
            money: selfMoney - parseInt(price),
            user_id: message.author.id
        }

        message.guild.member(message.author.id).roles.add(viprang_id);

        message.reply("**Köszönöm a vásárlást! További szép napot!**")

    }

    if(cmd === `${prefix}slot`){
        let min_money = 50;
        if(selfMoney < min_money) return message.reply(`Túl kevés pénzed van! (Minimum ${min_money}FT-nak kell lennie a számládon!) Egyenleged: ${selfMoney}.`)

        let tét = Math.round(args[0] *100)/100
        if(isNaN(tét)) return message.reply("Kérlek adj meg egy összeget! (Pl: 5)")
        if(tét > selfMoney) return message.reply("az egyenlegeednél több pénzt nem rakhatsz fel a slotra!")

        let slots = ["🍌", "🍎", "🍍", "🥒", "🍇"]
        let result1 = Math.floor(Math.random() * slots.length)
        let result2 = Math.floor(Math.random() * slots.length)
        let result3 = Math.floor(Math.random() * slots.length)

        if(slots[result1] === slots[result2] && slots[result3]){
            let wEmbed = new Discord.MessageEmbed()
            .setTitle('🎉 Szerencse játék | slot machine 🎉')
            .addField(message.author.username, `Nyertél! Ennyit kaptál: ${tét*1.6}ft.`)
            .addField("Eredmény:", slots[result1] + slots[result2] + slots[result3])
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(botname)
            message.channel.send(wEmbed)
            
            money[message.author.id] = {
                money: selfMoney + tét*1.6,
                user_id: message.author.id
            }
        } else {
            let wEmbed = new Discord.MessageEmbed()
            .setTitle('🎉 Szerencse játék | slot machine 🎉')
            .addField(message.author.username, `Vesztettél! Ennyit buktál: ${tét}ft.`)
            .addField("Eredmény:", slots[result1] + slots[result2] + slots[result3])
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(botname)
            message.channel.send(wEmbed)
            
            money[message.author.id] = {
                money: selfMoney - tét,
                user_id: message.author.id
            }
        }
    }


    if(cmd === `${prefix}lb`){
        let toplist = Object.entries(money)
        .map(v => `${v[1].money}FT <@${v[1].user_id}>`)
        .sort((a, b) => b.split("FT")[0] - a.split("FT")[0])
        .slice(0, 10)

        let LbEmbed = new Discord.MessageEmbed()
        .setTitle("Leaderboard")
        .setColor("RANDOM")
        .addField("Pénz top lista | TOP10", toplist, true)
        .setTimestamp(message.createdAt)
        .setFooter(botname)

        message.channel.send(LbEmbed)
    }

    if(cmd === `${prefix}pay`){
        let pay_money = Math.round(args[0]*100)/100
        if(isNaN(pay_money)) return message.reply(`A parancs helyes használata: ${prefix}pay <összeg> <@név>`)
        if(pay_money > selfMoney) return message.reply("az egyenlegednél több pénzt nem adhatsz meg!")

        let pay_user = message.mentions.members.first();

        if(args[1] && pay_user){
            if(!money[pay_user.id]) {
                money[pay_user.id] = {
                    money: 100,
                    user_id: pay_user.id
                }
            }

            money[pay_user.id] = {
                money: money[pay_user.id].money + pay_money,
                user_id: pay_user.id
            }

            money[message.author.id] = {
                money: selfMoney - pay_money,
                user_id: message.author.id
        }

        message.channel.send(`Sikeresen átutaltál <@${pay_user.id}> számlájára ${pay_money}FT-ot!`)

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });
    } else {
        message.reply(`A parancs helyes használata: ${prefix}pay <összeg> <@név>`)
    }
}

if(cmd === `${prefix}work`){
    let cd_role_id = "941767914808311818";
    let cooldown_time = "10"; //mp

    if(message.member.roles.cache.has(cd_role_id)) return message.reply(`Ezt a parancsot ${cooldown_time} percenként használhatod!`)

    message.member.roles.add(cd_role_id)

    let üzenetek = ["Jó munkát végeztél!", "A főnököd adott egy kis borravalót!"]
    let random_üzenet_szam = Math.floor(Math.random()*üzenetek.length)

    let random_money = Math.floor(Math.random()*1900 +1)

    let workEmbed = new Discord.MessageEmbed()
    .setTitle("Munka!")
    .addField(`${üzenetek[random_üzenet_szam]}`, `A számládhoz került: ${random_money}FT!`)
    .setColor("RANDOM")
    .setTimestamp(message.createdAt)
    .setFooter(botname)
    message.channel.send(workEmbed)

    money[message.author.id] = {
        money: selfMoney + random_money,
        user_id: message.author.id
}

setTimeout(() => {
    message.member.roles.remove(cd_role_id)
}, 1000 * cooldown_time)
}

if(cmd === prefix + "money"){
    message.reply("Pénzed:" + selfMoney)
}

if(cmd === `${prefix}embedsay`){
    if(message.member.hasPermission("KICK_MEMBERS")){
        if(args[0]){
            let say_embed = new Discord.MessageEmbed()
            .setDescription(args.join(" "))
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(bot.user.username)

            message.channel.send(say_embed);
        } else {
            message.reply(`Használat: ${prefix}embedsay <üzenet>`)
        }
    } else message.reply("Ehhez nincs jogod! (KICK_MEMBERS jogot igényel!)")
}

if(cmd === `${prefix}report`){
    if(args[0] && message.mentions.members.first() && args[1]){

        message.channel.send("A reportodat sikeresen elküldtük!")

        let report_channel = "843131075949363230";

        let report_embed = new Discord.MessageEmbed()
            .setAuthor(message.mentions.members.first().user.tag + `| REPORTED`)
            .setDescription("Report indoka:" + args.join(" ").slice(args[0].length))
            .addField("Reportolta:", message.author.tag)
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(bot.user.username)

            bot.channels.cache.get(report_channel).send(report_embed);

    } else {
        let he_embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag + `| Használat`)
            .setDescription(`${prefix}report @<név> <indok>`)
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(bot.user.username)

            message.channel.send(he_embed);
    }
}


if(cmd === `${prefix}szavazas`){
    if(args[0]){
        let he_embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag + `| Szavazást indított!`)
            .setDescription(args.join(" "))
            .setColor("RANDOM")
            .setTimestamp(message.createdAt)
            .setFooter(bot.user.username)

            message.channel.send(he_embed).then(async msg => {
                await msg.react("✅")
                await msg.react("❌")
            })
    } else {
        message.reply("Kérlek add meg a szavazást!")
    }
}

if(cmd === `${prefix}createrole`){
    if(message.guild.member(bot.user).hasPermission("ADMINISTRATOR")){
        if(message.member.hasPermission("MANAGE_ROLES")){
            if(args[0]){
                message.guild.roles.create({
                    data: {
                        "name": args[0],
                    }
                }).then(message.reply(`${message.author.tag} létrehozta: ${args[0]} nevű rangot!`))

            } else message.reply(`Használat: ${prefix}createrole <rang neve>`)

        } else message.reply("Ehhez a parancshoz nincs jogod! A következő jog kell hozzá: manage_roles")
    } else message.reply("A botnak nincsen administrator joga! Kérlek adj neki egy admint :D")
}

if(cmd === `${prefix}clear`){
    if(message.member.hasPermission("KICK_MEMBERS")){
        if(message.guild.member(bot.user).hasPermission("ADMINISTRATOR")){

            if(args[0] && isNaN(args[0]) && args[0] <= 100 || 0 < args[0] && args[0] < 101){

                message.channel.send(`Törölve lett: ${Math.round(args[0])} üzenet!`)
                message.channel.bulkDelete(Math.round(args[0]))

            } else {
                message.reply(`Használat: ${prefix}clear <1-100>`)
            }

        } else message.reply("A botnak adminnak kell lennie a szerveren, hogy működjön ez a parancs!")

    } else message.reply("Ehhez a parancshoz nincs jogod!")
}

    ///////////////////|| ECONOMY ||//////////////////////


    /////////////////////////////////
    //// LOGIKAI OPERÁTOROK TIPP ////
    //////////////////////////////////////////////////////////
    //                                                      //
    //   || vagy , PL: if(X=1 || X=3)                       //
    //                                                      //
    //   && és , PL: if(X=5 && Y=3)                         //
    //                                                      //
    //   = sima egyenlő jel , PL: if(5=5)                   //
    //   ==  egyenlő jel , PL: if(X==5)                     //
    //   >= nagyobb vagy egyenő , PL: if(X >= 3)            //
    //   <= kisebb vagy egyenlő , PL: if(X <= 3)            //
    //   ! tagadás , PL if(X != 2)                          //
    //                                                      //
    //////////////////////////////////////////////////////////

   let ticket_category_id = "952078434299944981"
   let ticket_role_id = "943226115319824436"
   let support_role_id = "942430951500296232"

if(cmd === `${prefix}ticket`){

    let random_num = Math.floor(Math.random() * 9999)

    if(!message.member.roles.cache.has(ticket_role_id)){
        message.guild.channels.create(`ticket${random_num}`, {
            type: "text",
            parent: ticket_category_id,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: message.author.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "ADD_REACTIONS"]
                },
                {
                    id: support_role_id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "ADD_REACTIONS"]
                }
            ]
        }).then(async (channels) => {
            channels.send(`Szia <@${message.author.id}> !!! A supportok hamarosan felveszik veled a kapcsolatot! Várj türelmesen...`)
        })

        message.member.roles.add(ticket_role_id);
    } else {
        message.reply("Neked már van egy ticketed!")
    }
}

if(cmd === `${prefix}close`){
    if(message.member.roles.cache.has(support_role_id) || message.member.hasPermission("ADMINISTRATOR" || "BAN_MEMBERS")){
        let ping_member = message.mentions.members.first()
        let ping_channel = message.mentions.channels.first()



        if(args[0] && args[1] && ping_member && ping_channel && ping_member.roles.cache.has(ticket_role_id)) { 

            ping_member.roles.remove(ticket_role_id)
            ping_channel.delete()

        } else {
            message.reply(`Kérlek említs meg egy olyan embert akin van ticket rang! Helyes használat: ${prefix}close <@ember> <@csatorna>`)
        }
    } else {
        message.reply("Nem vagy moderátor!")
    }
}



if(cmd === `${prefix}avatar`){
    let ping = message.mentions.members.first() || messsage.author

    let teszt_1 = new Discord.MessageEmbed()
    .setAuthor(ping.user.tag)
    .setImage(ping.user.displayAvatarURL({dynamic: true}))

    message.channel.send(teszt_1)
}





const adatbazis = require("./adat_bazis.json")

if(cmd === `${prefix}ido`){


    if(args[0] === "add"){

        if(args[1] && !/[^0-9]/.test(args[1]) && !/[^0-9]/.test(args[2])){

            if(parseInt(args[2]) > 60){
                return message.reply("A perc nagyobb mint 60! 😎")
            }



            if(!adatbazis[message.author.id]) {
                adatbazis[message.author.id] = {
                    user_id: message.author.id,
                    ido_ora: 0,
                    ido_perc: 0
                }
            }

            let selfido_ora = adatbazis[message.author.id].ido_ora;
            let selfido_perc = adatbazis[message.author.id].ido_perc;

            let atvalto = parseInt(selfido_perc) + parseInt(args[2])

            var ora = 0;
            var maradek = 0;

            if(atvalto >= 60){
                var ora = 1
                var maradek = atvalto - 60
            } else {
                var maradek = selfido_perc
            }
        
            adatbazis[message.author.id] = {
                user_id: message.author.id,
                ido_ora: parseInt(args[1]) + ora + parseInt(selfido_ora),
                ido_perc: maradek
            }
        
            fs.writeFile("./adat_bazis.json", JSON.stringify(adatbazis), (err) => {
                if(err) console.log(err);
            });
        
            message.reply("Sikeres mentés!")
    
        } else {
            let he_embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag + `| Használat`)
                .setDescription(`${prefix}ido <add / set / remove> <óra> <perc>`)
                .addField("A perc nem lehet nagyobb, mint 60!")
                .addField("Példa:", "!idő set 10 50")
                .setColor("RANDOM")
                .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
                .setTimestamp(message.createdAt)
                .setFooter(bot.user.username)
    
                message.channel.send(he_embed);
        }


    } else if(args[0] === "set"){

        if(args[1] && !/[^0-9]/.test(args[1]) && !/[^0-9]/.test(args[2])){

        if(!adatbazis[message.author.id]) {
            adatbazis[message.author.id] = {
                user_id: message.author.id,
                ido: 0,
                ido_perc: 0
            }
        }
    
        adatbazis[message.author.id] = {
            user_id: message.author.id,
            ido_ora: parseInt(args[1]),
            ido_perc: parseInt(args[2])
        }
    
        fs.writeFile("./adat_bazis.json", JSON.stringify(adatbazis), (err) => {
            if(err) console.log(err);
        });
    
        message.reply("Sikeres mentés!")

    } else {
        let he_embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag + `| Használat`)
            .setDescription(`${prefix}ido <add / set / remove> <óra> <perc>`)
            .addField("A perc nem lehet nagyobb, mint 60!")
            .addField("Példa:", "!idő set 10 50")
            .setColor("RANDOM")
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setTimestamp(message.createdAt)
            .setFooter(bot.user.username)

            message.channel.send(he_embed);
    }

    }
}












































    const  badwords  = require("./badwords.json")

    if(!badwords["szamlalo"]) {
        badwords["szamlalo"] = {
            szam: 0

        };
    }
    fs.writeFile("./badwords.json", JSON.stringify(badwords), (err) => {
        if(err) console.log(err);
    });

    if(cmd === `${prefix}add`){
        
        if(args[0]) {
            fs.writeFile("./badwords.json", JSON.stringify(badwords), (err) => {
                if(err) console.log(err);
            });
    
            if(!badwords["szamlalo"]) {
                badwords["szamlalo"] = {
                    szam: 0
        
                };
            }
    
            badwords["szamlalo"] = {
            szam: badwords["szamlalo"].szam + 1
            }
            fs.writeFile("./badwords.json", JSON.stringify(badwords), (err) => {
                if(err) console.log(err);
            });


            badwords[badwords["szamlalo"].szam] = {
                szo: args[0]
            }
   
            fs.writeFile("./badwords.json", JSON.stringify(badwords), (err) => {
                if(err) console.log(err);
            });
 
            message.channel.send("Mentve!\nHozzá lett adva a listához!: "+(args[0]))
        } else {
            message.reply("írj szöveget!")
        }
    }


    
        if(message.member.hasPermission("ADMINISTRATOR")){
          let confirm = false;
          
          let i;
          for(i = 0; i < badwords.length; i++){
              if(message.content.toLowerCase().includes(badwords[i].toLowerCase())){
              confirm = true
              }
          }
          if(confirm) {
              message.delete()
              return message.channel.send("Ezen a szerveren a csúnyaszavak használata NEM engedélyezett!")
          }
        }

        let ido = 2000;
        let cooldown = false;


        if(cmd === `${prefix}xd`){
            let asd = new Discord.MessageEmbed()
            .setTitle("asd")
            .setAuthor("asd")
            .addField("asd", "adsa")
            .setColor("WHITE")
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setFooter(message.author.tag, message.author.avatarURL())
            .setTimestamp(message.createdAt)

            message.channel.send(asd)
        }







        if(cmd === `${prefix}giveaway`){
            const messageArray = message.content.split(" ");
            if(!message.member.hasPermission("KICK_MEMBERS" || "BAN_MEMBERS")) return message.channel.send("Ehhez a parancshoz nincs jogod!")

            let tárgy = "";
            let idő;
            let winnerCount;

            for (let i = 1; i < args.length; i++){
                tárgy += (args[i] + " ")
                console.log(tárgy)
            }

            idő = args[0];

        if(!idő){
            return message.reply("Kérlek adj meg egy idő intervallumot! pl: 100s, 5h, 2d")
        }
        if(!tárgy){
            return message.reply("Kérlek add meg a nyereményjáték tárgyát!")
        }

        var Gembed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Nyereményjáték!!!!")
        .setDescription(`**${tárgy}**`)
        .addField("`Időtartam:`", ms(ms(idő), {long: true}), true)
        .setFooter("A jelentkezéshe reagálj ezzel: 🎉")
        var embedSend = await message.channel.send(Gembed);
        embedSend.react("🎉");

        setTimeout(async() => {
            try{
                const peopleReactedBOT =  await embedSend.reactions.cache.get("🎉").users.fetch();
                var peopleReacted = peopleReactedBOT.array().filter(u => u.id !== bot.user.id);
            }catch(e){
                return message.channel.send(`Hiba törtét a **${tárgy}** sorsolása során! Hiba: `+"`"+e+"`")
            }
            var winner;

            if(peopleReacted.length <= 0){
                return message.channel.send("Senki nem jelentkezett a nyereményjátékra! :C")
            } else {
                var index = Math.floor(Math.random() * peopleReacted.length);
                winner = peopleReacted[index]
            }

            if(!winner) {
                message.channel.send("Hiba történt a sorsolás során!")
            } else {
                message.channel.send(`🎉🎉🎉🎉 **${winner.toString()}** megnyerte ezt: **${tárgy}**`);
            }
        }, ms(idő))
        }
    

})

bot.on("message", async (message) => {
    let prefix = "!"
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "play"){
        if(!message.member.voice.channel) return message.reply("Te nem vagy bent egy voice csatornában sem!")
        if(message.guild.me.voice.channel && message.member.voice.channel.id !==  message.guild.me.voice.channel.id) return message.reply("Te nem vagy velem egy voice csatornában!")
        if(!args[0]) return message.reply("Kérlek adj meg egy URL-t vagy egy zene címét!")

        bot.player.play(message, args.join(" "), {firstResult: true});
    }
    if(command === "stop"){
    	message.reply("Megállítva!")
	bot.player.stop()
    }
    if(command === "queue"){
        if(!message.member.voice.channel) return message.reply("Te nem vagy bent egy voice csatornában sem!")
        if(message.guild.me.voice.channel && message.member.voice.channel.id !==  message.guild.me.voice.channel.id) return message.reply("Te nem vagy velem egy voice csatornában!")

        const queue = bot.player.getQueue(message);

        if(!bot.player.getQueue(message)) return message.reply("A várólistán nem szerepel semmi!")

	message.channel.send(`**Várólista - ${message.guild.name}\nJelenleg ${queue.playing.title} | ${queue.playing.author}\n\n` + (queue.tracks.map((track, i) => {
            return `**#${i + 1}** - ${track.title} | ${track.author} (A zenét kérte: ${track.requestedBy.username})`

        }).slice(0, 5).join('\n') + `\n\n${queue.tracks.length > 5 ? `és még **${queue.tracks.length - 5}db zene...` : `A lejátszási listában: **${queue.tracks.length}db zene van.`}`
         ));
    }

})





// client.on('clickButton', async (button) => {
//     if(button.id === "smart"){
//         button.channel.send("xd")
//     }
// })

fs.writeFile("./money.json", JSON.stringify(money), (err) => {
    if(err) console.log(err);
});




bot.login(tokenfile.token);