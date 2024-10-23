SSH_EC2=ssh -i "hello.pem" ec2-user@ec2-13-59-50-220.us-east-2.compute.amazonaws.com
deploy:
	echo "Deploying code to EC2 instance"
	$(SSH_EC2) 'tmux kill-session -t monkey || true'
	zip -r "monkeyminer.zip" ./* -x "monkeyminer.zip"
	scp -r -i "hello.pem"  "monkeyminer.zip" ec2-user@ec2-13-59-50-220.us-east-2.compute.amazonaws.com:/home/ec2-user
	echo "Finished!"
	$(SSH_EC2) 'unzip monkeyminer.zip'
	$(SSH_EC2) 'tmux new-session -d -s monkey "node server.js"'



