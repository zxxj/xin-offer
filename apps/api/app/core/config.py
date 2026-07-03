import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
  openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
  openai_model_name: str = os.getenv("OPENAI_MODEL_NAME", "qwen3.7-max")
  openai_base_url:str | None = os.getenv("OPENAI_BASE_URL")

  def validate_openai_config(self) -> None:
    if not self.openai_api_key:
      raise ValueError("未读取到OPENAI_API_KEY")

settings = Settings()
