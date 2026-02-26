docker build -t test_api .
docker run --rm -d -e PORT=8080 -p 8080:8080 --name test_api_container test_api
sleep 5
docker logs test_api_container
docker stop test_api_container
