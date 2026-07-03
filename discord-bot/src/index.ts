import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config/index.js';
import { handleMessageCreate } from './events/message-create.js';
import { DiscordAlertService } from './services/discord-alert.service.js';
import { AlertSubscriber } from './services/alert-subscriber.js';

function main(): void {
  if (!config.token) {
    console.error(
      'DISCORD_BOT_TOKEN is not set. Copy .env.example to .env and add your bot token.\n' +
        'Also enable the "Message Content Intent" in the Discord Developer Portal.',
    );
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent, // requires the portal toggle
    ],
    partials: [Partials.Channel],
  });

  const alertService = new DiscordAlertService(client);
  const subscriber = new AlertSubscriber(alertService);

  client.once(Events.ClientReady, (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    console.log(`Prefix commands ready: ${config.prefix}status, ${config.prefix}room, ${config.prefix}usage, ${config.prefix}alerts`);
    subscriber.start(); // proactive alerts via backend socket
  });

  client.on(Events.MessageCreate, (message) => {
    handleMessageCreate(message).catch((err) => console.error('messageCreate error', err));
  });

  const shutdown = () => {
    subscriber.stop();
    client.destroy();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  client.login(config.token).catch((err) => {
    console.error('Failed to log in to Discord:', err);
    process.exit(1);
  });
}

main();
