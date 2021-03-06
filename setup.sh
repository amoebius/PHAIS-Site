#!/bin/bash
# Written for Ubuntu only!

# Install python-dev and pip
sudo apt-get -y install python-dev &&
sudo apt-get -y install python-pip &&

# Install Flask
sudo pip install Flask &&

# Install Flask-Login
sudo pip install flask-login &&

# Install Flask-Sijax
sudo pip install flask-sijax &&

# Install Flask-OpenID
sudo pip install flask-openid &&

# Install MySQLdb
sudo apt-get -y install libmysqlclient-dev &&
sudo pip install MySQL-python &&

echo "Finished successfully."
