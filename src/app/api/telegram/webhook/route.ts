
import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  const url = `${TELEGRAM_API_URL}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

export async function POST(req: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set.');
    return NextResponse.json({ status: 'error', message: 'Bot token not configured.' }, { status: 500 });
  }

  try {
    const body = await req.json();

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      const replyText = `You said: "${text}".\nWelcome to the DecaVerse bot!`;
      await sendMessage(chatId, replyText);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to process update.' }, { status: 500 });
  }
}
