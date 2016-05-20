---
layout: post
title: Автоматическое тестирование обновления Android приложения
tags: [android, test, emulator]
---

```sh
#!/system/bin/sh
recurse() {
 for i in "$3"/*;do
    if [ -d "$i" ];then
        case $i in
            *lib) echo "skip lib directory"
            ;;
            *) chown $1:$2 "$i"
               recurse $1 $2 "$i"
            ;;
        esac
    elif [ -f "$i" ]; then
        chown $1:$2 "$i"
    fi
 done
}
recurse $1 $2 $3
```
