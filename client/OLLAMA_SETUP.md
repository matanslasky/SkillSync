# Ollama Setup Instructions

## Install Ollama

1. **Download Ollama:**
   - Windows: https://ollama.com/download/windows
   - Run the installer

2. **Start Ollama:**
   `powershell
   ollama serve
   `

3. **Pull the model (in a new terminal):**
   `powershell
   ollama pull llama3.2
   `

4. **Test it works:**
   `powershell
   ollama run llama3.2 "Hello"
   `

5. **Start your app:**
   `powershell
   npm run dev
   `

## Alternative Models

If llama3.2 is too large, try smaller models:
- ollama pull llama3.2:1b (1.3 GB, fastest)
- ollama pull phi3 (2.3 GB, good quality)
- ollama pull mistral (4.1 GB, better quality)

Update VITE_OLLAMA_MODEL in .env to match your choice.

## Benefits

✅ Free forever
✅ No API keys needed
✅ No rate limits
✅ Runs offline
✅ Privacy - your data stays local
