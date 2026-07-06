
from openai import OpenAI
from app.core.config import settings

# 统一异常.
class OpenAIInvokeError(Exception):
  pass

# 检查环境文件中name,model,baseurl是否全部存在.
settings.validate_openai_config()

client = OpenAI(
  api_key=settings.openai_api_key,
  base_url=settings.openai_base_url
)

def invoke(prompt: str) -> str:

  try:
    response = client.responses.create(
      model=settings.openai_model_name, 
      input=prompt
    )
    return response.output_text

  except Exception as error:
    raise OpenAIInvokeError("调用AI模型失败") from error

