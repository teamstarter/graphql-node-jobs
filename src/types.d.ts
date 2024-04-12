export type JSONPrimitive = string | number | boolean | null
export type JSONObject = { [member: string]: JSONValue }
export type JSONArray = JSONValue[]
export type JSONValue = JSONPrimitive | JSONObject | JSONArray

export type JobStatus =
  | 'planned'
  | 'queued'
  | 'processing'
  | 'failed'
  | 'sucessful'
  | 'cancelled'

export type JobType = {
  id?: number
  jobUniqueId: string
  type: string
  name: string
  input: JSONValue
  output: JSONValue
  status: JobStatus
  batchId: number
  updatedAt: Date
}
