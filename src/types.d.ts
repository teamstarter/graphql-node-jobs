export type JSONPrimitive = string | number | boolean | null
export type JSONObject = { [member: string]: JSONValue }
export type JSONArray = JSONValue[]
export type JSONValue = JSONPrimitive | JSONObject | JSONArray

export type JobStatus =
  | 'planned'
  | 'queued'
  | 'processing'
  | 'failed'
  | 'successful'
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

/**
 * Valid status values for a job step
 */
export type JobStepStatus =
  | 'planned'
  | 'waiting'
  | 'processing'
  | 'done'
  | 'error'
  | 'failed'
  | 'skipped'

/**
 * Base structure for debug values
 */
interface JobStepDebugValuesBase {
  percentageOfCompletion?: number
}

/**
 * Debug values structure for progress tracking and debugging
 */
export type JobStepDebugValues<
  TDebugValues extends Record<string, any> = Record<string, any>
> = JobStepDebugValuesBase & TDebugValues

/**
 * Represents a single step in a job's processing pipeline
 */
export interface JobStep<
  TValues extends Record<string, any> = Record<string, any>,
  TDebugValues extends Record<string, any> = Record<string, any>
> {
  name: string
  status: JobStepStatus
  warnings?: string[]
  errors?: string[]
  debugValues?: JobStepDebugValues<TDebugValues>
  values?: TValues
  elapsedTime?: number
  startedAt?: Date
  doneAt?: Date
}

/**
 * Steps can be represented as either an object keyed by step name or an array
 */
export type JobSteps<
  TValues extends Record<string, any> = Record<string, any>,
  TDebugValues extends Record<string, any> = Record<string, any>
> =
  | Record<string, JobStep<TValues, TDebugValues>>
  | JobStep<TValues, TDebugValues>[]

/**
 * Processing information structure passed to updateProcessingInfo
 */
export interface ProcessingInfo<
  TValues extends Record<string, any> = Record<string, any>,
  TDebugValues extends Record<string, any> = Record<string, any>
> {
  steps: JobSteps<TValues, TDebugValues>
}

/**
 * Function signature for updateProcessingInfo callback
 */
export type UpdateProcessingInfo<
  TValues extends Record<string, any> = Record<string, any>,
  TDebugValues extends Record<string, any> = Record<string, any>
> = (info: ProcessingInfo<TValues, TDebugValues>) => Promise<void>

// Legacy type aliases for backwards compatibility
export type StepStatus = JobStepStatus
export type StepType = JobStep
export type StepsType = Record<string, JobStep>
export type ProcessingInfoType = ProcessingInfo
