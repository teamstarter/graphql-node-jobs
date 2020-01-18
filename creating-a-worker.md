# Creating a worker

## The easy way

GNJ provides a few functions to ease the coding of workers. 

{% code title="worker.ts/js" %}
```javascript
const job = await checkForJobs({
  typeList: ['myJobType'],
  uri,
  processingFunction: async (job) => {
    const result = await myApiCall()
    return myProcessingFunction(result)
  }
})
```
{% endcode %}

* **typeList** \(_Array&lt;String&gt;_\) is the type of jobs the worker will wait to execute.
* **uri** \(_String_\) is the URL of your GraphQL endpoint.
* **processingFunction** \(_Function\(job, facilities_\) =&gt; Promise&lt;_JsonObject&gt;_\) is the function that executes the job.
* workerId = undefined
* looping = true
* loopTime = 1000

When processingFunction return something, the job is considered as done. The returned Object is serialized and stored as the "output" of the job.

#### Easy debug without looping

With the looping option to **false** the worker will only check for a job once. Made for end-to-end tests or manual debugging.

{% code title="worker.ts/js" %}
```javascript
const job = await checkForJobs({
  ...,
  processingFunction: ...,
  looping: false
})
```
{% endcode %}

### Facilities

#### updateProcessingInfo

{% code title="worker.ts/js" %}
```javascript
const job = await checkForJobs({
  typeList: ['myJobType'],
  uri,
  processingFunction: async (job, { updateProcessingInfo }) => {
    await updateProcessingInfo({ percent: 10 })
  },
  looping: false
})
```
{% endcode %}

### Avoiding spamming your API

Some jobs runs very rarely, so you may want that your worker only check the queue from time to time.

{% code title="worker.ts/js" %}
```javascript
const job = await checkForJobs({
  ...,
  processingFunction: ...,
  loopTime: 60 * 1000 // Every minute
})
```
{% endcode %}

### Identifying workers

GNJ automatically generated uuid for your new workers to easily track what went wrong. But if you need to link a run to an id your want you can just specify it under the **workerId** property**.**

{% code title="worker.ts/js" %}
```javascript
const job = await checkForJobs({
  ...,
  processingFunction: ...,
  workerId: 'manualCallPreMigration'
})
```
{% endcode %}

They all use the GraphQL api provided by the server. So even if it's really convenient to use those functions you can create your own.

