# GRAPH RAM USAGE (Pterodactyl VPS)
Create an image with your RAM utilisation in a Pterodactyl VPS in MB. Example :
![](/img/example.png "Example of an image created with the program.")

## How to use it ?
### Step 1 : Install the program 

Go to `Releases` and install the .zip.\
After decompress the .zip, install the dependencies with the command `npm i`.

### Step 2 : Fill the .env file

**URL :**  URL of your vps + "/api/client" (`"https://myvps.com/api/client"`)\
**KEY :** KEY for access to the pterodactyl api, you can create it in your profil in the VPS\
**SERVERID :** ID of the server that you want to monitor in the VPS.\
**COOKIE :** Cookie of your session

*If you have any questions go to the bottom of the page*

### Step 3 : Start the program

Launch the `start.bat` file ! \
The image will be created with an analysis of RAM usage every minute.

## F.A.Q. 

### How to have the cookies ? 

**Step 1 :** Go to your VPS and log in to your account\
**Step 2 :** Press `Ctrl + Shift + I` and go in Network category\
**Step 3 :** Press `Ctrl + R` and click on the first web request\
![](/img/click.png "Click value.")\
**Step 4 :** Locate the second `Set-Cookie` and copy/paste the `pterodactyl_session` value
![](/img/cookie.png "Cookie value.")
