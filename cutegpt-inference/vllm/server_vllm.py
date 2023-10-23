import hashlib
import traceback
from threading import Thread

import torch
import requests
import json
import datetime
import time
import os
import argparse

os.environ['CUDA_VISIBLE_DEVICES'] = '0,4'

host = '10.176.40.138'
port = 23496

overall_instruction = "你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n"

# model_name = "/mnt/data122/datasets/LLaMA/llama_13b_112_sft_v1_16bit"
model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction/ckp/bloom-alpaca-ch-10w_500"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_623v1/llama_lora_623v1_epoch3"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_615v1_epoch2"

# assistant_model_name = "cutegpt1b3-ift"
assistant_model_name = "/data/heqianyu/big_model/instruction_tuning_github/evaluation/website/cutegpt1b3-ift"


import pdb
import re
import copy
import warnings

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS, cross_origin

# import torch.nn as nn
# from peft import PeftModel

# from typing import Optional, List, Callable, Tuple
# from fastchat.model.model_chatglm import InvalidScoreLogitsProcessor

# from transformers import AutoModelWithLMHead, AutoTokenizer, GenerationConfig, AutoModelForCausalLM, \
#     StoppingCriteriaList, TextStreamer, TextIteratorStreamer
# from transformers.generation.utils import LogitsProcessorList, logger
# from transformers.generation.logits_process import NoBadWordsLogitsProcessor
# from transformers import AutoModelWithLMHead, T5Tokenizer, AutoTokenizer, LlamaForCausalLM, LlamaTokenizer


from vllm import EngineArgs, LLMEngine, SamplingParams

engine = None
device = torch.device("cuda")


def init(args):
    # Parse the CLI argument and initialize the engine.
    engine_args = EngineArgs.from_cli_args(args)
    engine_args.model = assistant_model_name
    engine_args.tokenizer = model_name if model_name else 'auto'
    global engine
    engine = LLMEngine.from_engine_args(engine_args)


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


@torch.no_grad()
def normal_chat(
    query, history=None, prompt=overall_instruction, max_length=1024, min_length=3, num_beams=1,
    do_sample=True, top_p=0.9, top_k=50, temperature=0.5, repetition_penalty=1.2, length_penalty=1.0,
    logits_processor=None, **kwargs
):
    for i, (old_query, response) in enumerate(history):
        # 多轮对话需要跟训练时保持一致
        prompt += f"问：{old_query}\n答：\n{response}\n"
    prompt += f"问：{query}\n答：\n"
    test_prompts = [(prompt, SamplingParams(
        top_p=top_p, top_k=top_k, temperature=temperature,
        max_tokens=max_length, stop='<end>'
    ))]
    print(f'\nPrompt:\n{prompt}')

    request_id = 0
    output_id = 0
    last = ''
    while True:
        # To test continuous batching, we add one request at each step.
        if test_prompts:
            prompt, sampling_params = test_prompts.pop(0)
            engine.add_request(str(request_id), prompt, sampling_params)
            request_id += 1

        request_outputs = engine.step()
        for request_outputs in request_outputs:
            output = request_outputs.outputs[0]
            ln = len(last)
            last = output.text
            # yield last[ln:]
            print(f'\nOutput {output_id}:\n{last}')
            output_id += 1

        if not (engine.has_unfinished_requests() or test_prompts):
            break


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
        query = messages[len(messages)-1]['content']
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


def chat_local_test():
    history = []
    for i in range(999):
        print(f'\n[Round {i}]')
        message = input('In: ')
        # print('Out: ', end='')
        chat_iter = normal_chat(message, history, memory_limit=4)
        print('\nGenerate Finished.\n')
        continue
        for j, resp in filter_answer(chat_iter):
            print('Box', j)
            print(resp)


app = Flask(__name__)
app.env = 'development'
CORS(app)

def make_sse(obj):
    return f"data: {json.dumps(obj)}\n\n"


def filter_answer(chat_iter):
    ot = '回答：'
    last = ''
    for i, response in enumerate(chat_iter):
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
    chat_iter = normal_chat(
        query,
        history,
        prompt=prompt,
        memory_limit=memory_limit,
        top_k=top_k,
        top_p=top_p,
        temperature=temperature,
    )

    if way != 'stream':
        try:
            print('Query:', query)
            all_response = ''
            for i, response in filter_answer(chat_iter):
                # print(f'Batch {i}: {response}')
                if i == 0:
                    continue
                all_response += response
            all_response = all_response.replace("<end>", "").replace("<s>", "").replace("</s>", "")
            print('\n\nAll Response:')
            print(all_response)
            return jsonify({'code': 0, 'message': 'Success.', 'type': 'FINISHED', 'content': all_response})
        except Exception as e:
            return jsonify({'code': 10000, 'message': 'Unknown error: \n ' + repr(e) + '.', 'type': 'ERROR'})

    def generate():
        try:
            yield make_sse({'code': 0, 'message': 'Success.', 'type': 'START'})
            all_response = ''
            for i, response in filter_answer(chat_iter):
                yield make_sse({
                    'code': 0,
                    'message': 'Success.',
                    'type': 'BODY',
                    'index': i,
                    'content': response
                })
                all_response += response
            all_response = all_response.replace("<end>", "").replace("<s>", "").replace("</s>", "")
            print('\n\nAll Response:')
            print(all_response)
            yield make_sse({'code': 0, 'message': 'Success.', 'type': 'END', 'content': all_response, 'finish_reason': 'stop'})
        except Exception as e:
            print(repr(e))
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
    parser = argparse.ArgumentParser()
    parser = EngineArgs.add_cli_args(parser)
    args = parser.parse_args()
    init(args)
    # flask()
    chat_local_test()
