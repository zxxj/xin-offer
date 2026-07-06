import json

# 面试结果json格式解析容错.
def parse_json_from_text(text: str) -> dict:
  cleaned = text.strip()

  if cleaned.startswith("```json"):
    cleaned = cleaned.removeprefix("```json").strip()
  
  if cleaned.startswith("```"):
    cleaned = cleaned.removeprefix("```").strip()

  if cleaned.endswith("```"):
    cleaned = cleaned.removesuffix("```").strip()

  start_index = cleaned.find("{")
  end_index = cleaned.rfind("}")

  if start_index == -1 or end_index == -1:
    raise ValueError("模型的返回结果中没有找到合法的JSON对象.")
  cleaned = cleaned[start_index:end_index + 1]

  return json.loads(cleaned)