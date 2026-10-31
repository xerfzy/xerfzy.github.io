#import "common.typ": *

#show: resume.with(
  subtitle: "Machine Learning Engineer",
  keywords: ("Machine Learning", "PyTorch", "Reinforcement Learning", "TD3", "DQN", "Computer Vision"),
)

Relevant coursework: Machine Learning, Computer Vision, Data Structures and Algorithms.

#section("Summary")
B.Tech AI and ML student working on reinforcement learning and applied ML: a from-scratch TD3 agent with recorded experiments, a pixel-based DQN, image-classification comparisons, explainable retrieval, and on-device LLM inference on Android.

#section("Projects")

#project("TrackMania TD3 - reinforcement learning research", "Python, PyTorch, TMRL, pytest", "Sep 2026", url: repo("thenamelessone888/RL"))[
- Implemented TD3 from scratch on the TMRL real-time framework for TrackMania 2020: twin critics with clipped double-Q targets, delayed policy updates, target policy smoothing and Polyak-averaged targets, on LIDAR and speed observations.
- Recorded and inspected human driving demonstrations (about 5,000 transitions) and behaviour-cloned the actor as a warm start before off-policy training.
- Diagnosed a policy collapse right after critic warm-up and fixed it with TD3+BC-style regularisation toward the cloned actor, with a decaying anchor weight; an extended run then held without collapse but plateaued.
- Root-caused the plateau to a recurring wall collision from deterministic evaluation traces and implemented a stuck-recovery reward penalty; built curriculum-learning stage and promotion tooling and 13 offline pytest tests.
]

#project("Space Shooter DQN (coursework)", "Python, PyTorch, Pygame", "Apr 2026", url: repo("xerfzy/Space_shooter_using_DQN_vc"))[
- Trained a Dueling Double DQN that plays a custom Pygame shooter from raw pixels: four stacked 84x84 grayscale frames into a Nature-DQN CNN with separate value and advantage streams.
- Used a 50,000-transition replay buffer, Huber loss, gradient-norm clipping, epsilon-greedy decay, a periodically synced target network and wave-based reward shaping.
]

#project("XrivenixAI - on-device LLM assistant", "Kotlin, C++, llama.cpp, Room", "Sep 2026", url: repo("xerfzy/XrivenixAI"))[
- Ran quantised GGUF models (1B to 7B, Q4_K_M) on Android CPUs through llama.cpp, with grammar-constrained extraction and KV-cache reuse; measured about 5-6 tokens/s generation for a 3B model on a Snapdragon 782G phone.
- Built hybrid retrieval for a long-term memory: bge-small embeddings, SQLite FTS5 and entity links merged into one score with per-route thresholds, evaluated with on-device retrieval tests and benchmarks.
]

#project("Breast Cancer Histopathology Classification (coursework)", "Python, TensorFlow, Keras", "Nov 2025", url: repo("xerfzy/Breast_cancer_calssification-vc-"))[
- Compared CNN, ResNet, ViT and Swin Transformer classifiers on histopathology images split by magnification (40x to 400x); single-run test accuracy ranged from 0.68 (ResNet) to 0.92 (CNN, Swin).
]

#project("Legal Case Similarity with Explanations", "Python, Sentence-Transformers, FAISS, SHAP, LIME", "Apr 2026", url: repo("xerfzy/xai-v2"))[
- Built a retrieval pipeline with bi-encoder embeddings, FAISS search, cross-encoder reranking and a NetworkX similarity graph, explained with attention weights, SHAP-style token scores and LIME; demonstrated on a small demo corpus with 37 pytest tests.
]

#section("Research")
#patent-entry

#section("Technical Skills")
*Machine learning:* PyTorch, TensorFlow/Keras, reinforcement learning (TD3, DQN, behaviour cloning), CNNs, Vision Transformers, Sentence-Transformers, FAISS, SHAP, LIME, scikit-learn \
*Data and tooling:* Python, NumPy, Pandas, Jupyter, pytest, Git, Linux \
*Other:* C++, Kotlin, llama.cpp, OpenCV, Streamlit
