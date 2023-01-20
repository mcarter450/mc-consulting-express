#!/bin/bash

rsync -avz --exclude-from='exclude-list.txt' ./ ec2-user@lightsail:/var/www/express-server/
