# backend-eppid

Website Backend eppid

# HOW TO RUN

```
$npm install

$node server.js

```

# POSTMAN

```
https://www.getpostman.com/collections/f5cb4995b14214f84b67
```

# DEPLOY TO PROD

## SETUP MYSQL SERVER

1. Install MySQL Server

   ```
   $sudo apt update
   $sudo apt install mysql-server

   ```

2. Konfigurasi MySQL

   ```
   $sudo mysql_secure_installation
   ```

   Akan muncul tampilab sebagai berikut:

   ```

   Output
   Securing the MySQL server deployment.

   Connecting to MySQL using a blank password.

   VALIDATE PASSWORD COMPONENT can be used to test passwords
   and improve security. It checks the strength of password
   and allows the users to set only those passwords which are
   secure enough. Would you like to setup VALIDATE PASSWORD component?

   Press y|Y for Yes, any other key for No: Y

   There are three levels of password validation policy:

   LOW    Length >= 8
   MEDIUM Length >= 8, numeric, mixed case, and special characters
   STRONG Length >= 8, numeric, mixed case, special characters and dictionary                  file

   Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG:
   2
   ```

   Input 2 lalu masukan password root

   ```
   Please set the password for root here.


   New password:

   Re-enter new password:
   ```

   Setelah itu akan muncul tampilan konfirmasi password yang baru saja dibuat lalu input Y

   ```
   Estimated strength of the password: 100
   Do you wish to continue with the password provided?(Press y|Y for Yes, any other key for No) : Y
   ```

3. Membuat MySQL User dan Hak Akses terhadap database

   1. Login ke MySQL shell

      ```
      $mysql -u root -p
      ```

   2. Membuat database dan user

      ```
      CREATE DATABASE db_app;
      CREATE USER 'user_app'@'localhost' IDENTIFIED BY 'rahasia123';
      ```

   3. Memberikan Hak Akses
      ```
      GRANT PRIVILEGE ON db_app TO 'user_app'@'localhost';
      FLUSH PRIVILEGES;
      exit
      ```

4. Perintah MySQL Service

   1. untuk mengetahui status service mysql

      ```
      $sudo systemctl status mysql
      ```

   2. Untuk memulai service

      ```
      $sudo systemctl start mysql
      ```

   3. Untuk menghentikan service

      ```
      $sudo systemctl stop mysql
      ```

   4. Untuk memulai ulang service
      ```
      $sudo systemctl restart mysql
      ```

## INSTALL BACKEND JASAMARGA

1. Install Node.js

   ```
   $cd ~
   $curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
   $sudo bash nodesource_setup.sh
   $sudo apt install nodejs
   $node -v
   $npm -v
   $sudo apt install build-essential
   ```

2. Install dan membuat pm2 sebagai startup service

   ```
   $sudo npm install pm2@latest -g
   $pm2 startup systemd
   ```

3. Clone source code dari github

   ```
   $cd /var/www
   $git clone https://github.com/it-jasamarga/backend-eppid.git
   $cd backend-eppid
   ```

4. Install Package

   ```
   $npm install
   ```

5. Edit file .env sesuaikan settingan

   ```
   $nano .env
   ```

6. Edit file process.yml untuk menentukan berapa jumlah worker dan port, untuk jumlah worker tidak boleh melebihi jumlah CPU.

   ```
   $nano process.yml
   ```

7. Jalankan service applikasi

   ```
   $pm2 start process.yml
   ```

8. Perintah PM2

   1. Melihat daftar worker yang berjalan

      ```
      $pm2 list
      ```

   2. Memulai ulang service

      ```
      $pm2 restart process.yml
      ```

   3. Menghentikan service yang sedang berjalan
      ```
      $pm2 stop process.yml
      ```

## SETUP NGINX SERVER

1. Install NGINX Server

   ```
   $sudo apt update
   $sudo apt install nginx
   ```

2. Setting NGINX sebagai reverse proxy

   1. Buat file konfigurasi dan hapus konfigurasi default
      ```
      $sudo rm -rf /etc/nginx/sites-enabled/default
      $sudo rm -rf /etc/nginx/sites-available/default
      $sudo nano /etc/nginx/sites-available/backend
      ```

   2. Edit file */etc/nginx/sites-available/backend* sebagai berikut, untuk di bagian *loadbalancer* menyesuaikan jumlah workernya yang ada pada settingan di file *process.yml*

      ```
      upstream loadbalancer {
          least_conn;
          server localhost:3500;
          server localhost:3501;
          server localhost:3502;
          server localhost:3503;
      }


      server {
          listen 8080;
          listen [::]:8080;

          index index.html index.htm index.nginx-debian.html;

          server_name _;
          location / {
            proxy_pass http://loadbalancer/;
            proxy_buffering on;
          }
      }
      ```

    3. Buat symbolic link agar file konfigurasi terbaca oleh nginx
        ```
        $sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
        ```

    4. Setting max upload size agar bisa upload file dengan ukuran yang besar
        ```
        $sudo nano /etc/nginx/nginx.conf 
        ```

        tambahkan pada blok http di bagian akhir
        ```
        http {
            ...
            ...
            client_max_body_size 100M;
        }
        ```

    5. Test apakah konfigurasi yang dibuat tidak bermasalah
        ```
        $sudo nginx -t

        nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
        nginx: configuration file /etc/nginx/nginx.conf test is successful
        ```

    6. Selanjutnya dengan merestar NGINX service
        ```
        $sudo systemctl restart nginx
        ```


4. Perintah NGINX Service

   1. untuk mengetahui status service nginx

      ```
      $sudo systemctl status nginx
      ```

   2. Untuk memulai service

      ```
      $sudo systemctl start nginx
      ```

   3. Untuk menghentikan service

      ```
      $sudo systemctl stop nginx
      ```

   4. Untuk memulai ulang service
      ```
      $sudo systemctl restart nginx
      ```