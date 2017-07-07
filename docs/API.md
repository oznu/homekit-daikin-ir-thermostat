## API Methods

There are three API methods:

* Get Status
* Set Mode
* Set Temperature

### Get Status

```http
GET /status
```

### Set Mode/State

```http
GET /set-state/off
GET /set-state/heat
GET /set-state/cool
GET /set-state/auto
```

### Set Temperature

```http
GET /set-temperature/22
```

*Note If the requested temperature is outside the allowed range it will automatically be set the the lowest or highest temperature allowed for the current mode. For example, if you try and cool to 12° but the AC unit can only cool to 18°, the temperature will be set to 18°. Similarly if you try and cool to 50° but the AC unit can only cool to 30° the temperature will set to 30°. The HTTP response will show the **targetTemperature** that was set.*

### Response

All methods return the current status as JSON:

```json
{
  "currentTemperature":25,
  "currentHumidity":29,
  "targetTemperature":24,
  "mode":"off"
}
```
