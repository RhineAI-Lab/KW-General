import hashlib
import traceback
from threading import Thread

import torch
import requests
import json
import datetime
import time
import os

os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'

host = '10.176.40.138'
port = 23496

overall_instruction = "你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n"

# model_name = "/mnt/data122/datasets/LLaMA/llama_13b_112_sft_v1_16bit"
model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction/ckp/bloom-alpaca-ch-10w_500"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_623v1/llama_lora_623v1_epoch3"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_615v1_epoch2"


import pdb
import re
import copy
import warnings
import argparse

from typing import Optional, List, Callable, Tuple
from fastchat.model.model_chatglm import InvalidScoreLogitsProcessor
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS, cross_origin

from vllm import EngineArgs, LLMEngine, SamplingParams


parser = argparse.ArgumentParser()
parser = EngineArgs.add_cli_args(parser)
args = parser.parse_args()

engine_args = EngineArgs.from_cli_args(args)
engine_args.model = model_name
engine_args.dtype = 'float16'
engine_args.tensor_parallel_size = torch.cuda.device_count()
engine_args.tokenizer = model_name if model_name else 'auto'

print('Loading model...')
engine = LLMEngine.from_engine_args(engine_args)
request_id = 0
results = {}
sp = SamplingParams(
    temperature=0.6,
    logprobs=1,
    prompt_logprobs=1,
    max_tokens=1024,
    stop_token_ids=[engine.tokenizer.convert_tokens_to_ids('<end>')],
)


def inference():
    while True:
        request_outputs = engine.step()
        if len(request_outputs) <= 0:
            time.sleep(0.1)
            continue
        # print('Outputs:')
        # print(request_outputs)
        for output in request_outputs:
            rid = output.request_id
            if rid in results:
                results[rid].append(output)


Thread(target=inference).start()


def parse_text(text):
    lines = text.strip().split('\n')
    for i, line in enumerate(lines):
        if '```' in line:
            item = line.split('`')[-1]
            if item:
                lines[i] = f'<pre><code class="{item}">'
            else:
                lines[i] = '</code></pre>'
        else:
            if i > 0:
                line = line.replace('<', '&lt;').replace('>', '&gt;')
                lines[i] = f'<br/>{line}'
    return ''.join(lines)


def parse_base64(base64_string):
    base64_bytes = base64_string.decode('utf-8')
    base64_data = json.loads(base64_bytes)
    res_value = base64_data['res']
    return f'![](data:image/png;base64,{res_value})'


def parse_draw(response):
    pattern = r"<DRAW>(.*?)</DRAW>"
    matches = re.findall(pattern, response)

    for match in matches:
        return match


nonce_used = []


def md5_string(input_string):
    m = hashlib.md5()
    m.update(input_string.encode('utf-8'))
    return m.hexdigest().upper()


def check_authentication(data):
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
        query = messages[len(messages) - 1]['content']
    except Exception as e:
        traceback.print_exc()
        return False, '缺少鉴权参数。'
    try:
        if nonce in nonce_used:
            return False, '该凭证已过期，请重试。'
        if len(nonce) >= 1024:
            nonce_used.pop()
        validity = 120 * 1000
        if time.time() - timestamp > validity:
            return False, '凭证有效期已过，请重试。'

        # 签名 nonce-timestamp-token-query-model-salt
        salt = 'AF9C41B0E60C6B9CD2F84D8BC5B5F2A2'
        original = f'{nonce}-{timestamp}-{token}-{query}-{model_name}-{salt}'
        sign_truth = md5_string(original)
        if sign != sign_truth:
            return False, '签名校验错误。'
        nonce_used.append(nonce)
        return True, '成功。'
    except:
        return False, '未知的鉴权错误。'


def make_history(task):
    try:
        messages = task['messages']
        prompt = ''
        history = []
        query = ''
        now = []
        empty_message = '...'
        for i, line in enumerate(messages):
            role = line['role']
            content = line['content']
            if role == 'system':
                if len(prompt) == 0:
                    prompt = content + '\n'
                    continue
            elif role == 'user':
                if len(now) == 0:
                    now.append(content)
                elif len(now) == 1:
                    now.append(empty_message)
                    history.append(now)
                    now = [content]
            elif role == 'assistant':
                if len(now) == 0:
                    history.append([empty_message, content])
                elif len(now) == 1:
                    now.append(content)
                    history.append(now)
                    now = []
        if len(now) > 0:
            query = now[0]
        if len(prompt) == 0:
            prompt = overall_instruction
        return prompt, history, query
    except:
        return overall_instruction, [], ''


