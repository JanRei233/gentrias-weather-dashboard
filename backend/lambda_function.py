import json
import urllib.request
import boto3
import os
from datetime import datetime

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    # Using a public weather API as a placeholder for the PAGASA parser
    # Coordinates for General Trias, Cavite (14.3853, 120.8805)
    api_url = "https://api.open-meteo.com/v1/forecast?latitude=14.3853&longitude=120.8805&current_weather=true"
    
    bucket_name = os.environ.get('BUCKET_NAME', 'gentrias-flood-dashboard')
    file_key = "weather.json"
    
    try:
        req = urllib.request.Request(api_url, headers={'User-Agent': 'AWS-Lambda-Fetcher'})
        with urllib.request.urlopen(req) as response:
            weather_data = json.loads(response.read().decode('utf-8'))
            
        # Add custom timestamp for the frontend
        weather_data['last_updated'] = datetime.now().isoformat()
        
        # Save to S3 Bucket
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=json.dumps(weather_data),
            ContentType='application/json',
            CacheControl='max-age=3600' # Tell browsers to cache for 1 hour
        )
        
        return {
            'statusCode': 200,
            'body': f'Successfully uploaded {file_key} to {bucket_name}'
        }
        
    except Exception as e:
        print(f"Failed to update data: {str(e)}")
        return {
            'statusCode': 500,
            'body': 'Error fetching weather data'
        }