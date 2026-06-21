data "archive_file" "lambda_function_1" {
  type        = "zip"
  source_dir  = "${path.module}/functions/LambdaFunction1"
  output_path = "${path.module}/build/lambda_function_1.zip"
}

resource "aws_iam_role" "lambda_function_1" {
  name = "lambda_function_1-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_function_1_basic" {
  role       = aws_iam_role.lambda_function_1.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_function_1_sqs" {
  role       = aws_iam_role.lambda_function_1.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

resource "aws_lambda_function" "lambda_function_1" {
  function_name = "lambda_function_1"
  role          = aws_iam_role.lambda_function_1.arn
  runtime       = "nodejs24.x"
  handler       = "index.handler"
  filename      = data.archive_file.lambda_function_1.output_path
  source_code_hash = data.archive_file.lambda_function_1.output_base64sha256
}
