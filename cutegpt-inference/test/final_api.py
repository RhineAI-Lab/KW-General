import hashlib
import json
import random
import time
import traceback

import requests


timestamp = time.time()
headers = {
  'Content-Type': 'application/json'
}


# MD5摘要
def md5_string(input_string):
    m = hashlib.md5()
    m.update(input_string.encode('utf-8'))
    return m.hexdigest().upper()


# 通信签名 防止篡改及盗用
def make_authentication(data):
    try:
        version = data['authentication']['version']
        if version != 'v1.0.0':
            return False, '鉴权版本不支持，请更新版本。'
        nonce = data['authentication']['nonce']
        token = data['authentication']['token']
        sign = data['authentication']['sign']

        timestamp = data['timestamp']
        model_name = data['task']['model']
        messages = data['task']['messages']
        query = messages[len(messages)-1]['content']
    except Exception as e:
        traceback.print_exc()
        return False, '缺少鉴权参数。'
    try:
        # 签名 nonce-timestamp-token-query-model-salt
        salt = 'AF9C41B0E60C6B9CD2F84D8BC5B5F2A2'
        original = f'{nonce}-{timestamp}-{token}-{query}-{model_name}-{salt}'
        sign_truth = md5_string(original)
        return True, sign_truth
    except:
        return False, '未知的鉴权错误。'


data = {
    "task": {
        "messages": [  # 历史记录 选填
            {'role': 'system', 'content': '你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n'},
            {'role': 'user', 'content': '你好'},
        ],
        "model": "CuteGPT",  # 选填
        "options": {  # 模型推理超参数
            "memory_limit": 4,
            "top_p": 0.9,
            "top_k": 50,
            "temperature": 0.5,
        },
    },
    "authentication": {  # 身份验证 及通信签名
        "version": "v1.0.0",
        "token": "TEMP_TOKEN",
        "nonce": "16位随机码",
        "sign": "签名",
    },
    "version": "v1.0.0",
    "timestamp": timestamp
}


nonce = md5_string('NONCE' + str(random.random()))
data['authentication']['nonce'] = nonce

result, sign = make_authentication(data)
data['authentication']['sign'] = sign

print(json.dumps(data, indent=4))

response = requests.post(
    'http://10.176.40.138:23496/chat/full/direct',
    headers=headers,
    data=json.dumps(data),
)
print(response.json())
