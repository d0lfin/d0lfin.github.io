---
layout: post
title: Назначение файлов эмулятора Android
tags: [android, emulator]
---
* **ramdisk.img** is a small partition image that is mounted read-only by the kernel at boot time. It only contains /init and a few config files. It is used to start init which will mount the rest of the system images properly and run the init procedure. A Ramdisk is a standard Linux feature.
* **system.img** is a partition image that will be mounted as / and thus contains all system binaries
* **userdata.img** is a partition image that can be mounted as /data and thus contains all application-specific and user-specific data.

The build system generates these files, which can later be flashed to a real device, however the emulator uses them in a different way:

* **system.img** is copied into a temporary file, which is used by the emulator session. So any change you make to / as root in the emulator are lost when the program exits
* **userdata.img** is only used when you use -wipe-data. Instead, it uses ~/.android/userdata-qemu.img (on Unix) as the persistent /data partition image. Using -wipe-data simply copes the content of userdata.img into userdata-qemu.img

The main idea being that the emulator should not modify system.img and userdata.img since they were generated as device images. However whether a given system.img/userdata.img set of images will run on a real device properly depends on how it was generated.