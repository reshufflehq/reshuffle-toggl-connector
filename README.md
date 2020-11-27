# reshuffle-toggl-connector
[Code](https://github.com/reshufflehq/reshuffle-toggl-connector) |  [npm](https://www.npmjs.com/package/reshuffle-toggl-connector) | [Code sample](https://github.com/reshufflehq/reshuffle/tree/master/examples/toggl)

`npm install reshuffle-toggl-connector`

This connector uses [Official Node Toggl Client](https://www.npmjs.com/package/toggl-api) package.

### Reshuffle Toggl Connector


_ES6 import_: `import { TogglConnector } from 'reshuffle-toggl-connector'` 

This is a [Reshuffle](https://dev.reshuffle.com) connector that provides an Interface to the Toggl Client.

You need to get your Toggl API Token from your account. 
See more details [here](https://github.com/toggl/toggl_api_docs#api-token)

The following example creates an API endpoint to list all entries in Toggl between from/to dates:

```js
const { HttpConnector, Reshuffle } = require('reshuffle')
const { TogglConnector } = require('reshuffle-toggle-connectors')

const app = new Reshuffle()
const togglConnector = new TogglConnector(app, { token: 'YOUR_TOGGL_TOKEN' })
const httpConnector = new HttpConnector(app)

httpConnector.on({ method: 'GET', path: '/list' }, async (event) => {
  const keys = await togglConnector.getTimeEntries('2020-11-01T09:00:00.000Z', '2020-11-05T17:00:00.000Z')
  event.res.json(keys)
})

app.start(8000)
```

#### Table of Contents

[Configuration](#configuration) Configuration options

_Connector events_:

[TimeTrackerInitialized](#TimeTrackerInitialized) TimeTracker Initialized

[TimeEntryModified](#TimeEntryModified) TimeTracker Modified


_Connector actions_:

[getTimeEntries](#getTimeEntries) Get TimeEntries objects


_SDK_:

[sdk](#sdk) Get direct SDK access

##### <a name="configuration"></a>Configuration options

```typescript
const app = new Reshuffle()
const togglConnector = new TogglConnector(app, {
  token: string
})
```


#### Connector events

##### <a name="TimeTrackerInitialized"></a>TimeTracker Initialized event

_Example:_

```js
async (objects) => {
  console.log(objects)
}
```

This event is fired when the connector starts tracking a specific Toggl
Timer board. More technically, it is fired when the connector first reads
the content of an Toggl board and does not have a previous record of its
object in its internal database.

##### <a name="TimeEntryModified"></a>TimeEntry Modified event

_Event parameters:_

```

```

_Handler inputs:_

```
timeEntry: TimeEntry - TimeEntry info
```

_Example:_

```js
async (timeEntry) => {
  console.log('TimeEntry Updated:')
  console.log('  Id:', timeEntry.id)
  console.log('  Start:', timeEntry.start)
  console.log('  Stop:', timeEntry.stop)
  console.log('  Description:', timeEntry.description)
}
```

This event is triggered once whenever the content of a TimeEntry in the
Toggl board is modified.

The `timeEntry` info argument has the following format:

```ts
{
  id: number,
  wid: null | number,
  pid: null | number,
  billable: boolean,
  start: string,
  stop: string,
  duration: number,
  description: string,
  tags: Array<string>,
  at: string
}
```



#### Connector actions

##### <a name="getTimeEntries"></a>Get TimeEntries action

_Definition:_

```ts
( startDate?: string | number | Date | Moment, 
  endDate?: string | number | Date | Moment
) => object[]
```
If start_date and end_date are not specified, time entries started during the last 9 days are returned. 
The limit of returned time entries is 1000.

_Usage:_

```js
const timeEntries = await togglConnector.getTimeEntries('2021-01-01T09:00:00.000Z', '2021-01-05T17:00:00.000Z')
```

Get a list of
[TimeEntries](https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md#time-entries)
in Toggl board.




#### SDK

##### <a name="sdk"></a>sdk
_Definition:_

```ts
(
  options ?: object,
) => object
```

_Usage:_

```js
const toggl = await togglConnector.sdk()
```

Get the underlying SDK object. You can specify additional options to override
or add to the required fields in the connector's configuration.