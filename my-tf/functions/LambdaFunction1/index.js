exports.handler = async (event) => {
  for (const record of event.Records) {
    console.log("SQS message received by LambdaFunction1:", record.body)
  }

  return {
    batchItemFailures: [],
  }
}
