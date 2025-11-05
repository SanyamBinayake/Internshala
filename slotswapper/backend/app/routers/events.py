from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import get_db
from app.deps import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/", response_model=list[schemas.EventOut])
def get_my_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all events of the current user"""
    events = db.query(models.Event).filter(models.Event.owner_id == current_user.id).all()
    return events


@router.post("/", response_model=schemas.EventOut)
def create_event(
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new event"""
    new_event = models.Event(
        title=payload.title,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status or "BUSY",
        owner_id=current_user.id,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@router.put("/{event_id}", response_model=schemas.EventOut)
def update_event(
    event_id: int,
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update an existing event"""
    event = db.query(models.Event).filter(
        models.Event.id == event_id, 
        models.Event.owner_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )

    # Update event fields
    event.title = payload.title
    event.start_time = payload.start_time
    event.end_time = payload.end_time
    event.status = payload.status or "BUSY"
    
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete an event"""
    event = db.query(models.Event).filter(
        models.Event.id == event_id, 
        models.Event.owner_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}