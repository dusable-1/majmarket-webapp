MajMarket WebApp (Vercel) — with /api/notify serverless function

Deploy:
1) Upload this folder to Vercel (Add New → Project → Import).
2) In Project → Settings → Environment Variables add:
   - BOT_TOKEN = <your BotFather token>
3) Redeploy the project.
4) Open your URL (https://....vercel.app).

Telegram bot:
- Set commands in BotFather:
  start - Открыть приложение
  faq - О боте
  support - Связь с модерацией

- Make your bot send a button with the web_app URL (use Telegraf or BotFather menu button).

WebApp behavior:
- Works fully client-side (localStorage) to avoid empty screen.
- Tabs: Главная, Торговля, Настройки, Модерация.
- Simulated orders: hold → transfer → completed.
- Notifications sent via /api/notify to your chat (user must /start the bot first).
