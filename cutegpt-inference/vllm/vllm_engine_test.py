import argparse

import torch.cuda
from vllm import EngineArgs, LLMEngine, SamplingParams

import os
os.environ['CUDA_VISIBLE_DEVICES'] = '3,5'

model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
# assistant_model_name = "/data/heqianyu/big_model/instruction_tuning_github/evaluation/website/cutegpt1b3-ift"


def main(args: argparse.Namespace):
    # Parse the CLI argument and initialize the engine.
    engine_args = EngineArgs.from_cli_args(args)
    engine_args.model = model_name
    engine_args.dtype = 'float16'
    engine_args.tensor_parallel_size = torch.cuda.device_count()
    engine_args.tokenizer = model_name if model_name else 'auto'

    engine = LLMEngine.from_engine_args(engine_args)
    print([engine.tokenizer.convert_tokens_to_ids('<end>')])

    # Test the following prompts.
    sp = SamplingParams(
        temperature=0.6,
        logprobs=1,
        prompt_logprobs=1,
        max_tokens=1024,
        stop_token_ids=[engine.tokenizer.convert_tokens_to_ids('<end>')],
    )

    # Run the engine by calling `engine.step()` manually.
    request_id = 0
    while True:
        output_id = 0
        query = input('Enter question: ')
        prompt = "问：{}\n答：\n".format(query)
        engine.add_request(str(request_id), prompt, sp)
        request_id += 1

        while True:
            request_outputs = engine.step()
            print('Outputs:')
            print(request_outputs)
            if len(request_outputs) <= 0:
                break
            end = False
            for request_outputs in request_outputs:
                output = request_outputs.outputs[0]
                print(f'\nBatch {output_id}:')
                text = output.text
                print(text)
                output_id += 1
                if request_outputs.finished:
                    end = True
            if end:
                break


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser = EngineArgs.add_cli_args(parser)
    args = parser.parse_args()
    main(args)
