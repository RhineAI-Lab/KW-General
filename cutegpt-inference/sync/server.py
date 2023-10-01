import os, torch
import requests

os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'
import json
import datetime
import gradio as gr
import torch.nn as nn
from peft import PeftModel
import pdb
import re
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from transformers import AutoModelWithLMHead, AutoTokenizer, GenerationConfig, AutoModelForCausalLM
from transformers.generation.utils import LogitsProcessorList
from transformers.generation.logits_process import NoBadWordsLogitsProcessor

from transformers import AutoModelWithLMHead, T5Tokenizer, AutoTokenizer, LlamaForCausalLM, LlamaTokenizer

# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction/ckp/bloom-alpaca-ch-10w_500"

overall_instruction = "你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n"

# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_623v1/llama_lora_623v1_epoch3"
# LORA_WEIGHTS = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_lora_615v1_epoch2"
model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
# model_name = "/mnt/data122/datasets/LLaMA/llama_13b_112_sft_v1_16bit"

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


app_fast = FastAPI()
# Define the static directory and route
# app_fast.mount("/static", StaticFiles(directory="/data/dell/qyh/instruction_tuning/evaluation/website"), name="static")

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
# def stream_chat(model, tokenizer, query, history=None, max_length=1024,min_length = 3, num_beams=1, do_sample = True,
#                 top_p=0.95, top_k=50, temperature=0.7, repetition_penalty=1.2, length_penalty = 1.0,  logits_processor=None, **kwargs):
def stream_chat(model, tokenizer, query, history=None, max_length=1024, min_length=3, num_beams=1, do_sample=True,
                top_p=0.9, top_k=50, temperature=0.5, repetition_penalty=1.2, length_penalty=1.0, logits_processor=None,
                **kwargs):
    # generate prompt
    # pdb.set_trace()

    # prompt = overall_instruction
    # for i, (old_query, response) in enumerate(history):
    #     # 多轮对话需要跟训练时保持一致
    #     prompt += "问：{}\n答：{}\n".format(old_query, response)
    # prompt += "问：{}\n答：".format(query)

    prompt = overall_instruction
    for i, (old_query, response) in enumerate(history):
        # 多轮对话需要跟训练时保持一致
        prompt += "问：{}\n答：\n{}\n".format(old_query, response)
    prompt += "问：{}\n答：\n".format(query)

    print('=====================================')
    print(prompt)
    print('=====================================')

    input_ids = tokenizer(prompt, return_tensors="pt", padding=False, truncation=False, add_special_tokens=False)
    input_ids = input_ids["input_ids"].to(device)

    slen = len(input_ids[0])
    print('====input len====')
    print(slen)
    print('====input len====')
    generation_config = GenerationConfig(
        temperature=0.7,
        top_p=0.8,
        top_k=50,
        repetition_penalty=1.1,
        max_new_tokens=512,
    )

    print(generation_config)

    generation_output = model.stream_generate(input_ids=input_ids,
                                              generation_config=generation_config,
                                              return_dict_in_generate=True,
                                              output_scores=True,
                                              # eos_token_id = tokenizer.eos_token_id,
                                              eos_token_id=tokenizer.convert_tokens_to_ids('<end>'),
                                              # eos_token_id = 250680,
                                              pad_token_id=tokenizer.eos_token_id,
                                              min_length=input_ids.shape[1] + 1,
                                              assistant_model=assistant_model
                                              )

    # txt = '一个胸有成竹的男人'
    # response = requests.get('http://10.176.64.114:41504/api/data/getdrawresponse/?prompt=' + txt)
    # pdb.set_trace()
    # parse_base64(response.content)

    display_response = ''
    sd_flag = 0
    for outputs in generation_output:
        # pdb.set_trace()
        # print('===len==')
        # print(len(outputs.tolist()[0]))
        # print('===len==')
        outputs = outputs.tolist()[0][slen:]
        response = tokenizer.decode(outputs)
        response = response.strip()
        # 防止幺蛾子出现，确保不要生成[Round
        response = response.replace('<s>', '    ').replace('</s>', '\n').replace('<end>', '')
        # # 使用正则表达式查找 [ Round] 并匹配 [ 和 Round 中间的空格
        # match1 = re.search(r"\s*\[+\s*Round\s", response)
        # match2 = re.search(r"\s*\[+\s*round\s", response)
        # # 如果找到了 [ Round]
        # if match1:
        #     # 获取 [ Round] 之前的文本
        #     response = response[:match1.start()].strip()
        # # 如果找到了 [ round]
        # if match2:
        #     # 获取 [ round] 之前的文本
        #     response = response[:match2.start()].strip()

        print('==============output=======================')
        print(response)
        print('==============output=======================')
        new_history = history + [(query, response)]
        yield response, new_history


