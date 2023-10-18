# -*- coding: utf8 -*-
import random

import openai
import keys


def set_key(model):
    if "gpt-4" in model.lower():
        openai.api_key = random.choice(keys.keys4)
    else:
        openai.api_key = random.choice(keys.keys)


def get_model_list():
    set_key('gpt-4')
    models = openai.Model.list()
    print('Support models:', models)


def chat(user, system='', model='gpt-3.5-turbo'):
    set_key(model)
    messages = [{"role": "user", "content": user}]
    if len(system) > 0:
        messages.insert(0, {"role": "system", "content": system})
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
    )
    answer = response.choices[0].message.content
    return response, answer


def chat_stream(user, system='', model='gpt-3.5-turbo'):
    set_key(model)
    messages = [{"role": "user", "content": user}]
    if len(system) > 0:
        messages.insert(0, {"role": "system", "content": system})
    completion = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in completion:
        yield chunk.choices[0].delta


def chat_stream_full(messages, model='gpt-3.5-turbo'):
    set_key(model)
    print(model, openai.api_key)
    completion = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in completion:
        yield chunk.choices[0]


def api_test():
    question = '写一篇英语学习建议的小作文'
    print(question)
    response, answer = chat(question)
    print(response, answer)

