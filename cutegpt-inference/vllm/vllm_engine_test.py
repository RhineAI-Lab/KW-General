import argparse
from vllm import EngineArgs, LLMEngine, SamplingParams

model_name = "/data/heqianyu/big_model/instruction_tuning_github/ckp/llama_13b_112_sft_v1"
assistant_model_name = "/data/heqianyu/big_model/instruction_tuning_github/evaluation/website/cutegpt1b3-ift"


def main(args: argparse.Namespace):
    # Parse the CLI argument and initialize the engine.
    engine_args = EngineArgs.from_cli_args(args)
    engine_args.model = assistant_model_name
    engine_args.tokenizer = model_name if model_name else 'auto'

    engine = LLMEngine.from_engine_args(engine_args)

    # Test the following prompts.
    test_prompts = [
        ("A robot may not injure a human being", SamplingParams(
            temperature=0.6,
            logprobs=1,
            prompt_logprobs=1,
            max_tokens=1024
        )),
    ]

    # Run the engine by calling `engine.step()` manually.
    request_id = 0
    output_id = 0
    while True:
        # To test continuous batching, we add one request at each step.
        if test_prompts:
            prompt, sampling_params = test_prompts.pop(0)
            engine.add_request(str(request_id), prompt, sampling_params)
            request_id += 1

        request_outputs = engine.step()
        for request_outputs in request_outputs:
            output = request_outputs.outputs[0]
            print(f'\nBatch {output_id}:')
            print(output.text)
            output_id += 1

        if not (engine.has_unfinished_requests() or test_prompts):
            break


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser = EngineArgs.add_cli_args(parser)
    args = parser.parse_args()
    main(args)
