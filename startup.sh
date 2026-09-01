#!/bin/sh
# Wait 5 seconds for the FC daemon to start up, otherwise we crash
(sleep 5 && cd /home/starcats/co/pretty-kitty && npm start > log 2> log) &
