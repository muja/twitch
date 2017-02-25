on open location tURL
	set streamer to do shell script "echo '" & tURL & "' | sed -nE 's;.*://([a-zA-Z0-9_]+).*;\\1;p'"
	do shell script "bash -c 'error=$(twitch -Q " & streamer & " 2>&1) || osascript -e \"display dialog \\\"$error\\\"\"' >/dev/null 2>&1 &"
end open location
