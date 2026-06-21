output "standard_topic_arn" {
  description = "ARN of SNS topic standard-topic"
  value       = aws_sns_topic.standard_topic.arn
}

output "fifo_topic_fifo_arn" {
  description = "ARN of SNS topic fifo-topic.fifo"
  value       = aws_sns_topic.fifo_topic_fifo.arn
}
