# rasp-fire

```
# tested on Bullseye

sudo apt install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

sudo apt update

sudo apt install -y dnsmasq hostapd nodejs git tcpdump

git clone

cd rasp-fire

npm i ws https

mkdir cert; cd cert; openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes -days 100

cd ..

bash ok.sh mod
```
