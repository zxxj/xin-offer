
from app.models.interview import Interview
from app.db.session import SessionLocal
from uuid import uuid4
from datetime import datetime

db = SessionLocal()

try:
  interview = Interview(
    id=str(uuid4()),
    target_role="后端开发",
    tech_stack="react,vue",
    experience_years=4,
    difficulty="middle",
    status="in_progress",
    current_round=2,
    created_at=datetime.now(),
    updated_at=datetime.now()
  )

  db.add(interview)
  db.commit()

  print("创建:", interview.id)
finally:
  db.close()