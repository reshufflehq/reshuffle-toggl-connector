import { Reshuffle, BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import { CoreConnector, CoreEventHandler, Options } from './CoreConnector'
import { Moment } from 'moment'
import pify from 'pify'

var TogglClient = require('toggl-api');

const TOGGL_STORAGE_KEY = 'TOGGL_STORAGE_KEY'

export interface TogglConnectorConfigOptions {
  token: string
}

export interface TogglConnectorEventOptions {
  type: TogglEvent
}

export class TogglConnector extends CoreConnector {

  private client: any

  constructor(app: Reshuffle, options: TogglConnectorConfigOptions, id?: string) {
    super(app, options, id)
    this.client = new TogglClient({ apiToken: options.token })
  }

  // Events /////////////////////////////////////////////////////////
  public on(
    options: TogglConnectorEventOptions,
    handler: CoreEventHandler,
    eventId?: string,
  ) {
    if (options.type !== 'TimeEntryAdded' &&
      options.type !== 'TimeEntryModified' &&
      options.type !== 'TimeEntryRemoved') {
      throw new Error(`Invalid event type: ${options.type}`)
    }

    if (!eventId) {
      eventId = `TOGGL/${options.type}/${this.id}`
    }
    const eid = eventId
    return this.eventManager.addEvent(options, handler, eid)
  }

  protected async onInterval() {
    const [oldObjects, newObjects] = await this.store.update(
      TOGGL_STORAGE_KEY,
      () => this.getTimeEntriesRecords()
    )

    if (!oldObjects) {
      return
    }

    const diff = this.diffTimeEntries(oldObjects, newObjects)
    if (0 < diff.changeCount) {
      await this.eventManager.fire(
        (ec) => ec.options.type === 'TimeEntryAdded',
        diff.additions,
      )
      await this.eventManager.fire(
        (ec) => ec.options.type === 'TimeEntryModified',
        diff.modifications,
      )
      await this.eventManager.fire(
        (ec) => ec.options.type === 'TimeEntryRemoved',
        diff.removals,
      )
    }
  }

  private diffTimeEntries(oldObjects: TimeEntryRecord, newObjects: TimeEntryRecord) {
    function likelyTheSameObject(o1: TimeEntry, o2: TimeEntry): boolean {
      return (
        o1.start === o2.start &&
        o1.stop === o2.stop &&
        o1.duration === o2.duration &&
        o1.description === o2.description &&
        JSON.stringify(o1.tags) == JSON.stringify(o2.tags)
      )
    }

    const additions: TimeEntry[] = []
    const modifications: TimeEntry[] = []
    const removals: TimeEntry[] = []

    for (const id in newObjects) {
      if (id in oldObjects) {
        if (!likelyTheSameObject(newObjects[id], oldObjects[id])) {
          modifications.push(newObjects[id])
        }
      } else {
        additions.push(newObjects[id])
      }
    }

    for (const id in oldObjects) {
      if (!(id in newObjects)) {
        removals.push(oldObjects[id])
      }
    }

    return {
      changeCount: additions.length + modifications.length + removals.length,
      additions,
      modifications,
      removals,
    }
  }

  private async getTimeEntriesRecords() {
    const res = await this.getTimeEntries()
    if (!res) {
      return {}
    }

    const objects: TimeEntryRecord = {}
    res.forEach(function (te: TimeEntry) {
      objects[te.id] = te
    })
    return objects
  }

  // Actions /////////////////////////////////////////////////////////

  // Time Entry //

  // If start_date and end_date are not specified, time entries started during the last 9 days are returned. 
  // The limit of returned time entries is 1000.
  async getTimeEntries(startDate?: string | number | Date | Moment, endDate?: string | number | Date | Moment) {
    const getTimeEntries = pify(this.client.getTimeEntries.bind(this.client), { multiArgs: true })
    const [data] = await getTimeEntries(startDate, endDate)
    return data
  }

  async getCurrentTimeEntry() {
    const getCurrentTimeEntry = pify(this.client.getCurrentTimeEntry.bind(this.client), { multiArgs: true })
    const [data] = await getCurrentTimeEntry()
    return data
  }

  async getTimeEntryData(teId: number | string) {
    const getTimeEntryData = pify(this.client.getTimeEntryData.bind(this.client), { multiArgs: true })
    const [data] = await getTimeEntryData(teId)
    return data
  }

  async createTimeEntry(timeEntry: TimeEntry): Promise<any> {
    const createTimeEntry = pify(this.client.createTimeEntry.bind(this.client), { multiArgs: true })
    try {
      const [data] = await createTimeEntry(timeEntry)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async startTimeEntry(timeEntry: TimeEntry) {
    const startTimeEntry = pify(this.client.startTimeEntry.bind(this.client), { multiArgs: true })
    const [data] = await startTimeEntry(timeEntry)
    return data
  }

  async stopTimeEntry(teId: number | string) {
    const stopTimeEntry = pify(this.client.stopTimeEntry.bind(this.client), { multiArgs: true })
    const [data] = await stopTimeEntry(teId)
    return data
  }

  async updateTimeEntry(teId: number | string, timeEntry: TimeEntry): Promise<any> {
    const updateTimeEntry = pify(this.client.updateTimeEntry.bind(this.client), { multiArgs: true })
    try {
      const [data] = await updateTimeEntry(teId, timeEntry)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async updateTimeEntriesTags(teIds: number[] | string[], tags: string[], action: string): Promise<any> {
    const updateTimeEntriesTags = pify(this.client.updateTimeEntriesTags.bind(this.client), { multiArgs: true })
    try {
      const [data] = await updateTimeEntriesTags(teIds, tags, action)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async deleteTimeEntry(teId: number | string): Promise<any> {
    const deleteTimeEntry = pify(this.client.deleteTimeEntry.bind(this.client), { multiArgs: true })
    const [data] = await deleteTimeEntry(teId)
    return data
  }

  // Users //
  async getUserData(user: UserData) {
    const getUserData = pify(this.client.getUserData.bind(this.client), { multiArgs: true })
    const [data] = await getUserData(user)
    return data
  }

  async updateUserData(user: UserData): Promise<any> {
    const updateUserData = pify(this.client.updateUserData.bind(this.client), { multiArgs: true })
    try {
      const [data] = await updateUserData(user)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async resetApiToken(): Promise<any> {
    const resetApiToken = pify(this.client.resetApiToken.bind(this.client), { multiArgs: true })
    const [data] = await resetApiToken()
    return data
  }

  async changeUserPassword(currentPassword: string, password: string): Promise<any> {
    const changeUserPassword = pify(this.client.changeUserPassword.bind(this.client), { multiArgs: true })
    const [data] = await changeUserPassword(currentPassword, password)
    return data
  }

  // TODO !! open PR in user.js -> change call to TogglClient.prototype.createUser !!
  // async createUser(user: User): Promise<any> {
  //   const createUser = pify(this.client.createUser.bind(this.client), { multiArgs: true })
  //   const [data] = await createUser(user.email, user.password, user.timezone)
  //   return data
  // }

  // Clients //
  async createClient(clientData: ClientData): Promise<any> {
    const createClient = pify(this.client.createClient.bind(this.client), { multiArgs: true })
    try {
      const [data] = await createClient(clientData)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async getClients() {
    const getClients = pify(this.client.getClients.bind(this.client), { multiArgs: true })
    const [data] = await getClients()
    return data
  }

  async getClientData(clientId: number | string) {
    const getClientData = pify(this.client.getClientData.bind(this.client), { multiArgs: true })
    const [data] = await getClientData(clientId)
    return data
  }

  async updateClient(clientId: number | string, clientData: ClientData) {
    const updateClient = pify(this.client.updateClient.bind(this.client), { multiArgs: true })
    try {
      const [data] = await updateClient(clientId, clientData)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async deleteClient(clientId: number | string) {
    const deleteClient = pify(this.client.deleteClient.bind(this.client), { multiArgs: true })
    const [data] = await deleteClient(clientId)
    return data
  }

  // active - Filter projects: active (true), archived (false), both
  async getClientProjects(clientId: number | string, active: string | boolean) {
    const getClientProjects = pify(this.client.getClientProjects.bind(this.client), { multiArgs: true })
    const [data] = await getClientProjects(clientId, active)
    return data
  }

  // Projects //
  async createProject(projectData: ProjectData): Promise<any> {
    const createProject = pify(this.client.createProject.bind(this.client), { multiArgs: true })
    try {
      const [data] = await createProject(projectData)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  async deleteProject(projectId: number | string) {
    const deleteProject = pify(this.client.deleteProject.bind(this.client), { multiArgs: true })
    const [data] = await deleteProject(projectId)
    return data
  }

  async deleteProjects(projectIds: Array<number> | Array<string>) {
    const deleteProjects = pify(this.client.deleteProjects.bind(this.client), { multiArgs: true })
    const [data] = await deleteProjects(projectIds)
    return data
  }

  async getProjectData(projectId: number | string) {
    const getProjectData = pify(this.client.getProjectData.bind(this.client), { multiArgs: true })
    const [data] = await getProjectData(projectId)
    return data
  }

  async getProjectTasks(projectId: number | string) {
    const getProjectTasks = pify(this.client.getProjectTasks.bind(this.client), { multiArgs: true })
    const [data] = await getProjectTasks(projectId)
    return data
  }

  async getProjectUsers(projectId: number | string) {
    const getProjectUsers = pify(this.client.getProjectUsers.bind(this.client), { multiArgs: true })
    const [data] = await getProjectUsers(projectId)
    return data
  }

  async updateProject(projectId: number | string, projectData: ProjectData) {
    const updateProject = pify(this.client.updateProject.bind(this.client), { multiArgs: true })
    try {
      const [data] = await updateProject(projectId, projectData)
      return data
    } catch (err) {
      this.app.getLogger().error(err);
    }
  }

  // SDK //
  sdk(): any {
    this.app.getLogger().info(`Toggl - SDK Returned`)
    return this.client
  }
}

export interface TimeEntry {
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

type TimeEntryRecord = Record<number, TimeEntry>

export interface UserData {
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

export interface ClientData {
  id: number,
  name: string,
  wid: null | number,
  notes: string,
  at: string
}

export interface ProjectData {
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

export type TogglEvent =
  | 'TimeEntryAdded'
  | 'TimeEntryModified'
  | 'TimeEntryRemoved'