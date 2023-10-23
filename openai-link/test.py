# -*- coding: utf8 -*-

import os
import json
from openai import OpenAI
import keys
from call import set_key

client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key=keys.keys4[0],
)


def chat_stream(question, model="gpt-4"):
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "你的名字是AISG"},
            {"role": "user", "content": question},
        ],
        stream=True,
    )
    print(completion)
    for chunk in completion:
        print(chunk)
        yield chunk.choices[0].delta


model = 'gpt-4'
question = '你是GPT-4吗'

result = []
for delta in chat_stream(question, model):
    if 'content' in delta:
        if 'role' in delta and (len(result) == 0 or result[-1]['role'] != delta.role):
            result.append({'role': delta.role, 'content': ''})
        if len(result) > 0:
            result[-1]['content'] += delta.content
            print(result[-1]['content'])
            print('\n------------------------------\n')
