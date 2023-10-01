import torch
import requests
import json
import datetime
import time
import os

import pdb
import re
from flask import Flask, request, jsonify, Response, stream_with_context


os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'

host = '10.176.40.138'
port = 23496

overall_instruction = "你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n"

# model_name = "/mnt/data122/datasets/LLaMA/llama_13b_112_sft_v1_16bit"
model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction/ckp/bloom-alpaca-ch-10w_500"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_623v1/llama_lora_623v1_epoch3"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_615v1_epoch2"


import torch.nn as nn
from peft import PeftModel

from transformers import AutoModelWithLMHead, AutoTokenizer, GenerationConfig, AutoModelForCausalLM
from transformers.generation.utils import LogitsProcessorList
from transformers.generation.logits_process import NoBadWordsLogitsProcessor
from transformers import AutoModelWithLMHead, T5Tokenizer, AutoTokenizer, LlamaForCausalLM, LlamaTokenizer



tokenizer = LlamaTokenizer.from_pretrained(model_name)
print(tokenizer.additional_special_tokens)
model = LlamaForCausalLM.from_pretrained(
    model_name,
    # load_in_8bit=True,
    torch_dtype=torch.float16,
    # device_map={"": device},
    device_map="auto",
)

# assistant_model_name = "cutegpt1b3-ift"
assistant_model_name = "/data/heqianyu/big_model/instruction_tuning_github/evaluation/website/cutegpt1b3-ift"
assistant_model = AutoModelForCausalLM.from_pretrained(
    assistant_model_name,
    torch_dtype=torch.float16,
    device_map="auto",
)
model.eval()
assistant_model.eval()
device = torch.device("cuda")
# pdb.set_trace()


from stream_assistant_generate import stream_patch_model

stream_patch_model(model)


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
def normal_chat(model, tokenizer, query, history=None, max_length=1024, min_length=3, num_beams=1, do_sample=True,
                top_p=0.9, top_k=50, temperature=0.5, repetition_penalty=1.2, length_penalty=1.0, logits_processor=None,
                **kwargs):
    prompt = overall_instruction
    for i, (old_query, response) in enumerate(history):
        # 多轮对话需要跟训练时保持一致
        prompt += "问：{}\n答：\n{}\n".format(old_query, response)
    prompt += "问：{}\n答：\n".format(query)

    input_ids = tokenizer(prompt, return_tensors="pt", padding=False, truncation=False, add_special_tokens=False)
    input_ids = input_ids["input_ids"].to(device)

    slen = len(input_ids[0])
    generation_config = GenerationConfig(
        temperature=0.7,
        top_p=0.8,
        top_k=50,
        repetition_penalty=1.1,
        max_new_tokens=512,
    )

    outputs = model.generate(
        input_ids=input_ids,
        generation_config=generation_config,
        return_dict_in_generate=True,
        output_scores=True,
        # eos_token_id = tokenizer.eos_token_id,
        eos_token_id=tokenizer.convert_tokens_to_ids('<end>'),
        # eos_token_id = 250680,
        pad_token_id=tokenizer.eos_token_id,
        min_length=input_ids.shape[1] + 1,
        assistant_model=assistant_model
        # logits_processor=logits_processor
    )

    s = outputs.sequences[0][input_ids.shape[1]:]
    # pdb.set_trace()
    response = tokenizer.decode(s)
    # pdb.set_trace()
    response = response.strip()
    response = response.replace("<end>", "").replace("<s>", "").replace("</s>", "")
    new_history = history + [(query, response)]
    yield response, new_history


def normal_chat_wrapper(query, styled_history, history, memory_limit=3):
    if memory_limit == 0:
        history = []
        styled_history = []
    elif memory_limit > 0:
        history = history[-memory_limit:]
        styled_history = styled_history[-memory_limit:]
    if styled_history is None:
        styled_history = []
    if query == '':
        yield styled_history, history
        return
    query = query.strip()
    styled_history.append(('', ''))
    for resp, newhist in normal_chat(model, tokenizer, query, history, memory_limit=memory_limit):
        # 如果normal_chat写得是return这里会只有response？？amazing
        styled_history[-1] = (parse_text(query), parse_text(resp))
        yield styled_history, newhist


def test():
    history = []
    for i in range(999):
        print(f'\n[Round {i}]')
        message = input('In: ')
        print('Out: ', end='')
        for j, (resp, new_history) in enumerate(normal_chat(model, tokenizer, message, history, memory_limit=4)):
            history = new_history
            print('Box', j)
            print(resp, new_history)


app = Flask(__name__)
app.env = 'development'


def make_sse(obj):
    return f"data: {json.dumps(obj)}\n\n"


@app.route('/chat/full/stream', methods=['POST'])
def chat_full_stream():
    history = []
    query = ''
    try:
        query = request.json['task']['query']
        history = request.json['task']['history']
    except:
        pass

    def generate():
        try:
            yield make_sse({'code': 0, 'message': 'success', 'type': 'START'})
            for i, (response, new_history) in enumerate(normal_chat(model, tokenizer, query, history, memory_limit=4)):
                print(f'Box {i}:')
                print(response)
                yield make_sse({
                    'code': 0,
                    'message': 'success',
                    'type': 'BODY',

                    'index': i,
                    'content': response
                })
            yield make_sse({'code': 0, 'message': 'success', 'type': 'END'})
        except Exception as e:
            print(repr(e))
            yield make_sse({
                'code': 10000,
                'message': 'unknown error: \n ' + repr(e),
                'type': 'ERROR',
            })

    return Response(generate(), content_type='text/event-stream')


@app.route('/test/stream', methods=['POST'])
def test_stream():
    def generate():
        for i in range(5):  # 作为示例，我们只循环5次
            yield f"data: 这是第 {i} 条测试消息\n\n"  # 使用 Server-Sent Events (SSE) 格式
            time.sleep(2)  # 每隔2秒发送一次消息
    return Response(generate(), content_type='text/event-stream')


def flask():
    print('Start server...')
    app.run(app.run(debug=False, host=host, port=port, processes=1))


if __name__ == '__main__':
    flask()
