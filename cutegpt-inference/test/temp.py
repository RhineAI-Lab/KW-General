import time


print('aaa')
def gen():
    for i in range(5):
        time.sleep(1)
        yield 'a' + str(i)

for a, b in enumerate(gen()):
    print(a, b)


