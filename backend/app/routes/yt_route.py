from fastapi import APIRouter, Path, HTTPException
from app.services.youtube import IndexingTranscript, chatlmm, vector_store
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Question to ask the AI"
    )


router = APIRouter(
    prefix="/youtube",
    tags=["Youtube"]
)
@router.post("/chatllm")
def chat_model(data:ChatRequest):
    result = chatlmm(data.query)
    return result

@router.post("/{id}")
def add_transcript(id:str = Path(..., description='Youtube video unique id', example='7aEAS5E5vjg')):
    try:
        presentIds = vector_store.get(where={'video_id':id})
        if presentIds['ids']:
            return {'message':'Transcript is already present.'}

        existingIds = vector_store.get()['ids']
        if existingIds:
            vector_store.delete(ids=existingIds)
        IndexingTranscript(id)
        return {'message':'Transcript is added.'}

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )



