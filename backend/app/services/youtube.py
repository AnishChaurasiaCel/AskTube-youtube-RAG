import os
from langchain_ollama import ChatOllama,OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.runnables import RunnableParallel, RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
You are an AI assistant that answers questions about YouTube video transcripts.

Your task is to answer the user's question using ONLY the information provided in the context below.

### Rules:
1. Use only the provided context to answer the question.
2. Do not use your own knowledge or make assumptions.
3. If the answer cannot be found in the context, clearly say:
   "I couldn't find the answer in the provided video transcript."
4. Give a direct and concise answer.
5. When the context contains relevant details, explain them clearly rather than simply copying the text.
6. If the question is ambiguous, explain what can and cannot be determined from the transcript.

### Context:
{context}

### User Question:
{question}

### Answer:
""")

llm = ChatOllama(
    model="gemma2:2b"
)

# embedding model
embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

parser = StrOutputParser()

CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'chroma_db')

youtubeAPI = YouTubeTranscriptApi()

vector_store = Chroma(
    collection_name="yt_transcript",
    persist_directory=CHROMA_DIR,
    embedding_function=embeddings
    )

# function for loading, splitting and embedding the transcript...
def IndexingTranscript(videoId):

    # loadig the transcript from the youtube
    try:
        transcript = youtubeAPI.fetch(videoId).to_raw_data()
        full_transcript = ' '.join(item['text'] for item in transcript)

    except TranscriptsDisabled:
        raise ValueError(
            "Transcripts are disabled for this video."
        )

    except NoTranscriptFound:
        raise ValueError(
            "No transcript was found for this video."
        )

    # splitting the full transcipt
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1000,
        chunk_overlap=200
        )

    chunks = splitter.create_documents([full_transcript])
    # adding videoId in metadata
    updatedChunks = []
    for doc in chunks:
        updatedChunks.append(
        Document(
            page_content=doc.page_content,
            metadata={
                "video_id": videoId
            }
        )
    )

    # add to vector store.
    vector_store.add_documents(updatedChunks)

# retrieving
def format_document(retriever_doc):
    context = ' '.join(text.page_content for text in retriever_doc)
    return context


retriever = vector_store.as_retriever(
    search_kwargs={"k":3}
    )

parallel_chain = RunnableParallel(
    {
        'context': retriever | RunnableLambda(format_document),
        'question': RunnablePassthrough()
    }
)

def chatlmm(query):
    chain = parallel_chain | prompt | llm | parser
    result = chain.invoke(query)
    return result

