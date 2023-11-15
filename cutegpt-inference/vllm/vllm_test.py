import os
os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'

import torch
from vllm import LLM, SamplingParams
print(torch.cuda.device_count())

model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
assistant_model_name = "/data/heqianyu/big_model/instruction_tuning_github/evaluation/website/cutegpt1b3-ift"
# model_name = None
# assistant_model_name = 'opt-350m'

prompts = [
    "你是复旦大学知识工场实验室训练出来的语言模型CuteGPT。给定任务描述，请给出对应请求的回答。\n问：你是谁\n答：",
]
sampling_params = SamplingParams(temperature=1.0, top_p=0.8, top_k=50, max_tokens=1024, presence_penalty=1.1)
llm = LLM(model=model_name, dtype='float16', tensor_parallel_size=torch.cuda.device_count())
# llm = LLM(model=assistant_model_name, tokenizer=model_name, dtype='float16')

outputs = llm.generate(prompts, sampling_params)
# Print the outputs.
for output in outputs:
    prompt = output.prompt
    generated_text = output.outputs[0].text
    print(f"\nPrompt: {prompt!r}\n\nGenerated text: {generated_text!r}")
