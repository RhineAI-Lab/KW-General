#!/bin/sh

# 查找监听在23496端口的Python程序的PID
pid=$(lsof -i :23496 -n | grep "python" | awk '{print $2}' | uniq)

# 如果找到了PID，就结束该进程
if [ ! -z "$pid" ]; then
    kill -9 $pid
    echo "Killed python process with PID $pid on port 23496"
else
    echo "No python process running on port 23496"
fi

# 启动新的Python程序
# 你可以替换下面的命令为你自己的Python程序的启动命令
nohup python /data/heqianyu/ghr_src/sync/deploy/server_easy.py &

echo "Started new python program"

tail -f nohup.out
