# This Makefile wraps commands used to setup, test, and run the server.

run: clean install_python_dependencies build_images setup_db
	# Create the example file system
	tar xf data/example_website.tar.xz --overwrite --directory data/
	# Start WebSocket server, restart server if end with error
	bash proxy_image/proxy_monitor.sh & sleep 1
	# Load config.json into database.
	python3 manage.py runscript load_config --traceback
	# Run server.
	sudo python3 manage.py runserver 0.0.0.0:10411

test: clean install_python_dependencies build_image setup_db
	# Run automated tests.
	sudo python3 manage.py test

# Build the Docker images. (Needs to be done each time server is run since
# changes may have been made to the images.)
build_images:
	sudo docker build -t proxy proxy_image
	sudo docker build -t backend_container backend_container_image

# Setup database tables.
setup_db:
	python3 manage.py makemigrations
	python3 manage.py makemigrations website
	python3 manage.py migrate

# Install Django server dependencies
install_python_dependencies:
	sudo -H pip3 install -r `pwd`/requirements.txt

# Clean up environment left by prior server run.
clean:
	# Kill existing server process.
	-ps aux | grep npm | awk '/[ \t]/ {print $2}' | xargs sudo kill -9
	-ps aux | grep manage.py | awk '/[ \t]/ {print $2}' | xargs sudo kill -9
	# Remove lock files.
	-ls | grep '^task_manager_lock_' | xargs rm
	# Delete virtual filesystems.
	-ls / | grep 'study_session' | xargs sudo bash delete_filesystem.bash
	# Destroy Docker containers.
	-sudo docker rm -f `sudo docker ps -q -a`
	# Destroy database migrations.
	rm -rf website/migrations
	# Remove container log file
	rm -f container*.log
	# ps aux | grep bash | awk '/[ \t]/ {print $2}' | xargs sudo kill -9
