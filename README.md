# Twitch Utilities

This repository is a collection of scripts that mainly revolve around using (VLC through) Livestreamer to watch a stream instead of the slow and laggy Flash player plugin

## Fast setup

If you just want the whole package without reading too much, follow these steps:
(We need two steps as the **Tampermonkey** script needs to be pasted by hand.)

### Step 1: Install URL Scheme Handlers (currently OSX only) & Twitch wrapper for Livestreamer

```
curl -sSL https://raw.githubusercontent.com/muja/twitch/master/install.sh | sh
```

### Step 2: Install Tampermonkey script (Greasemonkey not tested yet)

Copy and paste the [Tampermonkey script](./tampermonkey/twitch.js) into your Tampermonkey/Greasemonkey browser plugin.

You should be ready to go!

## Explanations & Guide to installation by hand

### Step 1: Wrapper script

I wrote a little wrapper script for `livestreamer` as I didn't want to keep entering full URLs, or my oauth token, or the desired quality, or or or... It is located under [bin/](./bin/twitch). Install:

`wget -O/usr/local/bin/twitch https://raw.githubusercontent.com/muja/twitch/master/bin/twitch && chmod +x /usr/local/bin/twitch`

### Step 2: URL handlers (OSX only currently)

Now that we have our wrapper script, it's time for our URL scheme handler. I set it up to hook into the `twitch://` scheme. It captures those URLs and delegates them to our `twitch` script.

#### OSX

You can install it **from source** - clone this repository and execute these steps:

1. Open [osx/Twitch.applescript](./osx/Twitch.applescript) in the `Script Editor` app
2. Click `File` -> `Save` (or `⌘S`)
3. For `File Format`, select `Application`
4. Save the file under `Twitch.app`
5. Copy the file [osx/Info.plist](./osx/Info.plist) into `Twitch.app/Contents`
6. Move `Twitch.app` to `/Applications` (or `/Applications/URLHandlers` if you want to keep things organized)

**Or, on El Capitan and later:**

```
osacompile -o Twitch.app osx/Twitch.applescript
mv osx/Info.plist Twitch.app/Contents
mv Twitch.app /Applications
```

That should be it, OSX registers URL handlers automagically when you move an app into `/Applications`

Or, download the [OSXBinaries.zip](https://github.com/muja/twitch/releases/download/0.1.0/OSXBinaries.zip), extract and move `Twitch.app` to `/Applications`

#### Linux (not supported yet, but simple)

On Linux, it should be very simple, too, you probably just need a `.desktop` file and can use the `sed` command I use for the [OSX one](./osx/Twitch.applescript#2). I haven't gotten around to it yet, but there are many guides out there how to create your custom URL handler (e.g. for `Sublime Text`). Contributions are welcome (or bump me if you need this desperately)!

#### Windows (not supported yet)

Unforunately, I don't have a lot of experience with Windows but if you want to contribute, I'd be happy to merge it.

### Step 3: Paste Tampermonkey script into your browser

The [tampermonkey script](./tampermonkey/twitch.js) edits streamer URLs on the [Twitch website](https://twitch.tv) to link to our URL handler via `twitch://streamer_name`. Funnily enough, Twitch provides 2 anchor tags for (almost) **every** URL, so we can just edit one of them and keep the usual Twitch experience. I plug the handler into the *stream thumbnail/image anchor tag* while leaving the *stream title anchor tag* untouched. So if you want to use `livestreamer`, you'd click on the image, and if you want to follow the link to the streamer's page, you would click on the title.

Currently, the following locations are edited:

- Directory page (Games / Communities)
- Following page, *including hosted channels*
- Following sidebar
- Streamer profile page (here, a tab is added to the top, next to the 'Followers' tab)

## Contributing

Contributions are welcome. Fork -> Patch -> Pull Request.
