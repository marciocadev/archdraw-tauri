resource "aws_sns_topic" "standard_topic" {
  name = "standard-topic"
}

resource "aws_sns_topic" "fifo_topic_fifo" {
  name = "fifo-topic.fifo"
  fifo_topic = true
}
