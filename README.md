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

[DataTypes](#dataTypes) Data Types

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

##### <a name="dataTypes"></a>DataTypes

<a name="_TimeEntry:_"></a>_TimeEntry:_

```ts
{
  id: number,
  wid: null | number, // Workspace ID required if pid or tid not supplied
  pid: null | number, // Project ID
  pid: null | number, // Task ID
  billable: boolean, // Default false, available for pro workspaces
  start: string, // ISO 8601 date and time e.g. '2021-01-21T09:00:00Z'
  stop: string, // ISO 8601 date and time
  duration: number,
  description: string,
  tags: Array<string>,
  at: string
}
```
More details about TimeEntry available [here](https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md) 

_UserData:_

```ts
{
  id: number,
  email: string,
  password: string,
  timezone: string,
  fullname: string,
  send_product_emails: boolean
  send_weekly_report: boolean
  send_timer_notifications: boolean
  store_start_and_stop_time: boolean
  beginning_of_week: number // in the range of 0-6
  timeofday_format: string, // Two formats are supported:
                            // "H:mm" for 24-hour format
                            // "h:mm A" for 12-hour format (AM/PM)
  date_format: string // possible values: "YYYY-MM-DD", "DD.MM.YYYY", "DD-MM-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "MM-DD-YYYY"
}
```
More details about UserData available [here](https://github.com/toggl/toggl_api_docs/blob/master/chapters/users.md) 

_ClientData:_

```ts
{
  id: number,
  name: string,
  wid: null | number,
  notes: string,
  at: string
}
```
More details about ClientData available [here](https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md) 


_ProjectData:_

```ts
{
  id: number,
  name: string,
  wid: null | number,
  cid: null | number,
  active: boolean,
  is_private: boolean,
  template: boolean,
  template_id: number,
  billable: boolean,
  auto_estimates: boolean,
  estimated_hours: number,
  at: string,
  color: string,
  rate: number, 
  created_at: string
}
```
More details about ProjectData available [here](https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md) 


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

The `timeEntry` info argument has the [following format](_TimeEntry:_)

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

Get a list of [TimeEntries](_TimeEntry:_) in Toggl board.

##### <a name="getCurrentTimeEntry"></a>Get current running TimeEntries action

_Definition:_

```ts
() => object
```
Get current running time entry

_Usage:_

```js
const timeEntries = await togglConnector.getCurrentTimeEntry()
```

Get an object of [TimeEntry](_TimeEntry:_).

##### <a name="getTimeEntryData"></a>Get TimeEntriy Data action

_Definition:_

```ts
(teId: number | string) => object
```
Get time entry data

_Usage:_

```js
const timeEntries = await togglConnector.getTimeEntryData(1783760282)
```

Get an object of [TimeEntry](_TimeEntry:_).

##### <a name="createTimeEntry"></a>Create TimeEntriy action

_Definition:_

```ts
(timeEntry: TimeEntry) => object
```
Get time entry data

_Usage:_

```js
const timeEntries = await togglConnector.createTimeEntry(1783760282)
```

Get an object of [TimeEntry](_TimeEntry:_).

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