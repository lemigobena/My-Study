from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import spacy
from typing import List, Optional
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import torch

app = FastAPI()

# 1. LOAD SPACY (for key point extraction & fallback)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# 2. LOAD SUMMARIZER (DistilBART)
try:
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    print("Summarizer loaded.")
except Exception as e:
    print(f"Error loading summarizer model: {e}")
    summarizer = None

# 3. LOAD QUESTION GENERATOR (T5-Small)
# We use a small, fine-tuned T5 model for QG to keep it lightweight-ish
try:
    qg_model_name = "mrm8488/t5-base-finetuned-question-generation-ap"
    # Using t5-base might be heavy, let's try. If it crashes, we might need a smaller one.
    # Actually, let's stick to a known working small one or base. Base is ~800MB. 
    # Let's use valhalla/t5-small-qg-hl if possible, but mrm8488 is simpler to use (answer aware).
    # To be safe on resource, let's try the base one, but handle OOM.
    qg_tokenizer = AutoTokenizer.from_pretrained(qg_model_name, legacy=False)
    qg_model = AutoModelForSeq2SeqLM.from_pretrained(qg_model_name)
    print("QG Model loaded.")
except Exception as e:
    print(f"Error loading QG model: {e}")
    qg_model = None
    qg_tokenizer = None

class TextRequest(BaseModel):
    text: str

class QuestionRequest(BaseModel):
    text: str
    num_questions: int = 5

@app.get("/")
def read_root():
    return {"status": "ML Service Running (v2: Rich Summary + T5 QG)"}

@app.post("/summarize")
def summarize(request: TextRequest):
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is empty")
    
    response_data = {"summary": "", "title": ""}
    
    # A. GENERATE TITLE (Extractive/Heuristic)
    # Simple strategy: Most frequent noun chunk or just the first sentence if short
    doc = nlp(text)
    if len(list(doc.sents)) > 0:
        # Use the first sentence key phrase or just first few words
        # Let's try to find the most "central" noun chunk
        noun_chunks = list(doc.noun_chunks)
        if noun_chunks:
            # Pick the most frequent noun chunk (basic topic modeling)
            chunk_counts = {}
            for chunk in noun_chunks:
                clean_chunk = chunk.text.lower()
                if clean_chunk not in nlp.Defaults.stop_words:
                    chunk_counts[clean_chunk] = chunk_counts.get(clean_chunk, 0) + 1
            
            if chunk_counts:
                best_topic = max(chunk_counts, key=chunk_counts.get)
                response_data["title"] = best_topic.title()
            else:
                response_data["title"] = "Study Note"
        else:
             response_data["title"] = "Study Note"
    
    # B. GENERATE ABSTRACTIVE SUMMARY
    main_summary = ""
    if summarizer:
        try:
            input_len = len(text.split())
            max_len =  min(400, max(60, int(input_len * 0.7)))
            min_len = min(150, max(30, int(input_len * 0.3)))
            
            summary_result = summarizer(text, max_length=max_len, min_length=min_len, do_sample=False, truncation=True)
            main_summary = summary_result[0]['summary_text']
            
            # Trim incomplete sentence
            if main_summary and main_summary[-1] not in ['.', '!', '?']:
                last_punct = max(main_summary.rfind('.'), main_summary.rfind('!'), main_summary.rfind('?'))
                if last_punct != -1:
                    main_summary = main_summary[:last_punct+1]
        except Exception as e:
            print(f"Summarizer failed: {e}")
            main_summary = "Error generating main summary."

    # C. EXTRACT KEY POINTS (Bullet points)
    # Using simple extractive summarization (frequency based) for key points
    key_points = []
    word_frequencies = {}
    for word in doc:
        if not word.is_stop and not word.is_punct:
            word_frequencies[word.text] = word_frequencies.get(word.text, 0) + 1
    
    if word_frequencies:
        max_freq = max(word_frequencies.values())
        for word in word_frequencies:
            word_frequencies[word] /= max_freq
            
        sentence_scores = {}
        for sent in doc.sents:
            for word in sent:
                if word.text in word_frequencies:
                    sentence_scores[sent] = sentence_scores.get(sent, 0) + word_frequencies[word.text]
        
        import heapq
        # Get top 3-5 sentences for bullets
        summary_sentences = heapq.nlargest(5, sentence_scores, key=sentence_scores.get)
        key_points = [sent.text.strip() for sent in summary_sentences]

    # D. FORMAT FINAL OUTPUT (Markdown)
    formatted_output = f"### Executive Summary\n{main_summary}\n\n### Key Concepts\n"
    for point in key_points:
        formatted_output += f"- {point}\n"
        
    response_data["summary"] = formatted_output
    
    return response_data

@app.post("/generate-questions")
def generate_questions(request: QuestionRequest):
    text = request.text
    num = request.num_questions
    questions = []
    
    # Function to run T5 generation
    def get_question(answer, context, max_length=64):
        if not qg_model: return None
        input_text = "answer: %s  context: %s </s>" % (answer, context)
        features = qg_tokenizer([input_text], return_tensors='pt')
        output = qg_model.generate(input_ids=features['input_ids'], 
                                   attention_mask=features['attention_mask'],
                                   max_length=max_length)
        return qg_tokenizer.decode(output[0], skip_special_tokens=True)

    # 1. EXTRACT POTENTIAL ANSWERS (Candidates) via SpaCy
    # We look for Noun Chunks and Named Entities as good answers
    doc = nlp(text)
    candidates = []
    # Entities are great answers
    for ent in doc.ents:
        if len(ent.text) > 3:
            candidates.append(ent.text)
            
    # Noun chunks are also good
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 4 and len(chunk.text) > 4: # Not too long
            if chunk.text not in candidates:
                candidates.append(chunk.text)
    
    # Shuffle and limit
    random.shuffle(candidates)
    candidates = candidates[:num*2] # Take more than needed to filter
    
    # 2. GENERATE QUESTIONS WITH T5
    if qg_model and candidates:
        for ans in candidates:
             if len(questions) >= num: break
             question_text = get_question(ans, text)
             
             # Filter bad questions
             if "question:" in question_text: 
                 question_text = question_text.replace("question:", "").strip()
             
             if len(question_text) < 10: continue # Too short
             
             # Generate Distractors (random other candidates)
             distractors = [c for c in candidates if c != ans]
             random.shuffle(distractors)
             opts = [ans] + distractors[:3]
             random.shuffle(opts)
             
             questions.append({
                 "questionText": question_text,
                 "options": opts,
                 "correctAnswer": ans
             })
    
    # 3. FALLBACK (If T5 fails or yields 0 questions)
    if len(questions) < num:
        # Use old definition logic for remaining
        rem_needed = num - len(questions)
        
        def find_definitions(doc):
            defs = []
            for sent in doc.sents:
                if " is " in sent.text and len(sent.text.split()) < 20: defs.append(sent)
            return defs
        
        definitions = find_definitions(doc)
        for sent in definitions:
            if len(questions) >= num: break
            parts = sent.text.split(" is ")
            if len(parts) == 2:
                term = parts[0].strip()
                defn = parts[1].strip().strip('.')
                if len(term.split()) <= 3:
                    questions.append({
                        "questionText": f"Concept check: What refers to '{defn}'?",
                        "options": [term, "Other"],
                        "correctAnswer": term
                    })

    return {"questions": questions[:num]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
