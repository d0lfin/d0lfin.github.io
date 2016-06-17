---
layout: post
title: Пользовательские capabilities и Selenium GRID
tags: [docker, ssh]
---
[Selenium GRID](https://github.com/SeleniumHQ/selenium/wiki/Grid2) умеет работать со следующими capabilities:

1. Platform
2. Browser name
3. version (Browser version)
4. applicationName (недокументированная capability)

Но что делать, если у устройств, на которых запускаются тесты больше свойств и вы хотите запускать тесты на конкретных?
К примеру, на у телефонов есть размер экрана и архитектура процессора. 
Чтобы решить эту проблему, достаточно реализовать свой матчер для дополнительных capabilities:

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