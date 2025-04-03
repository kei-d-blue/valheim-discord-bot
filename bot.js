require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const conoha = require('./conoha');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// スラッシュコマンドの定義
const commands = [
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('Valheimサーバーを起動します'),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Valheimサーバーを停止します'),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Valheimサーバーの状態を確認します'),
  new SlashCommandBuilder()
    .setName('info')
    .setDescription('サーバーの詳細情報を表示します')
    .addStringOption(option =>
      option.setName('server_id')
        .setDescription('サーバーID')
        .setRequired(true))
].map(command => command.toJSON());

// スラッシュコマンドの登録
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンドを登録中...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('スラッシュコマンドの登録が完了しました。');
  } catch (error) {
    console.error('スラッシュコマンドの登録中にエラーが発生しました:', error);
  }
})();

// スラッシュコマンドの処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'start':
        await interaction.reply('サーバーを起動中です...');
        const startResult = await conoha.startServer();
        await interaction.editReply(startResult);
        break;

      case 'stop':
        await interaction.reply('サーバーを停止中です...');
        const stopResult = await conoha.stopServer();
        await interaction.editReply(stopResult);
        break;

      case 'status':
        await interaction.reply('サーバーの状態を確認中です...');
        const statusResult = await conoha.getServerStatus();
        await interaction.editReply(statusResult);
        break;

      case 'info':
        const serverId = interaction.options.getString('server_id');
        await interaction.reply('サーバー情報を取得中です...');
        const infoResult = await conoha.getServerDetails(serverId);
        await interaction.editReply(infoResult);
        break;
    }
  } catch (error) {
    console.error('コマンド実行中にエラーが発生しました:', error);
    await interaction.reply({ 
      content: 'コマンドの実行中にエラーが発生しました。',
      ephemeral: true 
    });
  }
});

// ボットの準備が完了したときの処理
client.once('ready', () => {
  console.log(`ログインしました: ${client.user.tag}`);
});

// ボットの起動
client.login(process.env.DISCORD_TOKEN); 