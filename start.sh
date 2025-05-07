sleep 5
cd /home/user/Downloads/rasp-fire
node f.js 2>&1 > log.txt &
python -m http.server 2>&1 > /dev/null &
