#!/bin/sh

# 查找监听在23496端口的Python程序的PID
pid=$(lsof -i :23496 -n | awk '{print $2}' | uniq)

# 如果找到了PID，就结束该进程
if [ ! -z "$pid" ]; then
    kill -9 $pid
    echo "Killed python process with PID $pid on port 23496"
else
    echo "No python process running on port 23496"
fi

# 启动新的Python程序
nohup python /data/heqianyu/ghr_src/sync/deploy/server_easy.py > server_easy.log 2>&1 &

echo "Started new python program"

tail -f server_easy.log
