cd mu-monitor-frontend
CALL npm run-script build
cd ..
CALL scp -i mumonitorkey.pem -rp -o StrictHostKeyChecking=no ".\mu-monitor-frontend\build" ec2-user@ec2-18-156-107-188.eu-central-1.compute.amazonaws.com:~/MuMonitor/mu-monitor-frontend/