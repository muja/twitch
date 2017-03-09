on open location tURL
	do shell script "bash -c 'error=$(twitch \"" & tURL & "\" 2>&1) || osascript -e \"display dialog \\\"$error\\\"\"' >/dev/null 2>&1 &"
end open location
