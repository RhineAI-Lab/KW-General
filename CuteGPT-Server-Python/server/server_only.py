import os
os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'

import torch
import requests
import time

import json
import datetime
import torch.nn as nn
from peft import PeftModel
import pdb
import re
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from flask import Flask, Response, stream_with_context

from transformers import AutoModelWithLMHead, AutoTokenizer, GenerationConfig, AutoModelForCausalLM
from transformers.generation.utils import LogitsProcessorList
from transformers.generation.logits_process import NoBadWordsLogitsProcessor

from transformers import AutoModelWithLMHead, T5Tokenizer, AutoTokenizer, LlamaForCausalLM, LlamaTokenizer

app = Flask(__name__)


@app.route('/chat/full/direct', methods=['POST'])
def chat_full():
    try:
        data = request.json  # 获取JSON数据
        print("Received JSON data:", data)  # 打印接收到的JSON数据

        # 这里可以根据需要处理接收到的数据
        # ...

        # 返回JSON响应
        response_data = {"code": 0, "status": "success", "message": "Data received successfully"}
        return jsonify(response_data)

    except Exception as e:
        print("Error occurred:", e)
        return jsonify({"code": 10000, "status": "error", "message": "An error occurred while processing the data"})


@app.route('/chat/full/stream', methods=['POST'])
def stream():
    def generate():
        for i in range(5):  # 作为示例，我们只循环5次
            yield f"data: 这是第 {i} 条消息\n\n"  # 使用 Server-Sent Events (SSE) 格式
            time.sleep(2)  # 每隔2秒发送一次消息
    return Response(generate(), content_type='text/event-stream')


def flask():
    app.run(app.run(debug=True, host='10.176.40.138', port=23495))
