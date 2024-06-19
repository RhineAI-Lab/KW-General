# -*- coding: utf8 -*-
import random

import openai
import keys


def set_key(model):
    openai.base_url = keys.base_url
    if "gpt-4" in model.lower():
        openai.api_key = random.choice(keys.keys4)
    else:
        openai.api_key = random.choice(keys.keys)


def get_model_list():
    set_key('gpt-4')
    models = openai.Model.list()
    print('Support models:', models)


def chat(user, system='', model='gpt-3.5-turbo'):
    # set_key(model)
    # messages = [{"role": "user", "content": user}]
    # if len(system) > 0:
    #     messages.insert(0, {"role": "system", "content": system})
    # response = openai.ChatCompletion.create(
    #     model=model,
    #     messages=messages,
    # )
    # answer = response.choices[0].message.content
    # return response, answer
    return 'error', 'error'


def chat_stream(user, system='', model='gpt-3.5-turbo'):
    client = openai.OpenAI(
        api_key=keys.keys4[-1],
        base_url=keys.base_url,
        timeout=120,
    )
    messages = [{'role': 'system', 'content': system},
                {'role': 'user', 'content': user}]
    try:
        stream = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            # model="gpt-3.5-turbo",
            messages=messages,
            stream=True,
            timeout=120,
            top_p=0.2,
            temperature=0.2,
        )
        for chunk in stream:
            if len(chunk.choices) > 0 and chunk.choices[0].delta.content is not None:
                yield chunk.choices[0]
    except Exception as e:
        print(e)
    client.close()


def chat_stream_full(messages, model='gpt-3.5-turbo'):
    client = openai.OpenAI(
        api_key=keys.keys4[-1],
        base_url=keys.base_url,
        timeout=120,
    )
    try:
        stream = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            # model="gpt-3.5-turbo",
            messages=messages,
            stream=True,
            timeout=120,
            top_p=0.2,
            temperature=0.2,
        )
        for chunk in stream:
            if len(chunk.choices) > 0 and chunk.choices[0].delta.content is not None:
                yield chunk.choices[0]
    except Exception as e:
        print(e)
    client.close()


def api_test():
    question = '写一篇英语学习建议的小作文'
    print(question)
    response, answer = chat(question)
    print(response, answer)
    
    
if __name__ == '__main__':
    for word in chat_stream('hello', '', model='gpt-4'):
        print(word)

