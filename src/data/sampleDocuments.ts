import { DocumentMeta } from '../types';

export const SAMPLE_DOCUMENTS: DocumentMeta[] = [
  {
    id: 'doc-transformer-paper',
    title: 'Attention Is All You Need',
    filename: 'research_paper.pdf',
    sizeBytes: 2400000,
    sizeFormatted: '2.4 MB',
    pageCount: 11,
    category: 'research',
    description: 'Seminal paper introducing the Transformer architecture, Multi-Head Attention, and self-attention mechanisms without recurrence or convolution.',
    uploadedAt: 'Oct 28, 2026',
    pages: [
      {
        pageNumber: 1,
        text: `Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin.

Abstract:
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.`,
      },
      {
        pageNumber: 2,
        text: `1. Introduction
Recurrent neural networks, long short-term memory (LSTM) and gated recurrent neural networks (GRU) in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures.
Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.
In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.`,
      },
      {
        pageNumber: 3,
        text: `3. Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x_1, ..., x_n) to a sequence of continuous representations z = (z_1, ..., z_n). Given z, the decoder then generates an output sequence (y_1, ..., y_m) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.

Encoder and Decoder Stacks:
Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)). To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension d_model = 512.

Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking ensures that the predictions for position i can depend only on the known outputs at positions less than i.`,
      },
      {
        pageNumber: 4,
        text: `3.2 Attention Mechanisms
An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.

3.2.1 Scaled Dot-Product Attention:
We call our particular attention 'Scaled Dot-Product Attention'. The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values.
In practice, we compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed together into matrices K and V. We compute the matrix of outputs as:
Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.
The two most commonly used attention functions are additive attention and dot-product (multiplicative) attention. Dot-product attention is identical to our algorithm, except for the scaling factor of 1/sqrt(d_k). Dot-product attention is much faster and more space-efficient in practice, since it can be implemented using highly optimized matrix multiplication code.`,
      },
      {
        pageNumber: 5,
        text: `3.2.2 Multi-Head Attention:
Instead of performing a single attention function with d_model-dimensional queries, keys and values, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding d_v-dimensional output values. These are concatenated and once again projected, resulting in the final values.
Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O
where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V).
In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64. Because of the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.`,
      },
      {
        pageNumber: 6,
        text: `3.5 Positional Encoding
Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add 'positional encodings' to the input embeddings at the bottoms of the encoder and decoder stacks.
The positional encodings have the same dimension d_model as the embeddings, so that the two can be summed. There are many choices of positional encodings, learned and fixed. In this work, we use sine and cosine functions of different frequencies:
PE(pos, 2i) = sin(pos / 10000^{2i/d_model})
PE(pos, 2i+1) = cos(pos / 10000^{2i/d_model})
where pos is the position and i is the dimension. We chose this version because it may allow the model to easily learn to attend by relative positions, since for any fixed offset k, PE_{pos+k} can be represented as a linear function of PE_{pos}.`,
      },
      {
        pageNumber: 7,
        text: `4. Why Self-Attention
In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations (x_1, ..., x_n) to another sequence of equal length (z_1, ..., z_n). To motivate our use of self-attention we consider three desiderata:
1. Total computational complexity per layer.
2. The amount of computation that can be parallelized, as measured by the minimum number of sequential operations required.
3. Path length between long-range dependencies in the network. Learning long-range dependencies is a key challenge in many sequence transduction tasks. One key factor affecting the ability to learn such dependencies is the length of the paths forward and backward signals have to traverse in the network.
A self-attention layer connects all positions with a constant number of sequentially executed operations O(1), whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d, which is most often the case with sentence representations used in state-of-the-art models in machine translations.`,
      },
      {
        pageNumber: 8,
        text: `5. Training and Results
On the WMT 2014 English-to-German translation task, the big transformer model (Transformer (big) in Table 2) outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. The configuration of this model is listed in the bottom line of Table 3. Training took 3.5 days on 8 P100 GPUs. Even our base model surpasses all previously published models and ensembles, at a fraction of the training cost.
On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at less than 1/4 the training cost of the previous state-of-the-art model. The Transformer (big) model trained for English-to-French used dropout rate P_drop = 0.1, instead of 0.3.`,
      },
      {
        pageNumber: 9,
        text: `6. Conclusion and Future Directions
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.
For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieve a new state of the art. In the former task our best model outperforms even all previously reported ensembles.
We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text and to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs such as images, audio and video. Making generation less sequential is another research goal of ours.`,
      },
    ],
  },
  {
    id: 'doc-clean-arch',
    title: 'Clean Architecture & Design Patterns',
    filename: 'clean_code_architecture.pdf',
    sizeBytes: 2100000,
    sizeFormatted: '2.1 MB',
    pageCount: 8,
    category: 'engineering',
    description: 'Core principles of Clean Architecture, SOLID design patterns, Dependency Inversion, and hexagonal boundaries.',
    uploadedAt: 'Oct 15, 2026',
    pages: [
      {
        pageNumber: 1,
        text: `Clean Architecture: A Craftsman's Guide to Software Structure
Chapter 1: The Dependency Rule and Concentric Rings.
The overarching rule that makes this architecture work is The Dependency Rule: Source code dependencies must point only inward, toward higher-level policies.
Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something that is declared in an outer circle must not be mentioned by the code in the inner circle. That includes functions, classes, variables, or any other named software entity.
Data formats used in an outer circle should not be used by an inner circle, especially if those formats are generated by a framework in an outer circle. We don't want anything in an outer circle to impact the inner circles.`,
      },
      {
        pageNumber: 2,
        text: `Chapter 2: The Four Architectural Rings.
1. Entities: Entities encapsulate enterprise-wide business rules. An entity can be an object with methods, or it can be a set of data structures and functions. It doesn't matter so long as the entities could be used by many different applications in the enterprise.
2. Use Cases: The software in this layer contains application-specific business rules. It encapsulates and implements all of the use cases of the system. These use cases orchestrate the flow of data to and from the entities, and direct those entities to use their enterprise-wide business rules to achieve the goals of the use case.
3. Interface Adapters: The software in this layer is a set of adapters that convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web. It is this layer, for example, that will wholly contain the MVC architecture of a GUI. The Presenters, Views, and Controllers all belong in here.
4. Frameworks and Drivers: The outermost layer is generally composed of frameworks and tools such as the Database, the Web Framework, etc. Generally you don't write much code in this layer, other than glue code that communicates to the next circle inwards.`,
      },
      {
        pageNumber: 3,
        text: `Chapter 3: Crossing Boundaries and Dependency Inversion.
At the lower right of the diagram is an example of how we cross the circle boundaries. It shows the Controller and Presenter communicating with the Use Case in the next layer. Note the flow of control: It begins in the controller, moves through the use case, and then winds up executing in the presenter.
Note also the source code dependencies: Each points inwards towards the use case.
We usually resolve this apparent contradiction by using the Dependency Inversion Principle. In a language like Java, for example, we would arrange interfaces and inheritance relationships such that the source code dependencies oppose the flow of control at just the right points across the boundary.
For example, consider that the use case needs to call the presenter. However, this call must not be direct because that would violate The Dependency Rule: No name in an outer circle can be mentioned by an inner circle. So we have the use case call an interface in the inner circle (Use Case Output Port), and have the presenter in the outer circle implement it.`,
      },
    ],
  },
  {
    id: 'doc-rag-report',
    title: 'Enterprise RAG & Vector Database Benchmark 2026',
    filename: 'ai_market_forecast_2026.pdf',
    sizeBytes: 3400000,
    sizeFormatted: '3.4 MB',
    pageCount: 14,
    category: 'business',
    description: 'Comprehensive industry analysis comparing dense vector retrieval, hybrid BM25 + vector search, chunking trade-offs, and production RAG evaluation metrics.',
    uploadedAt: 'Nov 01, 2026',
    pages: [
      {
        pageNumber: 1,
        text: `Enterprise Retrieval-Augmented Generation (RAG) Benchmark Report 2026
Executive Summary:
By 2026, 84% of Fortune 500 engineering teams deploy production RAG pipelines for internal documentation, customer support, and code intelligence. The dominant architecture has shifted from naive vector-only lookup to Hybrid Search (Dense Embeddings + BM25 Lexical Search with Cross-Encoder Reranking).
Key Findings:
1. Retrieval Accuracy: Hybrid retrieval achieves 91.4% precision@5 compared to 76.2% for pure vector cosine search, largely due to better handling of acronyms, serial numbers, and exact technical terminology.
2. Chunking Strategy: Recursive character splitting with 400-600 character windows and 15-20% overlap produced the highest answer faithfulness score on complex multi-hop queries.
3. Vector Database Latency: Dedicated vector indexing using HNSW (Hierarchical Navigable Small World) graphs delivers p99 retrieval latency under 12ms for collections up to 50 million embeddings.`,
      },
      {
        pageNumber: 2,
        text: `Section 2: The RAG Triad of Evaluation Metrics
Evaluating RAG pipelines requires decoupling retrieval quality from generation quality. The industry standard RAG Triad consists of:
1. Context Relevance: Are the retrieved chunks truly relevant to the user query? Evaluated by measuring cosine similarity and precision@K over ground-truth documents.
2. Groundedness (Faithfulness): Does the generated response rely strictly on the provided context without hallucinating external facts?
3. Answer Relevance: Does the final answer directly and comprehensively resolve the user's initial question?
Deployments enforcing the RAG Triad reported a 78% reduction in hallucination-related tickets compared to raw LLM prompting.`,
      },
    ],
  },
  {
    id: 'doc-quantum',
    title: 'Quantum Computing Foundations & Qubits',
    filename: 'quantum_computing_notes.pdf',
    sizeBytes: 1800000,
    sizeFormatted: '1.8 MB',
    pageCount: 9,
    category: 'science',
    description: 'Fundamental principles of quantum mechanics applied to computation: state vectors, superposition, entanglement, and quantum logic gates.',
    uploadedAt: 'Sep 20, 2026',
    pages: [
      {
        pageNumber: 1,
        text: `Quantum Computing Foundations
Lecture Notes - Module 1: The Qubit and Superposition.
In classical computing, the fundamental unit of information is the bit, which can exist in one of two distinct states: 0 or 1.
In quantum computing, the analogous unit is the qubit (quantum bit). A qubit can exist in the basis states |0> and |1>, but unlike a classical bit, it can also exist in a linear combination of both states simultaneously, known as a superposition:
|psi> = alpha |0> + beta |1>
where alpha and beta are complex numbers representing probability amplitudes, satisfying the normalization condition: |alpha|^2 + |beta|^2 = 1.
When measured in the computational basis, the qubit collapses to state |0> with probability |alpha|^2 and state |1> with probability |beta|^2. Prior to measurement, the quantum state can undergo unitary transformations that manipulate both amplitudes in parallel.`,
      },
      {
        pageNumber: 2,
        text: `Module 2: Quantum Gates and Entanglement.
Quantum logic gates are represented by unitary matrices. A single-qubit gate is a 2x2 unitary matrix U satisfying U^dagger U = I.
Important single-qubit gates include:
1. The Pauli-X gate: Analogous to the classical NOT gate, it swaps |0> and |1>.
2. The Hadamard gate (H): Creates an equal superposition from a basis state:
H |0> = (|0> + |1>) / sqrt(2)
H |1> = (|0> - |1>) / sqrt(2)
3. The CNOT (Controlled-NOT) gate: A two-qubit gate that flips the target qubit if and only if the control qubit is in state |1>.
Applying a Hadamard gate to a control qubit followed by a CNOT gate produces the maximally entangled Bell state:
|Phi+> = (|00> + |11>) / sqrt(2).
In this state, measuring one qubit immediately determines the state of the other, regardless of the spatial distance separating them.`,
      },
    ],
  },
];
