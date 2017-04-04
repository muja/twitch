on open location tURL
  do shell script "
    export PATH=\"/usr/local/bin:$PATH\"
    bash -c '
      error=$(twitch_uri \"" & tURL & "\" 2>&1) ||
      osascript -e \"display dialog \\\"$error\\\"\"
    ' >/dev/null 2>&1 &
  "
end open location
