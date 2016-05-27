---
layout: post
title: Инструкция по adb backup
tags: [android]
---
`adb backup [-f <file>] [-apk|-noapk] [-shared|-noshared] [-all] [-system|nosystem] [<packages...>]`

The most basic command you can use* is simply:

`adb backup -all`

This will use the defaults to backup only app and device data (not the APKs themselves) to the current directory as 'backup.ab'
This may not work for every setup. If you get an error such as "adb: cannot open file ./backup.ab", use:

`adb backup -all -f C:\backup.ab`

Or substitute the path of your choice in place of C:\.
To explain the parameters:

`-f <file>`

Use this to choose where the backup file will be stored, e.g. '-f /backup/mybackup.ab', which will save it at the root of your drive (C:\ for Windows, etc.) in a folder called backup, as a file named 'mybackup.ab'. I recommend using this flag to set a location manually, as with my first backup test, it said that it completed successfully, but I was unable to locate the backup file. I have no idea where it was saved, but it wasn't where it should have been located.

`-apk|-noapk`

This flags whether or not the APKs should be included in the backup or just the apps' respective data. I personally use -apk just in case the app isn't available in the Market, so that I don't have to go hunt it down again. The default is -noapk.

`-shared|-noshared`

This flag is used to "enable/disable backup of the device's shared storage / SD card contents; the default is noshared.", which for the Nexus I would certainly flag to -shared, but from my test, it did not restore all of the contents of my internal storage, so I recommend backing up music, pictures, video, and other internal storage items manually, just to be on the safe side. The default is -noshared.

`-all`

This flag is just an easy way to say to backup ALL apps. The packages flag (further on) can be used to choose individual packages, but unless you're just wanting to backup a specific application, use -all for a full system backup.

`-system|-nosystem`

This flag sets whether or not the -all flag also includes system applications or not. I used -system, but this is probably unnecessary, and I would almost guess that it is safer to use -nosystem, but use your own judgment on this. The default is -system.

`<packages...>`

Here you can list the package names (e.g. com.google.android.apps.plus) specifically that you would like to backup. Use this only if you're looking to backup a specific application.