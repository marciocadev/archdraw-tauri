resource "aws_lambda_event_source_mapping" "sqs_queue_1_to_lambda_function_1_1" {
  event_source_arn = aws_sqs_queue.sqs_queue_1.arn
  function_name    = aws_lambda_function.lambda_function_1.arn
  batch_size       = 10
}
