
# How to Use DecaVerse as a Telegram Mini App

Telegram Mini Apps allow you to launch web applications right inside Telegram. This guide will walk you through setting up your DecaVerse app to be launched from your new Telegram bot (`@DecaVerseJarvisBot`).

## Prerequisites

1.  **A Deployed Application:** Your DecaVerse application must be deployed to a publicly accessible URL (e.g., your Firebase Hosting URL).
2.  **Your Telegram Bot:** You have already created `@DecaVerseJarvisBot` with the BotFather.

## Step-by-Step Setup Guide

Follow these instructions in your conversation with the **[@BotFather](https://t.me/BotFather)** on Telegram.

### 1. Select Your Bot

*   Start a chat with **@BotFather**.
*   Send the command:
    ```
    /mybots
    ```
*   BotFather will show you a list of your bots. Select **`@DecaVerseJarvisBot`** from the list.

### 2. Open Bot Settings

*   After selecting your bot, you will see a menu of options. Click on the **Bot Settings** button.

### 3. Configure the Menu Button

The Menu Button is what users will tap to launch your app.

*   In Bot Settings, click on **Menu Button**.
*   BotFather will ask you to provide the URL for the menu button. This URL must be the **live, deployed URL of your DecaVerse application**.
    *   **Example:** If your app is hosted at `https://decaverse-abcd.web.app`, you would send that full URL.
*   After you send the URL, BotFather will ask for a name for the menu button.
    *   Send a short, clear name like `Play Games` or `Open DecaVerse`.

### 4. Test Your Mini App

*   Open a chat directly with your bot, **`@DecaVerseJarvisBot`**.
*   You should now see the new menu button you configured (e.g., "Play Games") in the message input area.
*   Tap the button! Your DecaVerse application will launch seamlessly inside the Telegram chat window.

That's it! Your bot now serves as a gateway to your fully interactive PWA, creating a native-like experience for your users directly within Telegram.
