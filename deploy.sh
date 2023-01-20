#!/bin/bash

rsync -avz --exclude '.env' --exclude 'node_modules' ./ ec2-user@lightsail:/var/www/express-server/
