---
layout: post
title: Как запустить остановленные docker контейнеры с интервалом в 10 секунд
tags: [docker, ssh]
---
`docker ps -a | awk '{print($1)}' | xargs -I {} sh -c 'sleep 10 && docker start {}'`