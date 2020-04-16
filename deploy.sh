#!/usr/bin/env bash
set -ex

./git-version.sh

# npx ng build --prod --base-href "..."
npx ng build --prod
npx firebase deploy
