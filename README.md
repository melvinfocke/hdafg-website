## **Why was the hdafg-website created?**

My friend Philipp really enjoys planning and hosting events like parties in his garden at home. After a while he realized that too many people were interested in his events. Philipp asked me if I could program a website for him where people could register for upcoming events with their name and phone number. Then he can decide individually for each registration whether the person is allowed to come to the event or not. 



## **What does the hdafg-website do?**

The hdafg-website allows visitors to register for upcoming events. After registering, my friend Philipp automatically receives an email that a new person has registered. The website also explains what h.d.a.fg means and there is also a link to the h.d.a.fg Instagram account and a contact email address.

But the really cool part of the website is the admin dashboard. Philipp is not really a tech geek and so I would have to manage the events on my own. Each event contains a title, an id, a date, a description and two thumbnails. So if I would have to add, edit, and delete events frequently, it could be very time consuming. But of course this time consuming process can be solved with an easy-to-use admin interface. Philipp just gets an admin account and then he can manage all events on his own.

See the [admin dashboard showcase](https://youtu.be/6lyM5cuu6TI) on YouTube (available in German only) to get an insight.



## **Requirements**

The following software and packages are required to install hdafg-website:

+ apache2 (`sudo apt install -y apache2`)

- git (`sudo apt install -y git`)
- certbot (see: [install certbot](https://www.inmotionhosting.com/support/website/ssl/lets-encrypt-ssl-ubuntu-with-certbot/))
- docker (see: [install docker](https://docs.docker.com/engine/install/ubuntu/))
- docker-compose (see: [install docker-compose](https://docs.docker.com/compose/install/))



## **Installation**

1. `git clone https://github.com/melvinfocke/hdafg-website.git`

2. `cd hdafg-website`

3. `cp docker-compose.yml.example docker-compose.yml`

4. Modify the *docker-compose.yml* file (go to the [Docker-Compose File](#docker-compose-file) section for more info)

5. `sudo docker-compose up`

6. Create a new file at */etc/apache2/sites-available/hdafg.conf* with the following content:

   ```xml
   <VirtualHost *:80>
       ServerName www.hdafg.de
       ServerAlias hdafg.de
       
       LoadModule proxy_module modules/mod_proxy.so
       LoadModule proxy_http_module modules/mod_proxy_http.so
   
       ProxyPass / http://localhost:3001/
       ProxyPassReverse / http://localhost:3001/
   </VirtualHost>
   ```

   > **You need to change the domains mentioned in the file!**

7. `sudo a2ensite hdafg.conf`

8. `sudo systemctl restart apache2`

9. Create an SSL certificate

   1. `sudo certbot --apache -d hdafg.de -d www.hdafg.de` (You need to change the domains)
   2. Enter an email address for renewal and security notices
   3. Agree to the Terms of Service
   4. Specify whether to receive emails from EFF
   5. Choose to redirect HTTP traffic to HTTPS (option 2)

10. Modify the file at */etc/apache2/sites-available/hdafg.conf* and change the content to the following:

   ```xml
   <VirtualHost *:80>
       ServerName www.hdafg.de
       ServerAlias hdafg.de
   
       RewriteEngine on
       RewriteRule ^ https://www.hdafg.de%{REQUEST_URI} [END,NE,R=permanent]
   </VirtualHost>
   ```

   > **You need to change the domains mentioned in the file!**

11. Modify the file at */etc/apache2/sites-available/hdafg-le-ssl.conf* and change the content to the following:

    ```xml
    <IfModule mod_ssl.c>
      <VirtualHost *:443>
        ServerName hdafg.de
    
        RewriteEngine on
        RewriteEngine on
        RewriteCond %{SERVER_NAME} =hdafg.de
        RewriteRule ^ https://www.hdafg.de%{REQUEST_URI} [END,NE,R=permanent]
    
        Include /etc/letsencrypt/options-ssl-apache.conf
        SSLCertificateFile /etc/letsencrypt/live/hdafg.de/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/hdafg.de/privkey.pem
      </VirtualHost>
      <VirtualHost *:443>
        ServerName www.hdafg.de
        LoadModule proxy_module modules/mod_proxy.so
        LoadModule proxy_http_module modules/mod_proxy_http.so
        LoadModule remoteip_module modules/mod_remoteip.so
    
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/?(.*) "ws://localhost:3001/$1" [P,L]
    
        ProxyPass /marburg http://localhost:3003/
        ProxyPassReverse /marburg http://localhost:3003/
    
        ProxyPass /ludwigsfelde http://localhost:3002/
        ProxyPassReverse /ludwigsfelde http://localhost:3002/
    
        ProxyPass / http://localhost:3001/
        ProxyPassReverse / http://localhost:3001/
    
        Header set X-Content-Type-Options "nosniff"
        RemoteIPHeader X-Forwarded-For
    
        Include /etc/letsencrypt/options-ssl-apache.conf
        SSLCertificateFile /etc/letsencrypt/live/www.hdafg.de/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/www.hdafg.de/privkey.pem
      </VirtualHost>
    </IfModule>
    ```

    > **You need to change the domains mentioned in the file!**

12. Now you should be able to view the hdafg-website by surfing to your domain (e.g. hdafg.de) in your web browser.



## **Docker-Compose File**

The *docker-compose.yml* file describes which docker containers are going to be created. By default, there will be created one mongo container, one controller container and two node containers.

After downloading the hdafg-website GitHub repository, you need to rename the *docker-compose.yml.example* file to *docker-compose.yml* and edit the *docker-compose.yml* file. Here is a blueprint of the file with placeholders:



```yaml
version: '3.1'

services:
    mongo:
        image: mongo
        restart: always

    controller:
        build: .
        restart: always
        volumes:
            - <UPLOAD_DIRECTORY>:/usr/src/app/uploads
        environment:
            - TZ=<TIME_ZONE>
            - MODE=CONTROLLER
            - ALL_CITIES=<CITY_1_NAME>{|:|}<CITY_1_DESCRIPTION>{|,|}<CITY_2_NAME>{|:|}<CITY_2_DESCRIPTION>
            - DOMAIN=<DOMAIN>
        ports:
            - 3001:8080
        depends_on:
            - mongo

    node-<CITY_1_NAME>:
        build: .
        restart: always
        volumes:
            - <UPLOAD_DIRECTORY>:/usr/src/app/uploads
        environment:
            - TZ=<TIME_ZONE>
            - CITY=<CITY_1_NAME>
            - DOMAIN=<DOMAIN>
            - MAIL_HOST=<NOREPLY_CITY_1_MAIL_HOST>
            - MAIL_PORT=<NOREPLY_CITY_1_MAIL_PORT>
            - MAIL_SECURE_CONNECTION=<NOREPLY_CITY_1_MAIL_SECURE_CONNECTION>
            - MAIL_USER=<NOREPLY_CITY_1_MAIL_USER>
            - MAIL_PASSWORD=<NOREPLY_CITY_1_MAIL_PASSWORD>
            - MAIL_TO=<MAIL_TO_USER_NAME_1>:<MAIL_TO_EMAIL_ADDRESS_1>,<MAIL_TO_USER_NAME_2>:<MAIL_TO_EMAIL_ADDRESS_2>
            - MAIL_FROM=<NOREPLY_CITY_1_MAIL_FROM>
        ports:
            - 3002:8080
        depends_on:
            - mongo
            - controller

    node-<CITY_2_NAME>:
        build: .
        restart: always
        volumes:
            - <UPLOAD_DIRECTORY>:/usr/src/app/uploads
        environment:
            - TZ=<TIME_ZONE>
            - CITY=<CITY_2_NAME>
            - DOMAIN=<DOMAIN>
            - MAIL_HOST=<NOREPLY_CITY_2_MAIL_HOST>
            - MAIL_PORT=<NOREPLY_CITY_2_MAIL_PORT>
            - MAIL_SECURE_CONNECTION=<NOREPLY_CITY_2_MAIL_SECURE_CONNECTION>
            - MAIL_USER=<NOREPLY_CITY_2_MAIL_USER>
            - MAIL_PASSWORD=<NOREPLY_CITY_2_MAIL_PASSWORD>
            - MAIL_TO=<MAIL_TO_USER_NAME_1>:<MAIL_TO_EMAIL_ADDRESS_1>,<MAIL_TO_USER_NAME_2>:<MAIL_TO_EMAIL_ADDRESS_2>
            - MAIL_FROM=<NOREPLY_CITY_2_MAIL_FROM>
        ports:
            - 3003:8080
        depends_on:
            - mongo
            - controller
```



#### **Placeholders**

| **Placeholder Name**                      | **Description**                                              | Example                                                 |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `<UPLOAD_DIRECTORY>`                      | Specifies the directory on the host where all files should be saved | `/hdafg-uploads`                                        |
| `<TIME_ZONE>`                             | Specifies the time zone (see: [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)) | `Europe/Berlin`                                         |
| `<CITY_1_NAME>`                           | Name of the first city                                       | `Ludwigsfelde`                                          |
| `<CITY_1_DESCRIPTION>`                    | A description of the first city                              | `This is a description.`                                |
| `<CITY_2_NAME>`                           | Name of the second city                                      | `Marburg`                                               |
| `<CITY_2_DESCRIPTION>`                    | A description of the second city                             | `This is a another one.`                                |
| `<DOMAIN>`                                | The domain on which the hdafg-website can be reached         | `hdafg.de`                                              |
| `<NOREPLY_CITY_1_MAIL_HOST>`              | The domain of the smtp mail server. Admins will get a mail if a visitor registers for an upcoming event. | `smtp.gmail.com`                                        |
| `<NOREPLY_CITY_1_MAIL_PORT>`              | The port of the smtp mail server                             | `465`                                                   |
| `<NOREPLY_CITY_1_MAIL_SECURE_CONNECTION>` | Specifies if the connection to the mail server is encrypted  | `true`                                                  |
| `<NOREPLY_CITY_1_MAIL_USER>`              | The username for sending mails                               | `ludwigsfelde.noreply.hdafg`                            |
| `<NOREPLY_CITY_1_MAIL_PASSWORD>`          | The password for sending mails                               | `This_is_a_Password_123`                                |
| `<MAIL_TO_USER_NAME_1>`                   | Name of the user who will get a mail if a visitor registers for an upcoming event. | `Melvin`                                                |
| `<MAIL_TO_EMAIL_ADDRESS_1>`               | Email address of the user who will get a mail if a visitor registers for an upcoming event. | `melvin@gmail.com`                                      |
| `<MAIL_TO_USER_NAME_2>`                   | Name of the user who will get a mail if a visitor registers for an upcoming event. | `Philipp`                                               |
| `<MAIL_TO_EMAIL_ADDRESS_2>`               | Email address of the user who will get a mail if a visitor registers for an upcoming event. | `philipp@gmail.com`                                     |
| `<NOREPLY_CITY_1_MAIL_FROM>`              | Specifies the from name of the email sender                  | `h.d.a.fg Ludwigsfelde <ludwigsfelde-noreply@hdafg.de>` |
| `<NOREPLY_CITY_2_MAIL_HOST>`              | The domain of the smtp mail server. Admins will get a mail if a visitor registers for an upcoming event. | `smtp.gmail.com`                                        |
| `<NOREPLY_CITY_2_MAIL_PORT>`              | The port of the smtp mail server                             | `465`                                                   |
| `<NOREPLY_CITY_2_MAIL_SECURE_CONNECTION>` | Specifies if the connection to the mail server is encrypted  | `true`                                                  |
| `<NOREPLY_CITY_2_MAIL_USER>`              | The username for sending mails                               | `marburg.noreply.hdafg`                                 |
| `<NOREPLY_CITY_2_MAIL_PASSWORD>`          | The password for sending mails                               | `This_is_a_Password_456`                                |
| `<NOREPLY_CITY_2_MAIL_FROM>`              | Specifies the from name of the email sender                  | `h.d.a.fg Marburg <marburg-noreply@hdafg.de>`           |


