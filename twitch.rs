#[macro_use]
extern crate clap;
extern crate url;

use std::collections::HashMap;
use std::process::Command;
// use std::os::unix::process::CommandExt;
// use std::io::Read;

fn twitch_token() -> String {
    use std::env::VarError::*;
    match std::env::var("TWITCH_TOKEN") {
        Ok(val) => val,
        Err(NotPresent) => {
            "mw7yr168g7j3n34saxiehzkii1bx69".into()
            // let tokfile =
            //     std::env::home_dir().expect("Home directory not found.").join(".twitch_token");
            // let mut f = std::fs::File::open(&tokfile)
            //     .expect(&format!("Couldn't open file: {:?}", &tokfile));
            // let mut s = String::with_capacity(32);
            // f.read_to_string(&mut s)
            //     .expect(&format!("Error while reading from file: {:?}", &tokfile));
            // s = s.trim().into();
            // std::env::set_var("TWITCH_TOKEN", &s);
            // s
        }
        Err(NotUnicode(_)) => panic!("TWITCH_TOKEN environment variable is not unicode"),
    }
}

fn main() {
    let qualities = vec!["source", "best", "1080p", "1080p60", "1080p30", "720p", "720p60",
                         "720p30", "medium", "540p", "540p60", "540p30", "480p", "480p60",
                         "480p30", "144p", "worst", "mobile"]
        .join(",");
    let ref matches = clap_app!( twitch_uri =>
        (version: env!("CARGO_PKG_VERSION"))
        (author: crate_authors!())
        (about: crate_description!())
        (@arg no_chat: -C --nochat "Don't open chat (in browser).")
        (@arg no_stream: -S --nostream "Don't open stream.")
        (@arg quiet: -Q --quiet "Disable verbosity.")
        (@arg streamer: +required "Streamer / URL")
        (@arg quality: +takes_value -q --quality default_value(&qualities) "Quality to use.")
    )
        .get_matches();
    let mut quality = matches.value_of("quality").unwrap().to_owned();
    let mut quiet = matches.is_present("quiet");
    let mut no_chat = matches.is_present("no_chat");
    let no_stream = matches.is_present("no_stream");
    let streamer_arg = matches.value_of("streamer").unwrap();
    let url = url::Url::parse(&streamer_arg);
    let streamer = match url {
        Err(url::ParseError::RelativeUrlWithoutBase) => streamer_arg,
        Ok(ref url) => {
            let map = url.query_pairs().collect::<HashMap<_, _>>();
            let yes = ["yes", "true", "1"];
            let no = ["no", "false", "0"];
            no_chat = map.get("chat")
                .map(|s| s.to_lowercase())
                .map(|s| no.contains(&s.as_ref()))
                .unwrap_or(no_chat);
            quiet = map.get("quiet")
                .map(|s| s.to_lowercase())
                .map(|s| yes.contains(&s.as_ref()))
                .unwrap_or(quiet);
            quality = map.get("quality")
                .into_iter()
                .filter(|s| !s.is_empty())
                .map(|s| (**s).into())
                .next()
                .unwrap_or(quality);
            url.host_str().expect("Host missing")
        }
        Err(x) => {
            panic!("Provided args must be streamer URL. {}", x);
        }
    };
    let channel = ["https://www.twitch.tv", streamer].join("/");
    if !no_chat {
        let chat_url = [&channel, "chat"].join("/");
        if let Err(e) = execute(&mut open_browser_commands(), &[&chat_url], !quiet) {
            println!("Error opening chat: {:?}", e);
        }
    }
    if !no_stream {
        let tok = twitch_token();
        let mut args =
            vec!["--twitch-oauth-token", &tok, "--stream-segment-threads", "5", &channel, &quality];
        if quiet {
            args.push("-Q");
        }
        match execute(&mut livestreamer_executables(), &args, !quiet) {
            Ok(mut child) => {
                std::process::exit(child.wait()
                    .unwrap()
                    .code()
                    .unwrap());
            }
            Err(e) => {
                println!("Error starting livestreamer: {}", e);
                std::process::exit(2);
            }
        }
    }
}

fn execute(exes: &mut [Command], args: &[&str], p: bool) -> std::io::Result<std::process::Child> {
    assert!(exes.len() > 0);
    let mut err = None;
    for mut command in exes {
        command.args(args);
        match command.spawn() {
            Ok(process) => {
                if p {
                    println!("{:?}", command);
                }
                return Ok(process);
            }
            Err(e) => {
                err = Some(Err(e));
            }
        }
    }
    err.unwrap()
}

#[cfg(target_os = "linux")]
fn open_browser_commands() -> Vec<Command> {
    vec![Command::new("xdg-open"), Command::new("gvfs-open"), Command::new("kde-open")]
}

#[cfg(target_os = "windows")]
fn open_browser_commands() -> Vec<Command> {
    let mut chat_command = Command::new("cmd");
    chat_command.arg("/C").arg("start");
    vec![chat_command]
}

#[cfg(target_os = "macos")]
fn open_browser_commands() -> Vec<Command> {
    vec![Command::new("open")]
}

#[cfg(target_os = "windows")]
fn livestreamer_executables() -> Vec<Command> {
    vec![Command::new("livestreamer"),
         Command::new("C:\\Program Files (x86)\\Livestreamer\\livestreamer"),
         Command::new("C:\\Program Files\\Livestreamer\\livestreamer")]
}

#[cfg(not(target_os = "windows"))]
fn livestreamer_executables() -> Vec<Command> {
    vec![Command::new("livestreamer"), Command::new("/usr/local/bin/livestreamer")]
}
