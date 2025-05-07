if [ ! -e default ]; then

	mkdir default

	sudo cp /etc/wpa_supplicant/wpa_supplicant.conf default
	sudo cp /etc/dhcpcd.conf                        default
	sudo cp /etc/network/interfaces                 default
	touch                                           default/hostapd.conf
	sudo cp /etc/default/hostapd                    default
	sudo cp /etc/dnsmasq.conf                       default
	sudo cp /etc/sysctl.conf                        default
	sudo cp /etc/rc.local	                        default

	go=$(echo "$PWD" | sed 's/\//\\\//g')
	sed -i "s/\/home\/user\/Downloads\/rasp-fire/$go/" modified/rc.local
	sed -i "s/\/home\/user\/Downloads\/rasp-fire/$go/" start.sh

	ip=$(ifconfig | grep inet | head -n 1 | awk '{print $2}')
	cat fire.html | sed "s/192\.192\.192\.192/$ip/" > index.html

fi

s=$(netstat -t | grep ':ssh' | grep 'ESTABLISHED' | wc -l)

mod=0
if [ "$#" -eq 1 ]; then
	if [ $1 == "mod" ]; then
		mod=1
	fi
	if [ $1 == "reset" ]; then
		s=0
	fi
fi

f=""
if [ "$mod" -eq 1 ]; then

	sudo systemctl unmask hostapd

	sudo systemctl stop hostapd
	sudo systemctl stop dnsmasq
	sudo systemctl enable hostapd
	sudo systemctl enable dnsmasq

	sudo iptables -F
	sudo iptables -t nat -F

	f="modified"

elif [ "$s" -eq 0 ]; then

	sudo systemctl stop hostapd
	sudo systemctl stop dnsmasq
	sudo systemctl disable hostapd
	sudo systemctl disable dnsmasq

	sudo iptables -F
	sudo iptables -t nat -F

	f="default"

else

	echo "exit"
	exit

fi

sudo cp $f/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
sudo cp $f/dhcpcd.conf         /etc/dhcpcd.conf
sudo cp $f/interfaces          /etc/network/interfaces
sudo cp $f/hostapd.conf        /etc/hostapd/hostapd.conf
sudo cp $f/hostapd             /etc/default/hostapd
sudo cp $f/dnsmasq.conf        /etc/dnsmasq.conf
sudo cp $f/sysctl.conf         /etc/sysctl.conf
sudo cp $f/rc.local            /etc/rc.local

function note {

	echo ''
	ifconfig | grep inet | head -n 1 | awk '{print "go to http://"$2":8000 in chrome and accept certificate and reload"}'

	echo -e 'then connect to wifi (ssid=firenet, pass=password) on device that you want to intercept\n'

}

if [ "$mod" -eq 1 ]; then

	while read -r c; do a=$(echo "$c" | awk '{print "modified/"$0}'); echo -e "\n\n$c"; sudo diff "default/$c" "$a"; done < <(ls default)

	note

	sudo reboot

elif [ "$s" -eq 0 ]; then

	t=$(date +%s)
	netstat -t | grep ':ssh' > $t.txt
	date >> $t.txt

	note

	sudo reboot

fi
