#!/usr/bin/env bash
set -e
set -x

[ -z "$APP_HOME" ] && export APP_HOME=$(pwd)

[ -z "$MONGODB_URI" ] && export MONGODB_URI="$MONGODB_ADDON_URI"
[ -z "$PORT" ] && export PORT="8080"

npm run start
