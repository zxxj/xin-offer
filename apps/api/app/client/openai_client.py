from collections.abc import Generator
from openai import OpenAI
from app.core.config import settings


# 统一异常.
class OpenAIInvokeError(Exception):
    pass


# 检查环境文件中name,model,baseurl是否全部存在.
settings.validate_openai_config()

client = OpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
)


def invoke(prompt: str) -> str:
    try:
        response = client.responses.create(
            model=settings.openai_model_name,
            input=prompt,
        )
        return response.output_text

    except Exception as error:
        raise OpenAIInvokeError("调用AI模型失败") from error


def stream_invoke(prompt: str) -> Generator[str, None, None]:
    try:
        stream = client.responses.create(
            model=settings.openai_model_name,
            input=prompt,
            stream=True,
        )

        for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta

    except Exception as error:
        raise OpenAIInvokeError("调用AI流式模型失败!") from error
