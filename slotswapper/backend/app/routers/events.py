from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/events", tags=["events"])


# ✅ 1. Get all events of the current user
@router.get("/")
def get_my_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    events = db.query(models.Event).filter(models.Event.owner_id == current_user.id).all()
    return events


# ✅ 2. Create a new event
@router.post("/")
def create_event(
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_event = models.Event(
        title=payload.title,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status,
        owner_id=current_user.id,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


# ✅ 3. Update an event
@router.put("/{event_id}")
def update_event(
    event_id: int,
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    event = db.query(models.Event).filter(
        models.Event.id == event_id, models.Event.owner_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    event.title = payload.title
    event.start_time = payload.start_time
    event.end_time = payload.end_time
    event.status = payload.status
    db.commit()
    db.refresh(event)
    return event


# ✅ 4. Delete an event
@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    event = db.query(models.Event).filter(
        models.Event.id == event_id, models.Event.owner_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
