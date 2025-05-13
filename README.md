### Intercept DNS traffic and monitor/block/allow any ip/domain with Raspberry PI

https://github.com/user-attachments/assets/23d212d8-a76e-40f3-a7fb-ea93fd1d0717

```
# tested on Bullseye

sudo apt install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

sudo apt update

sudo apt install -y dnsmasq hostapd nodejs git tcpdump

git clone https://github.com/serkankazak/rasp-fire.git

cd rasp-fire

npm i ws https

mkdir cert; cd cert; openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -nodes -days 100

cd ..

bash ok.sh mod
```

https://www.youtube.com/watch?v=00yRUxAuwiw

[![demo](http://img.youtube.com/vi/00yRUxAuwiw/0.jpg)](http://www.youtube.com/watch?v=00yRUxAuwiw "demo")
