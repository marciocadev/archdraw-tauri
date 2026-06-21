output "sqs_queue_1_arn" {
  description = "ARN of SQS queue queue-1"
  value       = aws_sqs_queue.sqs_queue_1.arn
}

output "lambda_function_1_arn" {
  description = "ARN of Lambda function function-1"
  value       = aws_lambda_function.lambda_function_1.arn
}
