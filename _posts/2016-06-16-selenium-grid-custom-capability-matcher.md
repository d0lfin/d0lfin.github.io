---
layout: post
title: Пользовательские capabilities и Selenium GRID
tags: [java, selenium]
---
[Selenium GRID](https://github.com/SeleniumHQ/selenium/wiki/Grid2) умеет работать со следующими capabilities:

1. Platform
2. Browser name
3. version (Browser version)
4. applicationName (недокументированная capability)

Но что делать, если у устройств, на которых запускаются тесты, больше свойств, 
и вы хотите фильтровать запуск тестов по этим свойствам? Давайте разберемся.
К примеру, на у телефонов есть размер экрана и архитектура процессора. 

#### Реализуем свой матчер для дополнительных capabilities: MobileCapabilityMatcher.java

```java
public class MobileCapabilityMatcher extends DefaultCapabilityMatcher {
    private final List<String> capabilities = new ArrayList<String>() {{
       add("displaySize");
       add("abi");
    }};

    @Override
    public boolean matches(Map<String, Object> nodeCapability, Map<String, Object> requestedCapability) {
        boolean basicChecks = super.matches(nodeCapability, requestedCapability);
        boolean mobileChecks = true;
        if (!containsSomeKeys(requestedCapability)){
            return basicChecks;
        }
        for (String capability : capabilities) {
            if (requestedCapability.containsKey(capability)) {
                mobileChecks &= nodeCapability.get(capability).equals(requestedCapability.get(capability));
            }
        }
        return (basicChecks && mobileChecks);
    }

    private boolean containsSomeKeys(Map<String, Object> map) {
        boolean contains = false;
        for (String capability : capabilities) {
            contains |= map.containsKey(capability);
        }
        return contains;
    }
}
```

#### Создадим pom.xml для сборки:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>om.yourcompany.packagename</groupId>
    <artifactId>mobilegridcapabilities</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-server</artifactId>
            <version>2.46.0</version>
        </dependency>
    </dependencies>
</project>
```

#### Соберем матчер

`mvn clean package`

#### Создадим файл конфигурации: hubconfig.json

```json
{
  "capabilityMatcher": "com.yourcompany.packagename.MobileCapabilityMatcher",
  "throwOnCapabilityNotPresent": true
}
```

Файл конфигурации и собранный матчер положим в один каталог с Selenium GRID. Всё, теперь можно запускать хаб:

`java -jar selenium-server-standalone-2.46.0.jar -role hub -hubConfig hubconfig.json`

Не забудьте указать в файлах конфигурации нод значения добавленных свойств.

**P.S.** по мотивам [статьи](https://rationaleemotions.wordpress.com/2014/01/19/working-with-a-custom-capability-matcher-in-the-grid/)