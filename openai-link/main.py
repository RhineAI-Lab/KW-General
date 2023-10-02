#!/usr/local/bin/python3.8
# -*- coding: utf8 -*-

import os
import openai
import json
openai.api_key = "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"

from flask import Flask, request, jsonify, Response, stream_with_context


def get_model_list():
    models= openai.Model.list()
    print(models)

def chat(question, model="gpt-3.5-turbo"):
    response = openai.ChatCompletion.create(
        model=model,
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


app = Flask(__name__)
app.env = 'development'

@app.route('/chat/full/direct', methods=['POST'])
def chat_full_direct():
    history = []
    query = ''
    model = "gpt-3.5-turbo"
    try:
        query = request.json['task']['query'] or query
        history = request.json['task']['history'] or history
        model = request.json['task']['model'] or model
    except Exception as e:
        pass

    try:
        print(query)
        response, answer = chat(query, model)
        print(response)
        response.choices[0].message.content = 'HAD MOVE TO <CONTENT> COLUMN'
        return jsonify({'code': 0, 'message': 'success', 'type': 'FINISH', 'content': answer, 'response': response})
    except Exception as e:
        return jsonify({'code': 10000, 'message': 'unknown error: \n ' + repr(e), 'type': 'ERROR'})


@app.route('/chat', methods=['GET'])
def chat_easy_get():
    query = request.args["q"]
    model = "gpt-3.5-turbo"

    try:
        print(query)
        response, answer = chat(query, model)
        print(response)
        response.choices[0].message.content = 'HAD MOVE TO <CONTENT> COLUMN'
        return jsonify({'code': 0, 'message': 'success', 'type': 'FINISH', 'content': answer, 'response': response})
    except Exception as e:
        return jsonify({'code': 10000, 'message': 'unknown error: \n ' + repr(e), 'type': 'ERROR'})


if __name__ == '__main__':
    get_model_list()
    print('\nInited.\n')
    # api_test()
    # print('\nTest finished.\n')
    print('Start server...')
    app.run(app.run(debug=False, host='127.0.0.1', port=26660, processes=1))



