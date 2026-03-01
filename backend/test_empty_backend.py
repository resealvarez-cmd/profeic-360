import asyncio
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

response = client.post('/acompanamiento/executive-report', json={'author_id': '71fb5d45-0829-4e92-b8e3-73eda482c8d0', 'department': 'BOGUS'})
print('Status Code:', response.status_code)
if response.status_code != 200:
    print('ERROR:', response.json())
else:
    print('Success Keys:', response.json().keys())
    print('Metrics:', response.json().get('metrics'))
