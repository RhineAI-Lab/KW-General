# -*- coding: utf8 -*-

import os
import json

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS, cross_origin
from call import chat, chat_stream, chat_stream_full, get_model_list, api_test

app = Flask(__name__)
app.env = 'development'
CORS(app)


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
        response, answer = chat(query, '', model)
        print(response)
        response.choices[0].message.content = 'HAD MOVE TO <CONTENT> COLUMN'
        return jsonify({'code': 0, 'message': 'success', 'type': 'FINISH', 'content': answer, 'response': response})
    except Exception as e:
        return jsonify({'code': 10000, 'message': 'unknown error: \n ' + repr(e), 'type': 'ERROR'})


def make_sse(obj):
    return f"data: {json.dumps(obj)}\n\n"


# Complete
@app.route('/chat/full/stream', methods=['POST'])
def chat_full_stream():
    messages = []
    model = "gpt-3.5-turbo"
    try:
        messages = request.json['task']['messages'] or messages
        model = request.json['task']['model'] or model
    except Exception as e:
        pass

    def generate():
        try:
            yield make_sse({'code': 0, 'message': 'success', 'type': 'START'})
            all_response = ''
            for i, response in enumerate(chat_stream_full(messages, model)):
                print(f'Batch {i}: {response}')
                delta = response.delta
                if 'finish_reason' in response and response['finish_reason'] is not None:
                    print('\n\nAll Response:')
                    print(all_response)
                    yield make_sse({
                        'code': 0,
                        'message': 'success',
                        'type': 'END',
                        'content': all_response,
                        'finish_reason': response['finish_reason']
                    })
                if 'content' in delta:
                    yield make_sse({
                        'code': 0,
                        'message': 'success',
                        'type': 'BODY',
                        'index': i,
                        'content': delta.content
                    })
                    all_response += delta.content
        except Exception as e:
            print(repr(e))
            yield make_sse({
                'code': 10000,
                'message': 'unknown error: \n ' + repr(e),
                'type': 'ERROR',
                'finish_reason': 'error in link server',
            })

    response = Response(generate(), content_type='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    return response


@app.route('/<query>', methods=['GET'])
def chat_easy_get(query):
    model = "gpt-3.5-turbo"

    try:
        print(query)
        response, answer = chat(query, '', model)
        print(response)
        response.choices[0].message.content = 'HAD MOVE TO <CONTENT> COLUMN'
        # return jsonify({'code': 0, 'message': 'success', 'type': 'FINISH', 'content': answer, 'response': response})
        return answer
    except Exception as e:
        return jsonify({'code': 10000, 'message': 'unknown error: \n ' + repr(e), 'type': 'ERROR'})


if __name__ == '__main__':
    get_model_list()
    print('\nInited.\n')
    # api_test()
    # print('\nTest finished.\n')
    print('Start server...')
    port = 26660
    app.run(app.run(debug=False, host='127.0.0.1', port=port, processes=1))
    print('Server started on ' + str(port))

