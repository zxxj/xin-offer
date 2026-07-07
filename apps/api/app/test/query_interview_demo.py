
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.interview import Interview

db = SessionLocal()

try:
  stmt = select(Interview).order_by(Interview.created_at.desc())
  interviews = db.execute(stmt).scalars().all()

  for interview in interviews:
    print(
      interview.id,
      interview.target_role,
      interview.tech_stack,
      interview.current_round,
      interview.status
    )
finally:
  db.close()