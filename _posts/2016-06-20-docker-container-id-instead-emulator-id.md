---
layout: post
title: Использование id докер контейнера в качестве имени эмулятора
tags: [appium, android, emulator, docker]
---
Android эмуляторы имеют идентификаторы вида device-5556, где 5556 - порт консоли эмулятора. 
Именно это идентификатор использует appium в качестве свойства deviceName. В простом варианте использования appium, 
когда у вас один инстанс appium и много эмуляторов на разных портах - это удобно. В нашем же случае, 
для каждого эмулятора поднимается свой персональный appium, инстансы которого в последствии объединяются с помощью 
Selenium GRID. Так вот наши эмуляторы живут в докер контейнерах и поднимаются на одном и том же порту, как следствие 
у всех эмуляторов одно значение deviceName. Данной свойство удобно выводить в тесте, в случае его падения. 
Чтобы в последствии можно было руками прогнать тест на том же устройстве. Но из-за одинаковых значений, приходится 
сначала по логам искать нужный эмулятор, что занимает много времени. Хотелось бы для всех эмуляторов иметь уникальные 
значения device id, как в случае с реальными устройствами.

К сожалению, изменить именно device id не представляется возможным. Поэтому было решено зайти со стороны свойства 
deviceName. Как я уже писал ранее, эмуляторы живут в своих персональных контейнерах, а у них в свою очередь как раз 
уникальные id, используя которые в качестве deviceName, можно бы было моментально определять в каком контейнере упал 
тест. Сказано, сделано!

Идея следующая: в json файл конфигурации, используемый для регистрации в Selenium GRID, добавляем свойство deviceName, 
которое appium должен будет передавать в тест, если оно указано, в противном случае должна отрабатывать оригинальная 
логика. Именно в это поле и необходимо прописать id контейнера, в котором запускаются appium и эмулятор.

#### Парсим конфигурационный файл регистрации в Selenium GRID: grid-register.js
```(js)
exports.getDeviceName = function (configFile) {
  var data = fs.readFileSync(configFile, 'utf-8');
  if (data) {
    try {
      var json = JSON.parse(data);
      return json.capabilities[0].deviceName;
    } catch (e) {
      console.log(e);
      logger.error("Unable to parse node configuration file");
    }
  } else {
    logger.error("Unable to load node configuration file to register with grid");
  }
};
```

#### Прописываем распаршеное значение в свойства: android.js
```(js)
Android.prototype.setActualCapabilities = function (cb) {
  this.capabilities.deviceName = grid.getDeviceName(this.args.nodeconfig) || this.adb.udid || this.adb.curDeviceId;
  this.adb.shell("getprop ro.build.version.release", function (err, version) {
    if (err) {
      logger.warn(err);
    } else {
      logger.debug("Device is at release version " + version);
      this.capabilities.platformVersion = version;
    }
    return cb();
  }.bind(this));
};
```

#### В шаблон конфигурационного файла регистрании в Selenium GRID записываем плейсхолдер ${DEVICE_NAME}: grid.template
```(json)
{
  "capabilities":
  [
    {
      "browserName": "${DEVICE_TYPE}",
      "version":"5.0",
      "maxInstances": 1,
      "platform":"ANDROID",
      "androidVersion": "5.1.1",
      "deviceName": "${DEVICE_NAME}",
      "emulated": true,
      "hasRoot": true,
      "abi": "X86",
      "hardwareButtons": false
    }
  ],
  "configuration":
  {
    "cleanUpCycle": 2000,
    "timeout": 90000,
    "url": "http://${HUB}:${PORT}/wd/hub",
    "maxSession": 1,
    "port": ${PORT},
    "host": "${HUB}",
    "register": true,
    "registerCycle": 5000,
    "hubPort": ${HUB_PORT},
    "hubHost": "${HUB}"
  }
}
```

#### В команде RUN записываем значение id контейнера в переменную окружения: Dockerfile
```
export DEVICE_NAME=`cat /proc/self/cgroup | grep docker | grep -o -E '[0-9a-f]{64}' | head -c 12` \
&& envsubst < "/opt/grid.template" > "/opt/grid.json"
```

Собираем образ и наслаждаемся id контейнера в ответе appium `driver.getCapabilities().getCapability("deviceName");`