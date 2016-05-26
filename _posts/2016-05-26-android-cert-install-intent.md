---
layout: post
title: Интент установки пользовательского сертификата в Android
tags: [android]
---
`am start -S -n com.android.certinstaller/.CertInstallerMain -d file:///data/local/tmp/ca-certificate-rsa.crt -t application/x-x509-ca-cert -a android.intent.action.VIEW`