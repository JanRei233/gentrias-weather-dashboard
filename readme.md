General Trias Weather & Flood Dashboard

A serverless web application designed to monitor weather updates and visualize flood-prone zones (specifically the Cañas River basin) in General Trias, Cavite.

This project uses an AWS Serverless architecture to minimize costs and automate daily data fetching.

Architecture Overview

Frontend: HTML, CSS, JavaScript (Leaflet.js) hosted on Amazon S3 (Static Website Hosting).

Backend / Data Fetcher: A Python-based AWS Lambda function that fetches weather data and writes a static JSON file to S3.

Automation: Amazon EventBridge triggers the Lambda function daily.

Security: AWS IAM provides the Lambda function with secure, least-privilege access to write to the S3 bucket.

Deployment Guide

1. Set Up the S3 Bucket (Frontend Hosting)

Log in to the AWS Management Console and navigate to S3.

Create a new bucket (e.g., gentrias-weather-dashboard). Uncheck "Block all public access" (you need this for web hosting).

Go to the bucket's Properties tab, scroll to the bottom, and enable Static website hosting (Index document: index.html).

Go to the Permissions tab and edit the Bucket Policy to make the contents publicly readable:

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}


(Optional) Configure CORS in the permissions tab if your frontend is hosted on a different domain than the data bucket.

2. Create the IAM Role for Lambda

Navigate to IAM > Roles > Create role.

Select AWS service -> Lambda.

Attach the AWSLambdaBasicExecutionRole policy (for CloudWatch logging).

Create an inline policy to allow writing to your S3 bucket:

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}


Name the role (e.g., LambdaS3UpdateRole) and save.

3. Deploy the AWS Lambda Backend

Navigate to Lambda > Create function.

Choose Author from scratch, name it FetchGentriasWeather, select Python 3.x as the runtime, and assign the IAM role created in Step 2.

Copy the code from backend/lambda_function.py and paste it into the inline code editor. Click Deploy.

Go to the Configuration tab > Environment variables and add a variable:

Key: BUCKET_NAME

Value: YOUR_BUCKET_NAME

Go to General configuration and increase the Timeout to 10 seconds.

4. Schedule the Updates with EventBridge

In the Lambda designer overview, click Add trigger.

Select EventBridge (CloudWatch Events).

Choose Create a new rule. Name it DailyMorningWeatherFetch.

Select Schedule expression and enter a cron value. For example, to run every day at 6:00 AM PST, use: cron(0 14 * * ? *) (Note: AWS cron uses UTC time).

Click Add.

5. Deploy the Frontend

Open frontend/app.js and verify that WEATHER_DATA_URL and FLOOD_GEOJSON_URL correctly point to where your files will be hosted. If they are in the root of the same S3 bucket, relative paths (./weather.json) work perfectly.

Upload the contents of the frontend/ directory (including the data folder) directly to the root of your S3 bucket.

Manually trigger your Lambda function once (using the "Test" button in the console) to generate the initial weather.json file.

Navigate to your S3 bucket's Static Website Endpoint URL to view your live dashboard!

Local Development

To run the frontend locally for testing:

Clone the repository.

Open a terminal in the frontend/ directory.

Run a local web server (e.g., using Python: python -m http.server 8000).

Visit http://localhost:8000 in your browser. (Note: you will need a sample weather.json in the root folder for local testing if you aren't pulling directly from S3).