# -*- coding: utf8 -*-

import os
import json
import openai
import keys

openai.api_key = keys.keys[0]


def chat_stream(question, model="gpt-3.5-turbo"):
    completion = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "user", "content": question}
        ],
        stream=True,
    )
    for chunk in completion:
        yield chunk.choices[0].delta


result = []
for delta in chat_stream("给几个有难度的雅思词汇，列成表格，包含中文和词性"):
    if 'content' in delta:
        if 'role' in delta and (len(result) == 0 or result[-1]['role'] != delta.role):
            result.append({'role': delta.role, 'content': ''})
        if len(result) > 0:
            result[-1]['content'] += delta.content
            print(result[-1]['content'])
            print('\n------------------------------\n')