def chat_wrapper(query, styled_history, history, memory_limit=3):
    if memory_limit == 0:
        history = []
        styled_history = []
    elif memory_limit > 0:
        history = history[-memory_limit:]
        styled_history = styled_history[-memory_limit:]
    if styled_history is None: styled_history = []
    if query == '':
        yield styled_history, history, '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []
        return
    query = query.strip()
    styled_history.append(('', ''))
    for resp, newhist in stream_chat(model, tokenizer, query, history, memory_limit=memory_limit):
        # pdb.set_trace()
        styled_history[-1] = (parse_text(query), parse_text(resp))
        yield styled_history, newhist, '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []


def regenerate_wrapper(styled_history, history, memory_limit):
    if not history:
        return [], [], '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                      '__type__': 'update'}, []
    # pdb.set_trace()
    styled_history, history, query, _, _, _ = edit_wrapper(styled_history, history)
    return chat_wrapper(query, styled_history, history, memory_limit)
    # return styled_history, newhist, _, _, _, _


def edit_wrapper(styled_history, history):
    if len(history) == 0:
        return [], [], ''
    query = history[-1][0]
    history = history[:-1]
    styled_history = styled_history[:-1]
    return styled_history, history, query, {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []


'''
All the same
'''


@torch.no_grad()
def normal_chat(model, tokenizer, query, history=None, max_length=1024, min_length=3, num_beams=1, do_sample=True,
                top_p=0.9, top_k=50, temperature=0.5, repetition_penalty=1.2, length_penalty=1.0, logits_processor=None,
                **kwargs):
    # generate prompt
    # pdb.set_trace()

    # prompt = overall_instruction
    # for i, (old_query, response) in enumerate(history):
    #     # 多轮对话需要跟训练时保持一致
    #     prompt += "问：{}\n答：{}\n".format(old_query, response)
    # prompt += "问：{}\n答：".format(query)

    prompt = overall_instruction
    for i, (old_query, response) in enumerate(history):
        # 多轮对话需要跟训练时保持一致
        prompt += "问：{}\n答：\n{}\n".format(old_query, response)
    prompt += "问：{}\n答：\n".format(query)

    print('=====================================')
    print(prompt)
    print('=====================================')

    input_ids = tokenizer(prompt, return_tensors="pt", padding=False, truncation=False, add_special_tokens=False)
    input_ids = input_ids["input_ids"].to(device)

    slen = len(input_ids[0])
    print('====input len====')
    print(slen)
    print('====input len====')
    generation_config = GenerationConfig(
        temperature=0.7,
        top_p=0.8,
        top_k=50,
        repetition_penalty=1.1,
        max_new_tokens=512,
    )

    print(generation_config)

    outputs = model.generate(input_ids=input_ids,
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
    print(response)
    print(new_history)
    yield response, new_history


def normal_chat_wrapper(query, styled_history, history, memory_limit=3):
    print('query:')
    print(query)
    print('styled_history:')
    print(styled_history)
    print('history:')
    print(history)
    print()
    if memory_limit == 0:
        history = []
        styled_history = []
    elif memory_limit > 0:
        history = history[-memory_limit:]
        styled_history = styled_history[-memory_limit:]
    if styled_history is None: styled_history = []
    if query == '':
        yield styled_history, history, '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []
        return
    query = query.strip()
    styled_history.append(('', ''))
    for resp, newhist in normal_chat(model, tokenizer, query, history, memory_limit=memory_limit):
        # 如果normal_chat写得是return这里会只有response？？amazing
        styled_history[-1] = (parse_text(query), parse_text(resp))
        yield styled_history, newhist, '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []


def normal_regenerate_wrapper(styled_history, history, memory_limit):
    if not history:
        return [], [], '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                      '__type__': 'update'}, []
    # pdb.set_trace()
    styled_history, history, query, _, _, _ = normal_edit_wrapper(styled_history, history)
    return normal_chat_wrapper(query, styled_history, history, memory_limit)
    # return styled_history, newhist, _, _, _, _


def normal_edit_wrapper(styled_history, history):
    if len(history) == 0:
        return [], [], ''
    query = history[-1][0]
    history = history[:-1]
    styled_history = styled_history[:-1]
    return styled_history, history, query, {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                                      '__type__': 'update'}, []


'''
All the same
'''


def reset_history():
    return [], [], '', {'visible': False, '__type__': 'update'}, {'value': '', 'label': '', '__type__': 'update'}, []


def update_history(styled_history, history, log, idx):
    if log == '':
        return styled_history, history, {'visible': True, '__type__': 'update'}, {'value': history[idx[0]][idx[1]],
                                                                                  '__type__': 'update'}, idx

    def swap_value(lst, idx, value):
        lst[idx[0]] = tuple(value if j == idx[1] else elem for j, elem in enumerate(lst[idx[0]]))
        return lst

    styled_history = swap_value(styled_history, idx, parse_text(log))
    history = swap_value(history, idx, log)
    return styled_history, history, {'visible': False, '__type__': 'update'}, {'value': '', 'label': '',
                                                                               '__type__': 'update'}, []


def gr_hide():
    return {'visible': False, '__type__': 'update'}, {'value': '', 'label': '', '__type__': 'update'}, []


with gr.Blocks() as demo:
    gr.Markdown('''<h1><center>KW-CuteGPT</center></h1>''')
    gr.Markdown(
        '''KW-CuteGPT是一个13B(130亿)参数的中英文语言模型。该模型具有轻量化训练、小型化部署的特点，同时保留了ChatGPT的主要能力，包括内容生成、开放问答、头脑风暴等等。\n Notice:\n 多轮对话已上线，如果回答质量变差，尝试清空聊天试试:)''')

    state = gr.State([])
    chatbot = gr.Chatbot(elem_id='chatbot', show_label=False)
    with gr.Row(visible=False) as edit_log:
        with gr.Column():
            log = gr.Textbox()
            with gr.Row():
                submit_log = gr.Button('保存')
                cancel_log = gr.Button('取消')
    log_idx = gr.State([])

    message = gr.Textbox(placeholder='请推荐五本中国古典小说，包含其作品名以及作者名，以表格的形式给出')

    with gr.Row():
        submit = gr.Button('提交', variant='primary')
        # regen = gr.Button('重新生成')
        stop = gr.Button('停止生成', variant='Stop')
    # submit = gr.Button('提交')
    delete = gr.Button('清空聊天')

    gr.Markdown('''\n\n''')
    gr.Markdown('''<h3>免责声明</h3>''')
    gr.Markdown(
        '''本项目生成的内容可能受到多种因素的影响，如模型计算、随机性和量化精度损失等，因此我们无法对其准确性作出保证。我们郑重声明，对于使用本项目生成的任何内容所引发的一切后果，本项目概不负责。对于因使用本项目相关资源和输出结果而可能产生的任何损失，本项目不承担任何法律责任。对于基于用户不良诱导得出的不恰当言论，用户自行承担全部责任。''')

    # max_length, top_p, top_k, num_beams, temperature, memory_limit = 1024, 0.75, 40, 0.1, 3,
    # input_list = [message, chatbot, state, max_length, top_p, top_k, num_beams, temperature, memory_limit]
    input_list = [message, chatbot, state]
    output_list = [chatbot, state, message]
    edit_list = [edit_log, log, log_idx]

    genev_message = message.submit(chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    # submit.click(chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    # genev = submit.click(chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    genev = submit.click(chat_wrapper, inputs=input_list, outputs=output_list + edit_list, api_name="submit")
    stop.click(None, None, None, cancels=[genev, genev_message])
    # regen.click(regenerate_wrapper, inputs=input_list[1:], outputs=output_list + edit_list)
    delete.click(reset_history, outputs=output_list + edit_list, api_name="delete")
    edit_kwargs = {'inputs': [chatbot, state, log, log_idx], 'outputs': [chatbot, state] + edit_list}
    log.submit(update_history, **edit_kwargs)
    submit_log.click(update_history, **edit_kwargs)
    cancel_log.click(gr_hide, outputs=edit_list)

with gr.Blocks() as demo_normal:
    gr.Markdown('''<h1><center>KW-CuteGPT</center></h1>''')
    gr.Markdown(
        '''KW-CuteGPT是一个13B(130亿)参数的中英文语言模型。该模型具有轻量化训练、小型化部署的特点，同时保留了ChatGPT的主要能力，包括内容生成、开放问答、头脑风暴等等。\n Notice:\n 1. 多轮对话已上线，如果回答质量变差，尝试清空聊天试试:) 2. 这个界面没有流式生成，需要耐心等待''')

    state = gr.State([])
    chatbot = gr.Chatbot(elem_id='chatbot', show_label=False)
    with gr.Row(visible=False) as edit_log:
        with gr.Column():
            log = gr.Textbox()
            with gr.Row():
                submit_log = gr.Button('保存')
                cancel_log = gr.Button('取消')
    log_idx = gr.State([])

    message = gr.Textbox(placeholder='请推荐五本中国古典小说，包含其作品名以及作者名，以表格的形式给出')

    with gr.Row():
        submit = gr.Button('提交', variant='primary')
        # regen = gr.Button('重新生成')
        stop = gr.Button('停止生成', variant='Stop')
    # submit = gr.Button('提交')
    delete = gr.Button('清空聊天')

    gr.Markdown('''\n\n''')
    gr.Markdown('''<h3>免责声明</h3>''')
    gr.Markdown('''本项目生成的内容可能受到多种因素的影响，如模型计算、随机性和量化精度损失等，因此我们无法对其准确性作出保证。我们郑重声明，对于使用本项目生成的任何内容所引发的一切后果，本项目概不负责。对于因使用本项目相关资源和输出结果而可能产生的任何损失，本项目不承担任何法律责任。对于基于用户不良诱导得出的不恰当言论，用户自行承担全部责任。''')

    # max_length, top_p, top_k, num_beams, temperature, memory_limit = 1024, 0.75, 40, 0.1, 3,
    # input_list = [message, chatbot, state, max_length, top_p, top_k, num_beams, temperature, memory_limit]
    input_list = [message, chatbot, state]
    output_list = [chatbot, state, message]
    edit_list = [edit_log, log, log_idx]

    genev_message = message.submit(normal_chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    # submit.click(chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    # genev = submit.click(chat_wrapper, inputs=input_list, outputs=output_list + edit_list)
    genev = submit.click(normal_chat_wrapper, inputs=input_list, outputs=output_list + edit_list, api_name="submit")
    stop.click(None, None, None, cancels=[genev, genev_message])
    # regen.click(regenerate_wrapper, inputs=input_list[1:], outputs=output_list + edit_list)
    delete.click(reset_history, outputs=output_list + edit_list, api_name="delete")
    edit_kwargs = {'inputs': [chatbot, state, log, log_idx], 'outputs': [chatbot, state] + edit_list}
    log.submit(update_history, **edit_kwargs)
    submit_log.click(update_history, **edit_kwargs)
    cancel_log.click(gr_hide, outputs=edit_list)

# if __name__ == '__main__':
#     demo.queue(concurrency_count=16).launch(debug=False, share=False, server_name='0.0.0.0', server_port=27619)


CUSTOM_PATH = "/ddemos/cutegpt"
CUSTOM_PATH_NORMAL = "/ddemos/cutegpt_normal"
gr.mount_gradio_app(app_fast, demo.queue(concurrency_count=16), CUSTOM_PATH)
gr.mount_gradio_app(app_fast, demo_normal.queue(concurrency_count=16), CUSTOM_PATH_NORMAL)
print('finished')