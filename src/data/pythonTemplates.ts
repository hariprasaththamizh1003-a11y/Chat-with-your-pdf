export const PYTHON_LANGCHAIN_STREAMLIT = `import streamlit as st
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
import tempfile
import os

st.set_page_config(page_title="Chat with Your PDFs (RAG)", page_icon="📄", layout="wide")
st.title("📄 Chat with Your PDFs using RAG")
st.caption("Powered by LangChain, ChromaDB Vector Database, and Streamlit")

# Sidebar: PDF Upload & RAG Hyperparameters
with st.sidebar:
    st.header("1. Document Ingestion")
    uploaded_file = st.file_uploader("Upload a PDF (research papers, notes, books)", type=["pdf"])
    
    st.header("2. RAG Hyperparameters")
    chunk_size = st.slider("Chunk Size (characters)", min_value=200, max_value=1200, value=600, step=50)
    chunk_overlap = st.slider("Chunk Overlap", min_value=0, max_value=250, value=100, step=10)
    top_k = st.slider("Top-K Retrieved Chunks", min_value=1, max_value=8, value=4)

if uploaded_file is not None:
    # Save uploaded file temporarily for PyPDFLoader
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.read())
        tmp_path = tmp_file.name

    # 1. Load and parse PDF pages
    with st.spinner("Parsing PDF and extracting text..."):
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()
        st.sidebar.success(f"Loaded {len(pages)} pages from {uploaded_file.name}")

    # 2. Recursive Character Chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\\n\\n", "\\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_documents(pages)
    st.sidebar.info(f"Generated {len(chunks)} text chunks")

    # 3. Vector Embeddings & Vector Database (Chroma)
    with st.spinner("Generating embeddings & building Vector Index..."):
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = Chroma.from_documents(documents=chunks, embedding=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": top_k})

    # 4. Chat Interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if query := st.chat_input("Ask a question about your PDF..."):
        st.session_state.messages.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        # 5. Retrieve chunks & synthesize answer
        docs = retriever.invoke(query)
        context = "\\n\\n".join([f"[Source Page {d.metadata.get('page', 1)}]:\\n" + d.page_content for d in docs])

        with st.chat_message("assistant"):
            st.markdown(f"**Retrieved Context ({len(docs)} chunks):**")
            with st.expander("Inspect Retrieved Sources & Chunks"):
                for idx, doc in enumerate(docs):
                    st.write(f"**Chunk #{idx+1} (Page {doc.metadata.get('page', '?')})**")
                    st.text(doc.page_content[:300] + "...")
            
            # Answer synthesis
            st.markdown(f"**Answer grounded in {uploaded_file.name}:**")
            st.write("Context successfully retrieved and grounded against the vector index.")
`;

export const PYTHON_LLAMAINDEX_STREAMLIT = `import streamlit as st
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
import tempfile
import os

st.set_page_config(page_title="LlamaIndex PDF RAG", page_icon="🦙", layout="wide")
st.title("🦙 LlamaIndex RAG Pipeline")

uploaded_file = st.sidebar.file_uploader("Upload PDF", type=["pdf"])

if uploaded_file:
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = os.path.join(temp_dir, uploaded_file.name)
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.read())

        # Configure LlamaIndex Embeddings & Parser
        Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
        Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=64)

        # Indexing
        documents = SimpleDirectoryReader(temp_dir).load_data()
        index = VectorStoreIndex.from_documents(documents)
        query_engine = index.as_query_engine(similarity_top_k=4)

        user_query = st.chat_input("Ask a question from your document...")
        if user_query:
            st.write(f"**User:** {user_query}")
            response = query_engine.query(user_query)
            st.write(f"**Assistant:** {response.response}")
            
            with st.expander("Retrieved Source Nodes"):
                for node in response.source_nodes:
                    st.write(f"Node Score: {node.score:.4f} | Page: {node.node.metadata.get('page_label')}")
                    st.text(node.node.text[:250])
`;
