---
layout: post
title: Обновляем локальный master и делаем с него rebase в одну строку 
tags: [ssh]
---
`git branch | grep '*' | awk '{print($2)}' | xargs -I {} sh -c 'git checkout master && git pull upstream master && git checkout {} && git rebase master'`