import axiosInstance from "./AxiosInstance";

export const AIEndpoint = {
  uploadMeal: async (
    userId: string,
    mealImageFile: { uri: string; name: string; type: string },
  ) => {
    const formData = new FormData();
    formData.append("UserId", userId);
    
    formData.append("MealImage", {
      uri: mealImageFile.uri,
      name: mealImageFile.name || 'meal.jpg',
      type: mealImageFile.type || 'image/jpeg',
    } as any);
    
    try {
      const response = await axiosInstance.post('/api/AI/UploadMeal', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000, 
      });
      
      console.log('AI Response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Error uploading meal:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  },

  askChat: async (question: string) => {
    try {
      const response = await axiosInstance.post('/api/AI/AskChat', {
        Question: question,
      }, {
        timeout: 60000, 
      });
      
      console.log('Chat Response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Error asking chat:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  },

  askChatStream: async (question: string, onChunk: (chunk: string) => void) => {
    try {
      console.log('Starting chat stream request...');
      
      // Get token from secure storage
      const { GetToken } = await import('./AxiosInstance');
      const token = await GetToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const baseURL = axiosInstance.defaults.baseURL;
      const url = `${baseURL}/api/AI/AskChat`;
      
      console.log('Streaming to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ Question: question }),
      });

      console.log('Stream response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stream response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      console.log('Stream response received, processing...');
      
      // Read the stream using ReadableStream API
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed');
          break;
        }

        // Decode chunk and append to buffer
        const chunk = decoder.decode(value, { stream: true });
        console.log('Raw chunk received:', chunk);
        buffer += chunk;

        // Try to parse complete JSON objects from buffer
        // Backend sends JSON objects separated by newlines
        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          console.log('Processing line:', trimmedLine);

          // Handle SSE format with "data: " prefix
          let jsonStr = trimmedLine;
          if (trimmedLine.startsWith('data: ')) {
            jsonStr = trimmedLine.substring(6);
          }
          
          // Skip non-JSON lines
          if (!jsonStr.startsWith('{')) {
            console.log('Skipping non-JSON line:', jsonStr);
            continue;
          }

          try {
            const jsonData = JSON.parse(jsonStr);
            console.log('Parsed JSON type:', jsonData.type);
            
            // Check for text delta chunks
            if (jsonData.type === 'response.output_text.delta' && jsonData.delta) {
              console.log('>>> DELTA TEXT:', jsonData.delta);
              onChunk(jsonData.delta);
            }
            
            // Check for completed text (contains full HTML)
            if (jsonData.type === 'response.output_text.done' && jsonData.text) {
              console.log('>>> COMPLETE TEXT:', jsonData.text);
              // Don't send - already sent via deltas
            }
            
            // Check for completion
            if (jsonData.type === 'response.completed') {
              console.log('>>> STREAM FINISHED');
              return { answer: 'Stream completed' };
            }
          } catch (parseError) {
            console.log('JSON parse error for line:', jsonStr, parseError);
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        console.log('Processing remaining buffer:', buffer);
      }

      return { answer: 'Stream completed' };

    } catch (error: any) {
      console.error('[askChatStream] Error:', error);
      throw error;
    }
  },
};