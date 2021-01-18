# reshuffle-toggl-connector
[Code](https://github.com/reshufflehq/reshuffle-toggl-connector) |  [npm](https://www.npmjs.com/package/reshuffle-toggl-connector) | [Code sample](https://github.com/reshufflehq/reshuffle/tree/master/examples/toggl)

`npm install reshuffle-toggl-connector`

This connector uses [Official Node Toggl Client](https://www.npmjs.com/package/toggl-api) package.

### Reshuffle Toggl Connector


_ES6 import_: `import { TogglConnector } from 'reshuffle-toggl-connector'` 

This is a [Reshuffle](https://github.com/reshufflehq/reshuffle) connector that provides an Interface to the Toggl Client.

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

[TimeEntryAdded](#TimeEntryAdded) TimeTracker Added

[TimeEntryModified](#TimeEntryModified) TimeTracker Modified

[TimeEntryRemoved](#TimeEntryRemoved) TimeTracker Removed

_Connector actions_:

[getTimeEntries](#getTimeEntries) Get TimeEntries objects

[getCurrentTimeEntry](#getCurrentTimeEntry) Get current running TimeEntries

[getTimeEntryData](#getTimeEntryData) Get TimeEntry Data

[createTimeEntry](#createTimeEntry) Create TimeEntry

[startTimeEntry](#startTimeEntry) Start TimeEntry

[stopTimeEntry](#stopTimeEntry) Stop TimeEntry

[updateTimeEntry](#updateTimeEntry) Update TimeEntry

[updateTimeEntriesTags](#updateTimeEntriesTags) Update TimeEntries Tags

[deleteTimeEntry](#deleteTimeEntry) Delete TimeEntry

[getUserData](#getUserData) Get UserData

[updateUserData](#updateUserData) Update UserData

[resetApiToken](#resetApiToken) Reset Api Token

[changeUserPassword](#changeUserPassword) Change User Password

[createClient](#createClient) Create Client

[getClients](#getClients) Get Clients

[getClientData](#getClientData) Get Client's Data

[updateClient](#updateClient) Update Client

[deleteClient](#deleteClient) Delete Client



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

##### All the events are triggered based on changes that occurred only in TimeEntries that started during the last 9 days.


##### <a name="TimeEntryAdded"></a>TimeEntry Added event

_Event parameters:_

```
type: 'TimeEntryAdded' - Event type for added TimeEntry
```

_Example:_

```js
connector.on({ type: 'TimeEntryAdded' }, async (event, app) => {
  console.log('TimeEntry Added:')
  console.log('  Id:', event.id)
  console.log('  Start:', event.start)
  console.log('  Stop:', event.stop)
  console.log('  Description:', event.description)
})
```

This event is triggered once whenever a new TimeEntry is added to the Toggl board.

The `timeEntry` argument has the [following format](_TimeEntry:_)

##### <a name="TimeEntryModified"></a>TimeEntry Modified event

_Event parameters:_

```
type: 'TimeEntryModified' - Event type for modified TimeEntry
```

_Example:_

```js
connector.on({ type: 'TimeEntryModified' }, async (event, app) => {
  console.log('TimeEntry Modified:')
  console.log('  Id:', event.id)
  console.log('  Start:', event.start)
  console.log('  Stop:', event.stop)
  console.log('  Description:', event.description)
})
```

This event is triggered once whenever the content of a TimeEntry in the
Toggl board is modified.

The `timeEntry` argument has the [following format](_TimeEntry:_)


##### <a name="TimeEntryRemoved"></a>TimeEntry Removed event

_Event parameters:_

```
type: 'TimeEntryRemoved' - Event type for removed TimeEntry
```

_Example:_

```js
connector.on({ type: 'TimeEntryRemoved' }, async (event, app) => {
  console.log('TimeEntry Removed:')
  console.log('  Id:', event.id)
  console.log('  Start:', event.start)
  console.log('  Stop:', event.stop)
  console.log('  Description:', event.description)
})
```

This event is triggered once whenever a TimeEntry is removed from the
Toggl board.

The `timeEntry` argument has the [following format](_TimeEntry:_)

#### Connector actions

##### <a name="getTimeEntries"></a>Get TimeEntries action

_Definition:_

```ts
( startDate?: string | number | Date | Moment, 
  endDate?: string | number | Date | Moment
) => object[]
```

_Usage:_

```js
const timeEntries = await togglConnector.getTimeEntries('2021-01-01T09:00:00.000Z', '2021-01-05T17:00:00.000Z')
```

Get a list of [TimeEntries](_TimeEntry:_) in Toggl board.
If start_date and end_date are not specified, time entries started during the last 9 days are returned. 
The limit of returned time entries is 1000.

##### <a name="getCurrentTimeEntry"></a>Get current running TimeEntries action

_Definition:_

```ts
() => object
```

_Usage:_

```js
const timeEntry = await togglConnector.getCurrentTimeEntry()
```

Get the current running [TimeEntry](_TimeEntry:_).

##### <a name="getTimeEntryData"></a>Get TimeEntry Data action

_Definition:_

```ts
(teId: number | string) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.getTimeEntryData(1783760282)
```

Get a [TimeEntry](_TimeEntry:_) data by ID.

##### <a name="createTimeEntry"></a>Create TimeEntry action

_Definition:_

```ts
(timeEntry: TimeEntry) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.createTimeEntry({
    start:'2020-11-20T09:00:00.000Z',
    duration : 360,
    description : 'Design meeting',
    tags : ["Design", "Meetings"]})
```

Create a new [TimeEntry](_TimeEntry:_).

##### <a name="startTimeEntry"></a>Start TimeEntry action

_Definition:_

```ts
(timeEntry: TimeEntry) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.startTimeEntry({
    start:'2020-11-20T09:00:00.000Z',
    stop : '2020-11-20T11:00:00.000Z',
    description : 'Design meeting',
    tags : ["Design", "Meetings"]})
```

Start a new [TimeEntry](_TimeEntry:_).

##### <a name="stopTimeEntry"></a>Stop TimeEntry action

_Definition:_

```ts
(teId: number | string) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.stopTimeEntry(1778035860)
```

Stop running [TimeEntry](_TimeEntry:_).


##### <a name="updateTimeEntry"></a>Update TimeEntry action

_Definition:_

```ts
(teId: number | string, timeEntry: TimeEntry) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.updateTimeEntry(1778035860, {
    start:'2020-11-21T09:00:00.000Z',
    stop : '2020-11-21T11:00:00.000Z',
    description : 'Postponed Design meeting',
    tags : ["Design", "Meetings"]})
```

Update [TimeEntry](_TimeEntry:_) data.


##### <a name="updateTimeEntriesTags"></a>Update TimeEntries Tags action

_Definition:_

```ts
(teIds: number[] | string[], tags: string[], action: string) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.updateTimeEntriesTags([1778035860, 1778035860],['tag-1','tag-2'], 'add')
```

Assign and remove tags from [timeEntries](_TimeEntry:_).
action: possible values: add, remove


##### <a name="deleteTimeEntry"></a>Delete TimeEntry action

_Definition:_

```ts
(teId: number | string) => object
```

_Usage:_

```js
const timeEntry = await togglConnector.deleteTimeEntry(1778035860)
```

Delete [timeEntry](_TimeEntry:_).





##### <a name="getUserData"></a>Get UserData action

_Definition:_

```ts
() => object
```

_Usage:_

```js
const userData = await togglConnector.getUserData()
```

Get current [UserData](https://github.com/toggl/toggl_api_docs/blob/master/chapters/users.md).


##### <a name="updateUserData"></a>Update UserData action

_Definition:_

```ts
(userData: UserData) => object
```

_Usage:_

```js
const userData = await togglConnector.updateUserData({
    id: 4898995,
    email: 'user@gmail.com',
    send_product_emails: true,
    send_weekly_report: true,
    send_timer_notifications: true
  })
```

Update current [UserData](_UserData:_).


##### <a name="resetApiToken"></a>Reset Api Token action

_Definition:_

```ts
() => string
```

_Usage:_

```js
const token = await togglConnector.resetApiToken()
```

Reset current [UserData](_UserData:_) API Token.

##### <a name="changeUserPassword"></a>Change User Password action

_Definition:_

```ts
() => object
```

_Usage:_

```js
const userData = await togglConnector.changeUserPassword(currentPassword: string, password: string)
```


##### <a name="createClient"></a>Create Client action

_Definition:_

```ts
(clientData: ClientData) => object
```

_Usage:_

```js
const clientData = await togglConnector.createClient({
    name: 'Builders LTD',
    notes: 'Important client',
    wid: 4869303
  })
```

Create new [Client](ClientData:_).


##### <a name="getClients"></a>Get Clients action

_Definition:_

```ts
() => object
```

_Usage:_

```js
const clientsData = await togglConnector.getClients()
```

Get all [Clients](ClientData:_) data.


##### <a name="getClientData"></a>Get Client Data action

_Definition:_

```ts
(clientId: number | string) => object
```

_Usage:_

```js
const clientData = await togglConnector.getClientData(5869111)
```

Get [Client](ClientData:_) data by ID.

##### <a name="updateClient"></a>Update Client Data action

_Definition:_

```ts
(clientId: number | string, clientData: ClientData) => object
```

_Usage:_

```js
const clientData = await togglConnector.updateClient(5869111, {
    name: 'Builders One LTD',
    notes: 'Very important client',
    wid: 4869303
  })
```

Update [Client](ClientData:_) data.

##### <a name="deleteClient"></a>Delete Client Data action

_Definition:_

```ts
(clientId: number) => object
```

_Usage:_

```js
const clientData = await togglConnector.deleteClient(5869111)
```

Delete [Client](ClientData:_).

#### SDK

##### <a name="sdk"></a>sdk
_Definition:_

```ts
(options ?: object) => object
```

_Usage:_

```js
const toggl = await togglConnector.sdk()
```

Get the underlying SDK object. You can specify additional options to override
or add to the required fields in the connector's configuration.
