#!/bin/sh

set -e

if test "$(git remote -v | grep 'upstream' | wc -l)" = 0; then
  echo "Upstream remote not found, adding one"
  git remote add upstream https://github.com/blitz-js/blitz.git
fi

git fetch upstream
