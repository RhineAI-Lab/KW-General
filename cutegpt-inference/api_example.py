import requests
import json


def event_stream(response):
    for line in response.iter_lines():
        if line:
            yield line.decode('utf-8')


cutegpt_baseurl = 'http://10.176.40.138:23496'
openai_baseurl = 'http://rhine.ai'

easy_query = '翻译beguile'
full_query = json.dumps({
    "task": {
        "query": "翻译成中文",
        "history": [[
            "你好",
            "你好！很高兴见到你。我是复旦大学知识工场实验室训练出来的语言模型CuteGPT。请问有什么问题需要我帮忙解答吗？"
        ], [
            "用英语写一篇英语学习方法的作文",
            "Response:Certainly! Here is a sample paper on English learning methods that you can use as a reference: \nIntroduction:English has become an essential language in today's world, and it is important for individuals to learn the language effectively. However, there are many different approaches to learning English, and some methods may be more effective than others. In this paper, we will explore various methods of English learning and discuss their advantages and disadvantages. \nMethod 1: Traditional Classroom Learning.\nTraditional classroom learning involves attending classes at a school or university where students receive instruction from teachers. This method has been used for centuries and is still widely used today. The advantages of traditional classroom learning include structure, organization, and access to resources ..."
        ]]
    }
})


def cutegpt_easy(query):
    url = cutegpt_baseurl + "/chat/" + query
    response = requests.request("GET", url, headers={}, data={})
    print(response.text)


def cutegpt_easy_stream(query):
    url = cutegpt_baseurl + "http://10.176.40.138:23496/chat/stream/" + query
    response = requests.get(url, stream=True)
    for event in event_stream(response):
        print(event)


def cutegpt_full():
    url = cutegpt_baseurl + "/chat/full/direct"
    payload = json.dumps({
        "task": {
            "query": "翻译成中文",
            "history": [[
                "你好",
                "你好！很高兴见到你。我是复旦大学知识工场实验室训练出来的语言模型CuteGPT。请问有什么问题需要我帮忙解答吗？"
            ], [
                "用英语写一篇英语学习方法的作文",
                "Response:Certainly! Here is a sample paper on English learning methods that you can use as a reference: \nIntroduction:English has become an essential language in today's world, and it is important for individuals to learn the language effectively. However, there are many different approaches to learning English, and some methods may be more effective than others. In this paper, we will explore various methods of English learning and discuss their advantages and disadvantages. \nMethod 1: Traditional Classroom Learning.\nTraditional classroom learning involves attending classes at a school or university where students receive instruction from teachers. This method has been used for centuries and is still widely used today. The advantages of traditional classroom learning include structure, organization, and access to resources ..."
            ]]
        }
    })
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    result = response.json()
    print(result + '\n')
    print(result['content'])


def cutegpt_full_stream(full_query):
    url = cutegpt_baseurl + "/chat/full/stream"
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=full_query, stream=True)
    for event in event_stream(response):
        print(event)


def openai_full_direct(query):
    url = openai_baseurl + "/chat/full/direct"
    payload = json.dumps({
        "task": {
            "query": query,
            "model": "gpt-3.5-turbo",
        }
    })
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    result = response.json()
    print(result + '\n')
    print(result['content'])


def openai_easy(query):
    url = openai_baseurl + '/' + query
    response = requests.request("GET", url, headers={}, data={})
    print(response.text)


if __name__ == "__main__":
    # cutegpt_easy_stream('写首诗')
    # cutegpt_full_stream(full_query)
    openai_easy(easy_query)

'''
参数结构说明（当前支持不完整）
'''
request_body = {
    "task": {
        "query": "请求问题信息",
        "messages": [  # 历史记录 选填
            {'role': 'system', 'content': '你是复旦大学知识工厂训练出的CuteGPT模型'},
            {'role': 'user', 'content': '你好'},
        ],

        "model": "指定模型",  # 选填
        "options": {  # 模型推理超参数
            "memoryLimit": 4,
            "top_p": 0.9,
            "top_k": 50,
            "temperature": 0.5,
        },
    },
    "authentication": {  # 身份验证 及通信签名
        "token": "登录凭证",
        "nonce": "16位随机码",
        "sign": "签名",
    },
    "version": "1.0.0",
    "timestamp": 166666666
}

response_body = {
    'code': 0,
    'message': 'success',
    'type': 'BODY',  # SSE流中说明类型

    "authentication": {
        "nonce": "16位随机码",
        "sign": "签名",
        "version": "1.0.0"
    },

    "task": {
        "index": 0,
        "content": "当前文本",
        "inferenceTime": 1800,  # 推理耗时

        "model": "模型",
        "options": {  # 模型推理超参数
            "memoryLimit": 4,
            "top_p": 0.9,
            "top_k": 50,
            "temperature": 0.5,
        },
    },
    "version": "1.0.0",
    "timestamp": 1666666666
}
