## Installation ##

1. Download the hdafg-website repository
2. Go in the root directory of the downloaded repository
3. Build a docker image with the downloaded Node.js website and save the docker image as a file.
   1. `sudo docker build . -t melvinfocke/hdafg-website:1.2.0`
4. Run the docker image in a docker container (see 'Docker Environment Variables' for more info)



## Different Modes

The hdafg-website can run in two different modes: CONTROLLER or NODE. 

### Controller Mode

The website shows a login page where admins can log in and add, edit and delete events. Admins can also access the 'Legacy Dashboard' to get even more settings to play with. Normal visitors have no access to change any settings and can't really use the website. You need **exactly one** docker container running in 'Controller' mode.

### Node Mode

The website shows the homepage of h.d.a.fg where visitors can register for upcoming events. You need **at least one** docker container running in 'Node' mode.



## Docker - Environment Variables

The required Docker  environment variables depend on the mode of the container.

### Controller Mode

| Name                                  | Default Value             | Valid Values                                             | Description                                                  |
| :------------------------------------ | :------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| TZ                                    | UTC                       | see: time zone code                                      | Specifies the time zone of the server                        |
| MODE                                  | NODE                      | ['NODE', 'CONTROLLER']                                   | Sets the mode in which the container operates.               |
| ALL_CITIES                            | NO-CITY                   | List with city names; items are separated by comma (',') | A list of all specified cities on all containers in Node mode |
| DATABASE                              | mongodb://localhost/hdafg | mongodb://*{host}*/*{dbname}*                            | -                                                            |
| DOMAIN                                | localhost                 | any domain (without https://)                            | -                                                            |
| MAX_FAILED_ADMIN<br />_LOGINS_PER_DAY | 5                         | any positive number                                      | Specifies the maximum amount of invalid logins per IP address per 24 hours |

Example:

`docker run -d --name hdafg-controller --restart always --net vwnet --ip 172.18.0.12 -p 3001:8080 \
 -e TZ=Europe/Berlin \
 -v /hdafg/uploads:/usr/src/app/uploads \
 -e MODE="CONTROLLER" \
 -e ALL_CITIES="Ludwigsfelde,Marburg" \
 -e DATABASE="mongodb://172.18.0.11/hdafg" \
 -e DOMAIN="hdafg.de" melvinfocke/hdafg-website:1.2.0`

### Node Mode

| Name                      | Default Value                                   | Valid Values                                      | Description                                                  |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| TZ                        | UTC                                             | see: time zone code                               | Specifies the time zone of the server                        |
| MODE                      | NODE                                            | ['NODE', 'CONTROLLER']                            | Sets the mode in which the container operates.               |
| CITY                      | NO-CITY                                         | Name of a city                                    | Specifies an event location                                  |
| CONTROLLER_URL            | https://www.hdafg.de                            | any url; see: default value                       | Specifies the controller's url                               |
| DATABASE                  | mongodb://localhost/hdafg                       | mongodb://*{host}*/*{dbname}*                     | -                                                            |
| DOMAIN                    | localhost                                       | any domain (without https://)                     | -                                                            |
| MAIL_HOST                 | smtp.gmail.com                                  | valid domain of a smtp server                     | Necessary information to send mails                          |
| MAIL_PORT                 | 465                                             | valid smtp port                                   | Necessary information to send mails                          |
| MAIL_SECURE_CONNECTION    | true                                            | [true, false]                                     | Necessary information to send mails                          |
| MAIL_USER                 | *{city}*.noreply.hdafg                          | username of mail account                          | Necessary information to send mails                          |
| MAIL_PASSWORD             | -                                               | -                                                 | Necessary information to send mails                          |
| MAIL_TO                   | -                                               | eg:<br /> *{Name1}*:*{Mail1}*,*{Name2}*:*{Mail2}* | Specifies who should get a notification mail after a new registration |
| MAIL_FROM                 | h.d.a.fg *{city*} \<*{city}*-noreply@hdafg.de\> | see: default value                                | Specifies the sender's name in the 'from' field of a mail    |
| MAX_REGISTRATIONS_PER_DAY | 6                                               | any positive number                               | Specifies the maximum amount of registrations per IP address per 24 hours |

Example:

`docker run -d --name hdafg-node-ludwigsfelde --restart always --net vwnet --ip 172.18.0.13 -p 3002:8080 \
 -e TZ=Europe/Berlin \
 -v /hdafg/uploads:/usr/src/app/uploads \
 -e CITY="Ludwigsfelde" \
 -e DATABASE="mongodb://172.18.0.11/hdafg" \
 -e DOMAIN="hauptquartier-ludwigsfel.de" \
 -e MAIL_USER="ludwigsfelde.noreply.hdafg" \
 -e MAIL_PASSWORD="JUST_A_TEST_PASSWORD" \
 -e MAIL_TO="Alice:alice@gmail.com,Bob:bob@gmail.com" melvinfocke/hdafg-website:1.2.0`