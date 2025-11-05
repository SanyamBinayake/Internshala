from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter(prefix="/swap", tags=["Swap"])


# ✅ 1️⃣ Fetch all available swappable slots except current user's
@router.get("/swappable-slots")
def get_swappable_slots(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    slots = db.query(models.Event).filter(
        models.Event.status == "SWAPPABLE",
        models.Event.owner_id != current_user.id
    ).all()
    return slots


# ✅ 2️⃣ Create a swap request
@router.post("/request")
def create_swap_request(payload: schemas.SwapRequestCreate, db: Session = Depends(get_db),
                        current_user: models.User = Depends(get_current_user)):
    my_slot = db.query(models.Event).filter(models.Event.id == payload.mySlotId).first()
    their_slot = db.query(models.Event).filter(models.Event.id == payload.theirSlotId).first()

    if not my_slot or not their_slot:
        raise HTTPException(status_code=404, detail="One of the slots not found")

    if my_slot.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only swap your own slots")

    # Create swap request
    swap = models.SwapRequest(
        requester_id=current_user.id,
        responder_id=their_slot.owner_id,
        my_slot_id=my_slot.id,
        their_slot_id=their_slot.id,
    )

    db.add(swap)
    db.commit()
    db.refresh(swap)
    return {"message": "Swap request created", "id": swap.id}


# ✅ 3️⃣ Get all swap requests for the logged-in user
@router.get("/requests")
def get_swap_requests(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    requests = db.query(models.SwapRequest).filter(
        (models.SwapRequest.requester_id == current_user.id) |
        (models.SwapRequest.responder_id == current_user.id)
    ).all()
    return requests


# ✅ 4️⃣ Accept or reject a swap
@router.post("/respond/{request_id}")
def respond_swap(request_id: int, payload: schemas.SwapResponse,
                 db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    swap = db.query(models.SwapRequest).filter(models.SwapRequest.id == request_id).first()
    if not swap:
        raise HTTPException(status_code=404, detail="Swap request not found")

    if swap.responder_id != current_user.id:
        raise HTTPException(status_code=403, detail="You cannot respond to this request")

    if payload.accept:
        # Perform the swap
        my_event = db.query(models.Event).filter(models.Event.id == swap.my_slot_id).first()
        their_event = db.query(models.Event).filter(models.Event.id == swap.their_slot_id).first()

        # Swap ownership
        my_owner = my_event.owner_id
        my_event.owner_id = their_event.owner_id
        their_event.owner_id = my_owner

        swap.status = "ACCEPTED"
        my_event.status = "BUSY"
        their_event.status = "BUSY"
    else:
        swap.status = "REJECTED"

    db.commit()
    return {"message": f"Swap {swap.status.lower()} successfully"}
