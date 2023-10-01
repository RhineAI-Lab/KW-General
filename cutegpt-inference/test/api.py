import requests
import pdb

# url = 'http://10.176.40.138:23489/ddemos/cutegpt_normal'
url = 'http://10.176.40.138:23490/ddemos/cutegpt_normal'


def clean_dialogue_cache():
    # 清空历史对话，开启新的对话
    requests.post(url + "/run/delete", json={
        "data": []
    }).json()


def get_ans(query):
    # 根据历史对话，cutegpt得到答案
    response = requests.post(url + "/run/submit", json={
        "data": [
            query,
            [],
            None,
        ]
    }).json()
    return response["data"][0][0][1]


def print_histories(histories):
    rnd = 0
    for query, ans in histories:
        print(f'[Round {rnd}]')
        print('Human:', query)
        print('CuteGPT:', ans)
        rnd += 1
    print()


queries = [['你好'], ['请推荐五本中国古典小说，包含其作品名以及作者名，以表格的形式给出','再在表格中加一列作品的时间呢？']]

for multi_round_dialogues in queries:
    clean_dialogue_cache()
    histories = []
    for each_query in multi_round_dialogues:
        print('=================')
        print('Your instruction:', each_query)
        each_ans = get_ans(each_query)
        histories.append((each_query, each_ans))
        print_histories(histories)