def get_options(task):
    memory_limit = 4
    top_p = 0.9
    top_k = 50
    temperature = 0.5
    if 'options' in task:
        options = task['options']
        if 'memory_limit' in options:
            memory_limit = options['memory_limit']
        if 'top_p' in options:
            top_p = options['top_p']
        if 'top_k' in options:
            top_k = options['top_k']
        if 'temperature' in options:
            temperature = options['temperature']
    return memory_limit, top_p, top_k, temperature


app = Flask(__name__)
app.env = 'development'
CORS(app)


def make_sse(obj):
    return f"data: {json.dumps(obj)}\n\n"


def filter_answer(chat_iter):
    ot = '回答：'
    last = ''
    for i, response in enumerate(chat_iter):
        print(f'Batch {i}: {response}')
        if i == 0:
            continue
        if len(last) < len(ot):
            last += response
            if len(last) >= len(ot):
                if last[:len(ot)] == ot:
                    yield i, last[len(ot):]
                else:
                    yield i, last
        else:
            yield i, response


@app.route('/chat/full/<way>', methods=['POST'])
def chat_full_stream(way='direct'):
    global request_id, listeners

    def general_return(return_data):
        if way != 'stream':
            return jsonify(return_data)
        else:
            return make_sse(return_data)

    data = request.json
    auth_result, auth_info = check_authentication(data)
    if not auth_result:
        return general_return({'code': 10100, 'message': 'Authentication failed: ' + auth_info, 'type': 'ERROR'})

    if 'task' not in data:
        return general_return({'code': 10200, 'message': 'Arg "task" is necessary.', 'type': 'ERROR'})
    task = data['task']

    prompt, history, query = make_history(task)
    if len(query) == 0:
        return general_return({'code': 10200, 'message': 'Task is invalid.', 'type': 'ERROR'})
    memory_limit, top_p, top_k, temperature = get_options(task)
    model_name = task['model']
    if model_name.lower() != 'cutegpt' and model_name.lower() != 'cute-gpt':
        return general_return({'code': 10200, 'message': 'Model is not supported.', 'type': 'ERROR'})

    start_time = time.time()
    request_id += 1
    rid = 'R' + str(request_id)
    results[rid] = []

    prompt = overall_instruction
    for i, (old_query, response) in enumerate(history):
        # 多轮对话需要跟训练时保持一致
        prompt += "问：{}\n答：\n{}\n".format(old_query, response)
    prompt += "问：{}\n答：\n".format(query)
    print(rid, prompt)
    engine.add_request(rid, prompt, sp)

    def generate():
        try:
            yield make_sse({'code': 0, 'message': 'Success.', 'type': 'START'})
            all_response = ''
            ri = 0
            while True:
                result = results[rid]
                if len(result) > ri:
                    output = result[ri].outputs[0]
                    text = output.text.replace("<end>", "").replace("<s>", "").replace("</s>", "").lstrip()
                    yield make_sse({
                        'code': 0,
                        'message': 'Success.',
                        'type': 'BODY',
                        'index': ri,
                        'content': text[len(all_response):]
                    })
                    all_response = text
                    if result[ri].finished:
                        del result[ri]
                        break
                    ri += 1
            print('\n\nAll Response:')
            print(all_response)
            yield make_sse(
                {'code': 0, 'message': 'Success.', 'type': 'END', 'content': all_response, 'finish_reason': 'stop'})
        except Exception as e:
            traceback.print_exc()
            yield make_sse({'code': 10000, 'message': 'Unknown error: \n ' + repr(e) + '.', 'type': 'ERROR'})

    return Response(generate(), content_type='text/event-stream')


@app.route('/test/stream', methods=['POST'])
def stream_test():
    def generate():
        for i in range(5):  # 作为示例，我们只循环5次
            yield f"data: 这是第 {i}/5 条测试消息\n\n"  # 使用 Server-Sent Events (SSE) 格式
            time.sleep(2)  # 每隔2秒发送一次消息

    return Response(generate(), content_type='text/event-stream')


def flask():
    print('Start server...')
    app.run(app.run(debug=False, host=host, port=port, processes=1))


if __name__ == '__main__':
    # chat_local_test()
    flask()
