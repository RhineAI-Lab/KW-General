#!/usr/local/bin/python3.8
# -*- coding: utf8 -*-

import os
import openai
import json

openai.api_key = "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"

def get_model_list():
    models= openai.Model.list()
    print(models)

def chat(question):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": question}
        ]
    )
    answer = response.choices[0].message.content
    return response, answer


def api_test():
    question = '写一篇英语学习建议的小作文'
    print(question)
    response, answer = chat(question)
    print(response, answer)

if __name__ == '__main__':
    get_model_list()
    print('\nStarted.\n')
    api_test()
